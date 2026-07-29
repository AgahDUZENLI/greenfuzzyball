from fastapi import APIRouter, Depends, HTTPException, status
from datetime import date as _date, datetime, time as _time
import psycopg2.extras

from db.connection import get_db
from models.schemas import (
    AddChildRequest,
    ChildResponse,
    UpdateChildRequest,
    JoinRequestResponse,
    JoinByCodeRequest,
    SessionRequestCreate,
    SessionRequestResponse,
    CancelSessionRequest
)
from middleware.auth_middleware import get_current_user
from services.notification_service import create_notification

router = APIRouter()


# ─── GET MEMBER PROFILE ───────────────────────────────────────────────────────

@router.get("/me")
def get_member_profile(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT u.user_id, u.name, u.email, u.phone, u.location, u.age,
                   u.created_at, m.notes
            FROM users u
            JOIN members m ON u.user_id = m.user_id
            WHERE u.user_id = %s
        """, (str(current_user["user_id"]),))

        member = cursor.fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        return member


# ─── UPDATE MEMBER PROFILE ───────────────────────────────────────────────────

@router.put("/me")
def update_member_profile(
    data: dict,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE users SET name = %s, email = %s, phone = %s, location = %s, age = %s
                WHERE user_id = %s
            """, (
                data.get("name"),
                data.get("email"),
                data.get("phone"),
                data.get("location"),
                data.get("age"),
                str(current_user["user_id"])
            ))
            cursor.execute("""
                UPDATE members SET notes = %s
                WHERE user_id = %s
            """, (
                data.get("notes"),
                str(current_user["user_id"])
            ))
            conn.commit()

            cursor.execute("""
                SELECT u.user_id, u.name, u.email, u.phone, u.location,
                       u.created_at, m.notes
                FROM users u
                JOIN members m ON u.user_id = m.user_id
                WHERE u.user_id = %s
            """, (str(current_user["user_id"]),))
            return cursor.fetchone()
    except Exception as e:
        conn.rollback()
        print(f"UPDATE MEMBER PROFILE ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile"
        )


# ─── ADD CHILD ────────────────────────────────────────────────────────────────

@router.post("/children", status_code=201)
def add_child(
    data: AddChildRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Create student user record for child (no login)
            cursor.execute("""
                INSERT INTO users (name, phone, age, role)
                VALUES (%s, %s, %s, 'student')
                RETURNING user_id
            """, (data.name, data.phone or None, data.age))

            child_user = cursor.fetchone()
            child_id = str(child_user["user_id"])

            cursor.execute("""
                INSERT INTO students (user_id, level, notes)
                VALUES (%s, %s, %s)
            """, (child_id, data.level, data.notes or None))

            # Link child to member
            cursor.execute("""
                INSERT INTO member_children (member_id, student_id)
                VALUES (%s, %s)
            """, (str(current_user["user_id"]), child_id))

            conn.commit()

            cursor.execute("""
                SELECT u.user_id, u.name, u.phone, u.age,
                       s.level, s.notes
                FROM users u
                JOIN students s ON u.user_id = s.user_id
                WHERE u.user_id = %s
            """, (child_id,))

            return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"ADD CHILD ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not add child"
        )


# ─── GET CHILDREN ─────────────────────────────────────────────────────────────

@router.get("/children")
def get_children(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT u.user_id, u.name, u.phone, u.age,
                   s.level, s.notes,
                   (SELECT coach_id FROM coach_students WHERE student_id = s.user_id LIMIT 1) AS coach_id,
                   (SELECT u2.name FROM coach_students cs JOIN users u2 ON u2.user_id = cs.coach_id
                    WHERE cs.student_id = s.user_id LIMIT 1) AS coach_name
            FROM users u
            JOIN students s ON u.user_id = s.user_id
            JOIN member_children mc ON s.user_id = mc.student_id
            WHERE mc.member_id = %s
        """, (str(current_user["user_id"]),))
        return cursor.fetchall()


# ─── UPDATE CHILD ─────────────────────────────────────────────────────────────

@router.put("/children/{child_id}")
def update_child(
    child_id: str,
    data: UpdateChildRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Verify child belongs to this member
            cursor.execute("""
                SELECT 1 FROM member_children
                WHERE member_id = %s AND student_id = %s
            """, (str(current_user["user_id"]), child_id))

            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Child not found")

            if any([data.name, data.phone, data.age is not None]):
                cursor.execute("""
                    UPDATE users SET
                        name = COALESCE(%s, name),
                        phone = COALESCE(%s, phone),
                        age = COALESCE(%s, age)
                    WHERE user_id = %s
                """, (data.name, data.phone, data.age, child_id))

            if any([data.level, data.notes]):
                cursor.execute("""
                    UPDATE students SET
                        level = COALESCE(%s, level),
                        notes = COALESCE(%s, notes)
                    WHERE user_id = %s
                """, (data.level, data.notes, child_id))

            cursor.execute("""
                SELECT u.user_id, u.name, u.phone, u.age,
                       s.level, s.notes,
                       (SELECT coach_id FROM coach_students WHERE student_id = s.user_id LIMIT 1) AS coach_id,
                       (SELECT u2.name FROM coach_students cs JOIN users u2 ON u2.user_id = cs.coach_id
                        WHERE cs.student_id = s.user_id LIMIT 1) AS coach_name
                FROM users u
                JOIN students s ON u.user_id = s.user_id
                WHERE u.user_id = %s
            """, (child_id,))

            conn.commit()
            return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"UPDATE CHILD ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update child"
        )


# ─── DELETE CHILD ─────────────────────────────────────────────────────────────

@router.delete("/children/{child_id}", status_code=204)
def delete_child(
    child_id: str,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor() as cursor:

            # Verify child belongs to this member
            cursor.execute("""
                SELECT 1 FROM member_children
                WHERE member_id = %s AND student_id = %s
            """, (str(current_user["user_id"]), child_id))

            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Child not found")

            # Find sessions where this child is the only participant
            cursor.execute("""
                SELECT ss.session_id
                FROM session_students ss
                WHERE ss.student_id = %s
                  AND NOT EXISTS (
                      SELECT 1 FROM session_students ss2
                      WHERE ss2.session_id = ss.session_id AND ss2.student_id != %s
                  )
            """, (child_id, child_id))

            solo_session_ids = [row[0] for row in cursor.fetchall()]

            # Delete those sessions entirely (cascades to session_students,
            # session_drills, session_drill_ratings)
            if solo_session_ids:
                cursor.execute("""
                    DELETE FROM sessions WHERE session_id = ANY(%s::uuid[])
                """, (solo_session_ids,))

            # Delete user (cascades to students and member_children)
            cursor.execute("""
                DELETE FROM users WHERE user_id = %s
            """, (child_id,))

            conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"DELETE CHILD ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete child"
        )


# ─── ADD COACH BY CODE ───────────────────────────────────────────────────────

@router.post("/join-by-code", status_code=201)
def join_coach_by_code(
    data: JoinByCodeRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            cursor.execute("""
                SELECT user_id FROM coaches WHERE code = %s
            """, (data.code.strip(),))
            coach = cursor.fetchone()
            if not coach:
                raise HTTPException(status_code=404, detail="Invalid coach code")

            coach_id = str(coach["user_id"])

            # Already connected or already waiting on approval?
            cursor.execute("""
                SELECT status FROM coach_join_requests
                WHERE member_id = %s AND coach_id = %s AND status IN ('approved', 'pending')
            """, (str(current_user["user_id"]), coach_id))
            existing = cursor.fetchone()
            if existing:
                detail = (
                    "You're already connected with this coach"
                    if existing["status"] == "approved"
                    else "You already have a pending request with this coach"
                )
                raise HTTPException(status_code=400, detail=detail)

            # Entering the code sends a join request — the coach still approves it
            cursor.execute("""
                INSERT INTO coach_join_requests (member_id, coach_id)
                VALUES (%s, %s)
                RETURNING request_id, member_id, coach_id, status, notes, created_at
            """, (str(current_user["user_id"]), coach_id))
            request = cursor.fetchone()

            cursor.execute("SELECT name FROM users WHERE user_id = %s", (coach_id,))
            coach_user = cursor.fetchone()

            create_notification(
                cursor, coach_id,
                f"{current_user['name']} wants to join as a client",
                notification_type="join_request"
            )

            conn.commit()
            return {**request, "coach_name": coach_user["name"]}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"JOIN BY CODE ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not add coach"
        )


# ─── GET MY JOIN REQUESTS ────────────────────────────────────────────────────

@router.get("/join-requests")
def get_my_join_requests(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT r.request_id, r.member_id, r.coach_id, r.status, r.notes, r.created_at,
                   u.name as coach_name
            FROM coach_join_requests r
            JOIN users u ON r.coach_id = u.user_id
            WHERE r.member_id = %s
            ORDER BY r.created_at DESC
        """, (str(current_user["user_id"]),))
        return cursor.fetchall()


# ─── REMOVE A COACH LINK ──────────────────────────────────────────────────────

@router.delete("/join-requests/{request_id}", status_code=204)
def remove_coach(
    request_id: str,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            cursor.execute("""
                SELECT coach_id FROM coach_join_requests
                WHERE request_id = %s AND member_id = %s
            """, (request_id, str(current_user["user_id"])))

            request = cursor.fetchone()
            if not request:
                raise HTTPException(status_code=404, detail="Join request not found")

            cursor.execute("""
                DELETE FROM coach_students WHERE coach_id = %s AND student_id = %s
            """, (str(request["coach_id"]), str(current_user["user_id"])))

            cursor.execute("""
                DELETE FROM coach_join_requests WHERE request_id = %s
            """, (request_id,))

            conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"REMOVE COACH ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not remove coach"
        )


# ─── REQUEST A SESSION ────────────────────────────────────────────────────────

@router.post("/session-requests", status_code=201)
def request_session(
    data: SessionRequestCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO session_requests
                (member_id, coach_id, student_id, requested_date, requested_time, notes)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING request_id, member_id, coach_id, student_id,
                          requested_date, requested_time, status, notes, created_at
            """, (
                str(current_user["user_id"]),
                str(data.coach_id),
                str(data.student_id),
                data.requested_date,
                data.requested_time,
                data.notes or None
            ))

            request = cursor.fetchone()

            create_notification(
                cursor, data.coach_id,
                f"{current_user['name']} requested a session on {data.requested_date}",
                notification_type="session_request"
            )

            conn.commit()
            return request

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not request session"
        )


# ─── GET MY SESSION REQUESTS ──────────────────────────────────────────────────

@router.get("/session-requests")
def get_my_session_requests(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT sr.request_id, sr.coach_id, sr.member_id, sr.student_id,
                   sr.requested_date, sr.requested_time, sr.status, sr.notes, sr.created_at,
                   cu.name AS coach_name, su.name AS student_name
            FROM session_requests sr
            JOIN users cu ON sr.coach_id = cu.user_id
            JOIN users su ON sr.student_id = su.user_id
            WHERE sr.member_id = %s
            ORDER BY sr.created_at DESC
        """, (str(current_user["user_id"]),))
        return cursor.fetchall()


# ─── GET MY SESSIONS ─────────────────────────────────────────────────────────

@router.get("/sessions")
def get_member_sessions(
    student_id: str = None,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

        # Default to own sessions if member is also a student
        sid = student_id or str(current_user["user_id"])

        cursor.execute("""
            SELECT
                s.session_id, s.date, s.start_time, s.duration_minutes,
                s.type, s.notes, s.created_at, s.status, s.cancellation_reason,
                c.name as court_name, c.area as court_area,
                u.name as coach_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'drill_id', d.drill_id,
                            'name', d.name,
                            'rating', sdr.rating
                        )
                    ) FILTER (WHERE d.drill_id IS NOT NULL),
                    '[]'
                ) as drills
            FROM sessions s
            JOIN session_students ss ON s.session_id = ss.session_id
            LEFT JOIN courts c ON s.court_id = c.court_id
            LEFT JOIN users u ON s.coach_id = u.user_id
            LEFT JOIN session_drills sd ON s.session_id = sd.session_id
            LEFT JOIN drills d ON sd.drill_id = d.drill_id
            LEFT JOIN session_drill_ratings sdr ON
                sdr.session_id = s.session_id AND
                sdr.drill_id = d.drill_id AND
                sdr.student_id = %s
            WHERE ss.student_id = %s
            GROUP BY s.session_id, c.name, c.area, u.name
            ORDER BY s.date DESC
        """, (sid, sid))

        return cursor.fetchall()


# ─── GET ONE SESSION (detail + drills + ratings, read-only) ─────────────────

@router.get("/sessions/{session_id}")
def get_member_session_detail(
    session_id: str,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT
                s.session_id, s.date, s.start_time, s.duration_minutes,
                s.type, s.created_at, s.status, s.cancellation_reason,
                c.court_id, c.name as court_name, c.area as court_area,
                u.name as coach_name
            FROM sessions s
            JOIN session_students ss ON s.session_id = ss.session_id
            LEFT JOIN courts c ON s.court_id = c.court_id
            LEFT JOIN users u ON s.coach_id = u.user_id
            WHERE s.session_id = %s
              AND (
                    ss.student_id = %s
                    OR ss.student_id IN (
                        SELECT student_id FROM member_children WHERE member_id = %s
                    )
                  )
            LIMIT 1
        """, (session_id, str(current_user["user_id"]), str(current_user["user_id"])))

        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        cursor.execute("""
            SELECT u.user_id, u.name, s.level
            FROM users u
            JOIN students s ON u.user_id = s.user_id
            JOIN session_students ss ON u.user_id = ss.student_id
            WHERE ss.session_id = %s
        """, (session_id,))
        students = cursor.fetchall()

        cursor.execute("""
            SELECT d.drill_id, d.name, d.description
            FROM drills d
            JOIN session_drills sd ON d.drill_id = sd.drill_id
            WHERE sd.session_id = %s
        """, (session_id,))
        drills = cursor.fetchall()

        cursor.execute("""
            SELECT sdr.student_id, sdr.drill_id, sdr.rating, sdr.notes,
                   u.name as student_name, d.name as drill_name
            FROM session_drill_ratings sdr
            JOIN users u ON sdr.student_id = u.user_id
            JOIN drills d ON sdr.drill_id = d.drill_id
            WHERE sdr.session_id = %s
        """, (session_id,))
        ratings = cursor.fetchall()

        session_dict = dict(session)
        session_dict["students"] = students
        session_dict["drills"] = drills
        session_dict["ratings"] = ratings

        return session_dict


# ─── DELETE A PENDING SESSION REQUEST ────────────────────────────────────────

@router.delete("/session-requests/{request_id}", status_code=204)
def delete_session_request(
    request_id: str,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT status FROM session_requests
                WHERE request_id = %s AND member_id = %s
            """, (request_id, str(current_user["user_id"])))
            request = cursor.fetchone()
            if not request:
                raise HTTPException(status_code=404, detail="Session request not found")
            if request["status"] != "pending":
                raise HTTPException(status_code=400, detail="Only pending requests can be deleted")

            cursor.execute("DELETE FROM session_requests WHERE request_id = %s", (request_id,))
            conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"DELETE SESSION REQUEST ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete session request"
        )


# ─── CANCEL A SESSION ────────────────────────────────────────────────────────

@router.post("/sessions/{session_id}/cancel")
def cancel_session(
    session_id: str,
    data: CancelSessionRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT s.session_id, s.coach_id, s.date, s.start_time, s.status
                FROM sessions s
                JOIN session_students ss ON ss.session_id = s.session_id
                WHERE s.session_id = %s
                  AND (
                        ss.student_id = %s
                        OR ss.student_id IN (
                            SELECT student_id FROM member_children WHERE member_id = %s
                        )
                      )
                LIMIT 1
            """, (session_id, str(current_user["user_id"]), str(current_user["user_id"])))
            session = cursor.fetchone()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")

            if session["status"] in ("cancelled", "cancellation_pending"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Session is already {session['status'].replace('_', ' ')}"
                )

            today = _date.today()
            now = datetime.now()

            if session["start_time"] is not None:
                session_dt = datetime.combine(session["date"], session["start_time"])
                if session_dt <= now:
                    raise HTTPException(status_code=400, detail="Cannot cancel a session that has already started")
                hours_until = (session_dt - now).total_seconds() / 3600
            else:
                if session["date"] < today:
                    raise HTTPException(status_code=400, detail="Cannot cancel a session that has already started")
                hours_until = (datetime.combine(session["date"], _time(0, 0)) - now).total_seconds() / 3600

            reason_suffix = f' — "{data.reason}"' if data.reason else ""

            if hours_until > 24:
                new_status = "cancelled"
                message = f"{current_user['name']} cancelled their session on {session['date']}{reason_suffix}"
            else:
                new_status = "cancellation_pending"
                message = f"{current_user['name']} requested to cancel their session on {session['date']} — approval needed{reason_suffix}"

            cursor.execute(
                "UPDATE sessions SET status = %s, cancellation_reason = %s WHERE session_id = %s",
                (new_status, data.reason, session_id)
            )
            create_notification(cursor, session["coach_id"], message, notification_type="cancellation_request")
            conn.commit()
            return {"session_id": session_id, "status": new_status}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"CANCEL SESSION ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not cancel session"
        )


# ─── GET MY PROGRESS ─────────────────────────────────────────────────────────

@router.get("/progress")
def get_member_progress(
    student_id: str = None,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

        sid = student_id or str(current_user["user_id"])

        cursor.execute("""
            SELECT
                s.date,
                d.name as drill_name,
                sdr.rating,
                AVG(sdr.rating) OVER (
                    PARTITION BY sdr.drill_id
                    ORDER BY s.date
                    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
                ) as rolling_avg
            FROM session_drill_ratings sdr
            JOIN sessions s ON sdr.session_id = s.session_id
            JOIN drills d ON sdr.drill_id = d.drill_id
            WHERE sdr.student_id = %s
            ORDER BY s.date ASC
        """, (sid,))

        return cursor.fetchall()