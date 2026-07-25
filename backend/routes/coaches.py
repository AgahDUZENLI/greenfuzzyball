from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import CoachResponse

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