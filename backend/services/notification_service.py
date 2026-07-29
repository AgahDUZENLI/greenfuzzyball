from services.push_service import send_push_to_user


def create_notification(cursor, user_id, message, link=None, notification_type=None):
    cursor.execute("""
        INSERT INTO notifications (user_id, message, link, type)
        VALUES (%s, %s, %s, %s)
    """, (str(user_id), message, link, notification_type))

    send_push_to_user(cursor, user_id, title="Green Fuzzy Ball", body=message, link=link)
