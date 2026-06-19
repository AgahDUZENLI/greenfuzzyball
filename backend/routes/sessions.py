from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import (
    CreateSessionRequest,
    SessionResponse,
    CreateRatingRequest,
    RatingResponse
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

            # Create session
            cursor.execute("""
                INSERT INTO sessions (coach_id, date, start_time, duration_minutes, type, notes, session_location)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING session_id, date, start_time, duration_minutes, type, notes, session_location, created_at
            """, (
                str(coach["user_id"]),
                data.date,
                data.start_time,
                data.duration_minutes,
                data.type,
                data.notes,
                data.session_location
            ))

            session = cursor.fetchone()
            session_id = session["session_id"]

            # Link students
            for student_id in data.student_ids:
                cursor.execute("""
                    INSERT INTO session_students (session_id, student_id)
                    VALUES (%s, %s)
                """, (str(session_id), str(student_id)))

            # Link drills
            for drill_id in data.drill_ids:
                cursor.execute("""
                    INSERT INTO session_drills (session_id, drill_id)
                    VALUES (%s, %s)
                """, (str(session_id), str(drill_id)))

            conn.commit()
            return session

    except Exception as e:
        conn.rollback()
        print(f"CREATE SESSION ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create session"
        )


# ─── GET ALL SESSIONS ─────────────────────────────────────────────────────────

@router.get("/", response_model=list[SessionResponse])
def get_sessions(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT session_id, date, start_time, duration_minutes, type, notes, session_location, created_at
            FROM sessions
            WHERE coach_id = %s
            ORDER BY date DESC, start_time ASC
        """, (str(coach["user_id"]),))
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
            SELECT session_id, date, start_time, duration_minutes, type, notes, session_location, created_at
            FROM sessions
            WHERE session_id = %s AND coach_id = %s
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

            cursor.execute("""
                DELETE FROM sessions WHERE session_id = %s
            """, (session_id,))

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

            # Verify session belongs to coach
            cursor.execute("""
                SELECT 1 FROM sessions
                WHERE session_id = %s AND coach_id = %s
            """, (session_id, str(coach["user_id"])))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )

            # Insert or update rating
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

        # Verify student belongs to coach
        cursor.execute("""
            SELECT 1 FROM coach_students
            WHERE coach_id = %s AND student_id = %s
        """, (str(coach["user_id"]), student_id))

        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        # Get all ratings over time per drill
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