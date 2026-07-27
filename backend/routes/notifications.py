from fastapi import APIRouter, Depends
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_user

router = APIRouter()


# ─── GET MY NOTIFICATIONS ─────────────────────────────────────────────────────

@router.get("/")
def get_notifications(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT notification_id, message, link, read_at, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 20
        """, (str(current_user["user_id"]),))
        notifications = cursor.fetchall()

        cursor.execute("""
            SELECT COUNT(*) AS unread_count FROM notifications
            WHERE user_id = %s AND read_at IS NULL
        """, (str(current_user["user_id"]),))
        unread_count = cursor.fetchone()["unread_count"]

    return {"notifications": notifications, "unread_count": unread_count}


# ─── MARK ALL AS READ ─────────────────────────────────────────────────────────

@router.patch("/read-all")
def mark_all_read(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE notifications SET read_at = NOW()
            WHERE user_id = %s AND read_at IS NULL
        """, (str(current_user["user_id"]),))
        conn.commit()
    return {"marked": True}
