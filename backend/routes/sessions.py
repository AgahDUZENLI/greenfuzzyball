from fastapi import APIRouter, Depends, HTTPException, status, Query
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import (
    CreateSessionRequest,
    SessionResponse,
    CreateRatingRequest,
    RatingResponse,
    AddDrillToSessionRequest,
    UpdateSessionRequest,
)

router = APIRouter()


# ─── CREATE SESSION ───────────────────────────────────────────────────────────

@router.post("/", response_model=SessionResponse, status_code=201)
def create_session(
    data: CreateSessionRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            cursor.execute("""
                INSERT INTO sessions (coach_id, court_id, date, start_time, duration_minutes, type, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING session_id, court_id, date, start_time, duration_minutes, type, notes, created_at
            """, (
                str(coach["user_id"]),
                str(data.court_id) if data.court_id else None,
                data.date,
                data.start_time,
                data.duration_minutes,
                data.type,
                data.notes
            ))

            session = cursor.fetchone()
            session_id = session["session_id"]

            for student_id in data.student_ids:
                cursor.execute("""
                    INSERT INTO session_students (session_id, student_id)
                    VALUES (%s, %s)
                """, (str(session_id), str(student_id)))

            for drill_id in data.drill_ids:
                cursor.execute("""
                    INSERT INTO session_drills (session_id, drill_id)
                    VALUES (%s, %s)
                """, (str(session_id), str(drill_id)))

            conn.commit()

            # Fetch student names
            student_names = []
            if data.student_ids:
                cursor.execute("""
                    SELECT name FROM users
                    WHERE user_id = ANY(%s::uuid[])
                """, ([str(s) for s in data.student_ids],))
                student_names = [row["name"] for row in cursor.fetchall()]

            # Fetch court name
            court_name = None
            if data.court_id:
                cursor.execute("""
                    SELECT name FROM courts WHERE court_id = %s
                """, (str(data.court_id),))
                court = cursor.fetchone()
                if court:
                    court_name = court["name"]

            # Send booking confirmation email
            try:
                from services.email_service import send_email, session_booked_email
                body = session_booked_email(
                    coach_name=coach["name"],
                    student_names=student_names,
                    date=str(data.date),
                    start_time=str(data.start_time),
                    duration=data.duration_minutes,
                    court_name=court_name
                )
                send_email(
                    to=coach["email"],
                    subject=f"Session booked — {', '.join(student_names) if student_names else 'No students'}",
                    body=body
                )
            except Exception as e:
                print(f"EMAIL ERROR: {e}")

            # Return session
            cursor.execute("""
                SELECT 
                    s.session_id, s.date, s.start_time, s.duration_minutes,
                    s.type, s.notes, s.created_at,
                    c.court_id, c.name as court_name, c.area as court_area
                FROM sessions s
                LEFT JOIN courts c ON s.court_id = c.court_id
                WHERE s.session_id = %s
            """, (str(session_id),))

            return cursor.fetchone()

    except Exception as e:
        conn.rollback()
        print(f"CREATE SESSION ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create session"
        )

# ─── GET ALL SESSIONS (with optional date filter) ─────────────────────────────

@router.get("/", response_model=list[SessionResponse])
def get_sessions(
    date: str = Query(None),
    student_id: str = Query(None),
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        student_filter = ""
        params = [str(coach["user_id"])]

        if student_id:
            student_filter = """
                AND EXISTS (
                    SELECT 1 FROM session_students ss2
                    WHERE ss2.session_id = s.session_id AND ss2.student_id = %s
                )
            """
            params.append(student_id)

        if date:
            params.append(date)
            cursor.execute(f"""
                SELECT
                    s.session_id, s.date, s.start_time, s.duration_minutes,
                    s.type, s.notes, s.created_at,
                    c.court_id, c.name as court_name, c.area as court_area,
                    COALESCE(
                        array_agg(DISTINCT u.name) FILTER (WHERE u.name IS NOT NULL),
                        ARRAY[]::text[]
                    ) as student_names,
                    COUNT(DISTINCT sdr.student_id) = 0 as unrated
                FROM sessions s
                LEFT JOIN courts c ON s.court_id = c.court_id
                LEFT JOIN session_students ss ON s.session_id = ss.session_id
                LEFT JOIN users u ON ss.student_id = u.user_id
                LEFT JOIN session_drill_ratings sdr ON s.session_id = sdr.session_id
                WHERE s.coach_id = %s {student_filter} AND s.date = %s
                GROUP BY s.session_id, c.court_id
                ORDER BY s.start_time ASC
            """, params)
        else:
            cursor.execute(f"""
                SELECT
                    s.session_id, s.date, s.start_time, s.duration_minutes,
                    s.type, s.notes, s.created_at,
                    c.court_id, c.name as court_name, c.area as court_area,
                    COALESCE(
                        array_agg(DISTINCT u.name) FILTER (WHERE u.name IS NOT NULL),
                        ARRAY[]::text[]
                    ) as student_names,
                    COUNT(DISTINCT sdr.student_id) = 0 as unrated
                FROM sessions s
                LEFT JOIN courts c ON s.court_id = c.court_id
                LEFT JOIN session_students ss ON s.session_id = ss.session_id
                LEFT JOIN users u ON ss.student_id = u.user_id
                LEFT JOIN session_drill_ratings sdr ON s.session_id = sdr.session_id
                WHERE s.coach_id = %s {student_filter}
                GROUP BY s.session_id, c.court_id
                ORDER BY s.date DESC, s.start_time ASC
            """, params)
        return cursor.fetchall()


# ─── GET ONE SESSION ──────────────────────────────────────────────────────────

@router.get("/{session_id}")
def get_session(
    session_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

        cursor.execute("""
            SELECT 
                s.session_id, s.date, s.start_time, s.duration_minutes,
                s.type, s.notes, s.created_at,
                c.court_id, c.name as court_name, c.area as court_area
            FROM sessions s
            LEFT JOIN courts c ON s.court_id = c.court_id
            WHERE s.session_id = %s AND s.coach_id = %s
        """, (session_id, str(coach["user_id"])))

        session = cursor.fetchone()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        cursor.execute("""
            SELECT u.user_id, u.name, s.level, s.age_group
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


# ─── DELETE SESSION ───────────────────────────────────────────────────────────

@router.delete("/{session_id}", status_code=204)
def delete_session(
    session_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 1 FROM sessions
                WHERE session_id = %s AND coach_id = %s
            """, (session_id, str(coach["user_id"])))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )

            cursor.execute("DELETE FROM sessions WHERE session_id = %s", (session_id,))
            conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"DELETE SESSION ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete session"
        )


# ─── ADD RATING ───────────────────────────────────────────────────────────────

@router.post("/{session_id}/ratings", response_model=RatingResponse, status_code=201)
def add_rating(
    session_id: str,
    data: CreateRatingRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            cursor.execute("""
                SELECT 1 FROM sessions
                WHERE session_id = %s AND coach_id = %s
            """, (session_id, str(coach["user_id"])))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )

            cursor.execute("""
                INSERT INTO session_drill_ratings
                    (session_id, drill_id, student_id, rating, notes)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (session_id, drill_id, student_id)
                DO UPDATE SET
                    rating = EXCLUDED.rating,
                    notes = EXCLUDED.notes
                RETURNING session_id, drill_id, student_id, rating, notes, created_at
            """, (
                session_id,
                str(data.drill_id),
                str(data.student_id),
                data.rating,
                data.notes
            ))

            conn.commit()
            return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"ADD RATING ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not add rating"
        )


# ─── GET STUDENT PROGRESS ─────────────────────────────────────────────────────

@router.get("/progress/{student_id}")
def get_student_progress(
    student_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

        cursor.execute("""
            SELECT 1 FROM coach_students
            WHERE coach_id = %s AND student_id = %s
        """, (str(coach["user_id"]), student_id))

        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        cursor.execute("""
            SELECT
                d.name as drill_name,
                d.drill_id,
                sdr.rating,
                s.date as session_date,
                AVG(sdr.rating) OVER (
                    PARTITION BY sdr.drill_id
                    ORDER BY s.date
                    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
                ) as rolling_avg
            FROM session_drill_ratings sdr
            JOIN sessions s ON sdr.session_id = s.session_id
            JOIN drills d ON sdr.drill_id = d.drill_id
            WHERE sdr.student_id = %s
            AND s.coach_id = %s
            ORDER BY d.name, s.date
        """, (student_id, str(coach["user_id"])))

        return {"progress": cursor.fetchall()}


# ─── ADD DRILL TO SESSION ─────────────────────────────────────────────────────

@router.post("/{session_id}/drills", status_code=201)
def add_drill_to_session(
    session_id: str,
    data: AddDrillToSessionRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT 1 FROM sessions WHERE session_id = %s AND coach_id = %s
            """, (session_id, str(coach["user_id"])))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Session not found")

            cursor.execute("""
                INSERT INTO session_drills (session_id, drill_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (session_id, str(data.drill_id)))
            conn.commit()

            cursor.execute("""
                SELECT drill_id, name, description FROM drills WHERE drill_id = %s
            """, (str(data.drill_id),))
            return cursor.fetchone()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Could not add drill")


# ─── REMOVE DRILL FROM SESSION ────────────────────────────────────────────────

@router.delete("/{session_id}/drills/{drill_id}", status_code=204)
def remove_drill_from_session(
    session_id: str,
    drill_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 1 FROM sessions WHERE session_id = %s AND coach_id = %s
            """, (session_id, str(coach["user_id"])))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Session not found")

            cursor.execute("""
                DELETE FROM session_drills WHERE session_id = %s AND drill_id = %s
            """, (session_id, drill_id))
            conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Could not remove drill")


# ─── UPDATE SESSION ───────────────────────────────────────────────────────────

@router.patch("/{session_id}")
def update_session(
    session_id: str,
    data: UpdateSessionRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT 1 FROM sessions WHERE session_id = %s AND coach_id = %s
            """, (session_id, str(coach["user_id"])))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Session not found")

            # Build dynamic SET clause for session fields
            set_parts = []
            values = []
            if data.date is not None:
                set_parts.append("date = %s")
                values.append(data.date)
            if data.start_time is not None:
                set_parts.append("start_time = %s")
                values.append(data.start_time)
            if data.duration_minutes is not None:
                set_parts.append("duration_minutes = %s")
                values.append(data.duration_minutes)
            if data.type is not None:
                set_parts.append("type = %s")
                values.append(data.type)
            if data.court_id is not None:
                set_parts.append("court_id = %s")
                values.append(str(data.court_id))
            if data.notes is not None:
                set_parts.append("notes = %s")
                values.append(data.notes.strip() if data.notes.strip() else None)

            if set_parts:
                values.append(session_id)
                cursor.execute(
                    f"UPDATE sessions SET {', '.join(set_parts)} WHERE session_id = %s",
                    values
                )

            # Rebuild student list if provided
            if data.student_ids is not None:
                cursor.execute(
                    "DELETE FROM session_students WHERE session_id = %s", (session_id,)
                )
                for student_id in data.student_ids:
                    cursor.execute(
                        "INSERT INTO session_students (session_id, student_id) VALUES (%s, %s)",
                        (session_id, str(student_id))
                    )

            conn.commit()
            return {"session_id": session_id, "updated": True}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Could not update session")