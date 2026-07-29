import json

from pywebpush import webpush, WebPushException

from config import settings


def send_push_to_user(cursor, user_id, title, body, link=None):
    """Send a Web Push notification to every subscribed device of user_id.

    Never raises — failures are logged and swallowed so a push failure can
    never break the caller's request/transaction.
    """
    try:
        cursor.execute("""
            SELECT subscription_id, endpoint, p256dh, auth
            FROM push_subscriptions
            WHERE user_id = %s
        """, (str(user_id),))
        subs = cursor.fetchall()
    except Exception as e:
        print(f"PUSH SELECT ERROR: {type(e).__name__}: {e}")
        return

    if not subs:
        return

    payload = json.dumps({"title": title, "body": body, "link": link or "/"})

    for sub in subs:
        subscription_id, endpoint, p256dh, auth = (
            (sub["subscription_id"], sub["endpoint"], sub["p256dh"], sub["auth"])
            if isinstance(sub, dict) else sub
        )

        try:
            webpush(
                subscription_info={
                    "endpoint": endpoint,
                    "keys": {"p256dh": p256dh, "auth": auth}
                },
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": settings.VAPID_CLAIMS_EMAIL}
            )
        except WebPushException as e:
            status = e.response.status_code if e.response is not None else None
            if status in (404, 410):
                try:
                    cursor.execute(
                        "DELETE FROM push_subscriptions WHERE subscription_id = %s",
                        (str(subscription_id),)
                    )
                except Exception as cleanup_err:
                    print(f"PUSH CLEANUP ERROR: {type(cleanup_err).__name__}: {cleanup_err}")
            else:
                print(f"PUSH SEND ERROR ({status}): {e}")
        except Exception as e:
            print(f"PUSH SEND ERROR: {type(e).__name__}: {e}")
