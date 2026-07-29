from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import CoachResponse
from services.notification_service import create_notification

router = APIRouter()


# ─── GET INCOMING JOIN REQUESTS ──────────────────────────────────────────────

@router.get("/join-requests")
def get_join_requests(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT r.request_id, r.member_id, r.coach_id, r.status, r.notes, r.created_at,
                   u.name as member_name, u.email as member_email
            FROM coach_join_requests r
            JOIN users u ON r.member_id = u.user_id
            WHERE r.coach_id = %s AND r.status = 'pending'
            ORDER BY r.created_at DESC
        """, (str(coach["user_id"]),))
        return cursor.fetchall()


# ─── RESPOND TO JOIN REQUEST ──────────────────────────────────────────────────

@router.patch("/join-requests/{request_id}")
def respond_to_join_request(
    request_id: str,
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    new_status = data.get("status")
    if new_status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'")

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT request_id, member_id, coach_id FROM coach_join_requests
                WHERE request_id = %s
            """, (request_id,))
            request = cursor.fetchone()
            if not request:
                raise HTTPException(status_code=404, detail="Join request not found")
            if str(request["coach_id"]) != str(coach["user_id"]):
                raise HTTPException(status_code=403, detail="Not your join request")

            cursor.execute("""
                UPDATE coach_join_requests SET status = %s WHERE request_id = %s
            """, (new_status, request_id))

            if new_status == "approved":
                cursor.execute("""
                    INSERT INTO coach_students (coach_id, student_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (str(coach["user_id"]), str(request["member_id"])))

            create_notification(
                cursor, request["member_id"],
                f"{coach['name']} {new_status} your join request",
                notification_type="join_request_response"
            )

            conn.commit()
            return {"request_id": request_id, "status": new_status}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"RESPOND JOIN REQUEST ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update join request"
        )


# ─── GET INCOMING SESSION REQUESTS ───────────────────────────────────────────

@router.get("/session-requests")
def get_coach_session_requests(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT sr.request_id, sr.coach_id, sr.member_id, sr.student_id,
                   sr.requested_date, sr.requested_time, sr.status, sr.notes, sr.created_at,
                   mu.name AS member_name, su.name AS student_name
            FROM session_requests sr
            JOIN users mu ON sr.member_id = mu.user_id
            JOIN users su ON sr.student_id = su.user_id
            WHERE sr.coach_id = %s AND sr.status = 'pending'
            ORDER BY sr.created_at DESC
        """, (str(coach["user_id"]),))
        return cursor.fetchall()


# ─── RESPOND TO SESSION REQUEST ───────────────────────────────────────────────

@router.patch("/session-requests/{request_id}")
def respond_to_session_request(
    request_id: str,
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    new_status = data.get("status")
    if new_status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'")

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT request_id, member_id, coach_id, student_id,
                       requested_date, requested_time, notes
                FROM session_requests
                WHERE request_id = %s
            """, (request_id,))
            req = cursor.fetchone()
            if not req:
                raise HTTPException(status_code=404, detail="Session request not found")
            if str(req["coach_id"]) != str(coach["user_id"]):
                raise HTTPException(status_code=403, detail="Not your session request")

            cursor.execute("""
                UPDATE session_requests SET status = %s WHERE request_id = %s
            """, (new_status, request_id))

            session_id = None
            if new_status == "approved":
                cursor.execute("""
                    SELECT session_duration FROM coaches WHERE user_id = %s
                """, (str(coach["user_id"]),))
                row = cursor.fetchone()
                durations = row["session_duration"] if row and row["session_duration"] else [60]
                default_duration = durations[0] if durations else 60

                cursor.execute("""
                    INSERT INTO sessions (coach_id, court_id, date, start_time, duration_minutes, type, notes)
                    VALUES (%s, NULL, %s, %s, %s, 'private', %s)
                    RETURNING session_id
                """, (
                    str(coach["user_id"]), req["requested_date"], req["requested_time"],
                    default_duration, req["notes"]
                ))
                session_id = cursor.fetchone()["session_id"]

                cursor.execute("""
                    INSERT INTO session_students (session_id, student_id)
                    VALUES (%s, %s)
                """, (str(session_id), str(req["student_id"])))

                cursor.execute("""
                    INSERT INTO coach_students (coach_id, student_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (str(coach["user_id"]), str(req["student_id"])))

            verb = "approved" if new_status == "approved" else "declined"
            create_notification(
                cursor, req["member_id"],
                f"{coach['name']} {verb} your session request for {req['requested_date']}",
                notification_type="session_request_response"
            )

            conn.commit()
            return {"request_id": request_id, "status": new_status, "session_id": session_id}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"RESPOND SESSION REQUEST ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update session request"
        )


# ─── GET INCOMING CANCELLATION REQUESTS ──────────────────────────────────────

@router.get("/session-cancellations")
def get_cancellation_requests(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT
                s.session_id, s.date, s.start_time, s.duration_minutes, s.type,
                s.status, s.cancellation_reason,
                COALESCE(
                    array_agg(DISTINCT u.name) FILTER (WHERE u.name IS NOT NULL),
                    ARRAY[]::text[]
                ) as student_names
            FROM sessions s
            LEFT JOIN session_students ss ON s.session_id = ss.session_id
            LEFT JOIN users u ON ss.student_id = u.user_id
            WHERE s.coach_id = %s AND s.status = 'cancellation_pending'
            GROUP BY s.session_id
            ORDER BY s.date ASC, s.start_time ASC
        """, (str(coach["user_id"]),))
        return cursor.fetchall()


# ─── RESPOND TO CANCELLATION REQUEST ──────────────────────────────────────────

@router.patch("/session-cancellations/{session_id}")
def respond_to_cancellation(
    session_id: str,
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    new_status = data.get("status")
    if new_status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'")

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT session_id, coach_id, date, status FROM sessions WHERE session_id = %s
            """, (session_id,))
            session = cursor.fetchone()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            if str(session["coach_id"]) != str(coach["user_id"]):
                raise HTTPException(status_code=403, detail="Not your session")
            if session["status"] != "cancellation_pending":
                raise HTTPException(status_code=400, detail="Session is not pending cancellation")

            final_status = "cancelled" if new_status == "approved" else "scheduled"
            cursor.execute("""
                UPDATE sessions
                SET status = %s, cancellation_reason = CASE WHEN %s = 'scheduled' THEN NULL ELSE cancellation_reason END
                WHERE session_id = %s
            """, (final_status, final_status, session_id))

            cursor.execute("""
                SELECT DISTINCT COALESCE(mc.member_id, ss.student_id) as member_id
                FROM session_students ss
                LEFT JOIN member_children mc ON mc.student_id = ss.student_id
                WHERE ss.session_id = %s
            """, (session_id,))
            recipients = cursor.fetchall()

            message = (
                f"{coach['name']} approved your cancellation request — your session on {session['date']} has been cancelled"
                if new_status == "approved" else
                f"{coach['name']} declined your cancellation request — your session on {session['date']} is still scheduled"
            )
            for r in recipients:
                create_notification(cursor, r["member_id"], message, notification_type="cancellation_response")

            conn.commit()
            return {"session_id": session_id, "status": final_status}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"RESPOND CANCELLATION ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update cancellation request"
        )


# ─── GET COACH PROFILE ────────────────────────────────────────────────────────

@router.get("/profile", response_model=CoachResponse)
def get_profile(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT
                u.user_id, u.name, u.email, u.phone, u.location, u.age,
                u.created_at, c.code, c.notes,
                c.availability_start, c.availability_end,
                c.session_duration, c.coaching_days,
                c.notification_preferences
            FROM users u
            JOIN coaches c ON u.user_id = c.user_id
            WHERE u.user_id = %s
        """, (str(coach["user_id"]),))

        return cursor.fetchone()


# ─── UPDATE COACH PROFILE ─────────────────────────────────────────────────────

@router.put("/profile")
def update_profile(
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        import json
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
                str(coach["user_id"])
            ))
            cursor.execute("""
                UPDATE coaches SET 
                    notes = %s,
                    availability_start = %s,
                    availability_end = %s,
                    session_duration = %s,
                    coaching_days = %s,
                    notification_preferences = %s
                WHERE user_id = %s
            """, (
                data.get("notes"),
                data.get("availability_start"),
                data.get("availability_end"),
                json.dumps(data.get("session_duration", [60, 90, 120])),
                json.dumps(data.get("coaching_days", [])),
                json.dumps(data.get("notification_preferences", {
                    "session_booked": True,
                    "session_reminder": True,
                    "weekly_summary": False
                })),
                str(coach["user_id"])
            ))
            conn.commit()
            return {"message": "Profile updated"}
    except Exception as e:
        conn.rollback()
        print(f"UPDATE PROFILE ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile"
        )