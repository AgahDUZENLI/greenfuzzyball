from fastapi import APIRouter, Depends
from pydantic import BaseModel

from db.connection import get_db
from middleware.auth_middleware import get_current_user

router = APIRouter()


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscribeRequest(BaseModel):
    endpoint: str
    keys: PushKeys


class PushUnsubscribeRequest(BaseModel):
    endpoint: str


# ─── SUBSCRIBE ─────────────────────────────────────────────────────────────────

@router.post("/subscribe")
def subscribe(
    body: PushSubscribeRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (endpoint) DO UPDATE
                SET user_id = EXCLUDED.user_id,
                    p256dh = EXCLUDED.p256dh,
                    auth = EXCLUDED.auth
        """, (str(current_user["user_id"]), body.endpoint, body.keys.p256dh, body.keys.auth))
        conn.commit()
    return {"subscribed": True}


# ─── UNSUBSCRIBE ────────────────────────────────────────────────────────────────

@router.delete("/subscribe")
def unsubscribe(
    body: PushUnsubscribeRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor() as cursor:
        cursor.execute("""
            DELETE FROM push_subscriptions
            WHERE endpoint = %s AND user_id = %s
        """, (body.endpoint, str(current_user["user_id"])))
        conn.commit()
    return {"unsubscribed": True}
