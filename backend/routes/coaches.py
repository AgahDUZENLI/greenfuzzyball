from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import CoachResponse

router = APIRouter()


# ─── GET COACH PROFILE ────────────────────────────────────────────────────────

@router.get("/profile", response_model=CoachResponse)
def get_profile(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT 
                u.user_id, u.name, u.email, u.phone, u.location,
                u.created_at, c.notes,
                c.availability_start, c.availability_end,
                c.session_duration, c.coaching_days
            FROM users u
            JOIN coaches c ON u.user_id = c.user_id
            WHERE u.user_id = %s
        """, (str(coach["user_id"]),))

        return cursor.fetchone()


# ─── UPDATE COACH PROFILE ─────────────────────────────────────────────────────

@router.put("/profile", response_model=CoachResponse)
def update_profile(
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Update users table
            cursor.execute("""
                UPDATE users SET
                    name     = COALESCE(%s, name),
                    phone    = COALESCE(%s, phone),
                    location = COALESCE(%s, location)
                WHERE user_id = %s
            """, (
                data.get("name"),
                data.get("phone"),
                data.get("location"),
                str(coach["user_id"])
            ))

            # Update coaches table
            cursor.execute("""
                UPDATE coaches SET
                    notes = COALESCE(%s, notes)
                WHERE user_id = %s
            """, (
                data.get("notes"),
                str(coach["user_id"])
            ))

            # Return updated profile
            cursor.execute("""
                SELECT u.user_id, u.name, u.email, u.phone, u.location,
                       u.created_at, c.notes
                FROM users u
                JOIN coaches c ON u.user_id = c.user_id
                WHERE u.user_id = %s
            """, (str(coach["user_id"]),))

            conn.commit()
            return cursor.fetchone()

    except Exception as e:
        conn.rollback()
        print(f"UPDATE PROFILE ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile"
        )