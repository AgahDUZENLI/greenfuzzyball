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
                UPDATE users SET name = %s, email = %s, phone = %s, location = %s
                WHERE user_id = %s
            """, (
                data.get("name"),
                data.get("email"),
                data.get("phone"),
                data.get("location"),
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