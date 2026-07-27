def create_notification(cursor, user_id, message, link=None):
    cursor.execute("""
        INSERT INTO notifications (user_id, message, link)
        VALUES (%s, %s, %s)
    """, (str(user_id), message, link))
