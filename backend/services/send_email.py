import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

def send_email(to: str, subject: str, body: str):
    if not settings.GMAIL_USER or not settings.GMAIL_PASSWORD:
        raise ValueError("Gmail credentials are not set in the configuration.")
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.GMAIL_USER
    msg["To"] = to

    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.GMAIL_USER, settings.GMAIL_PASSWORD)
        server.sendmail(settings.GMAIL_USER, to, msg.as_string())


def session_booked_email(coach_name: str, student_names: list, date: str, start_time: str, duration: int, court_name: str = None):
    from datetime import datetime
    date_label = datetime.strptime(date, '%Y-%m-%d').strftime('%A, %B %d, %Y')
    h, m = map(int, start_time.split(':')[:2])
    ampm = 'PM' if h >= 12 else 'AM'
    time_label = f"{h % 12 or 12}:{str(m).zfill(2)} {ampm}"
    students_label = ', '.join(student_names)
    court_label = court_name or 'No court set'
    duration_label = f"{duration} min"

    body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
        <div style="background: #16a34a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Session Booked ✅</h1>
        </div>
        <p style="color: #374151; font-size: 16px;">Hi {coach_name},</p>
        <p style="color: #374151;">Your session has been booked successfully!</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">DATE</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{date_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">TIME</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{time_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">DURATION</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{duration_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">STUDENT(S)</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{students_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">COURT</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{court_label}</td></tr>
            </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">This is an automated message from Green Fuzzy Ball.</p>
    </div>
    """
    return body


def session_reminder_email(coach_name: str, student_names: list, date: str, start_time: str, duration: int, court_name: str = None):
    from datetime import datetime
    date_label = datetime.strptime(date, '%Y-%m-%d').strftime('%A, %B %d, %Y')
    h, m = map(int, start_time.split(':')[:2])
    ampm = 'PM' if h >= 12 else 'AM'
    time_label = f"{h % 12 or 12}:{str(m).zfill(2)} {ampm}"
    students_label = ', '.join(student_names)
    court_label = court_name or 'No court set'

    body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
        <div style="background: #111827; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Session Tomorrow 🎾</h1>
        </div>
        <p style="color: #374151; font-size: 16px;">Hi {coach_name},</p>
        <p style="color: #374151;">Just a reminder — you have a session tomorrow!</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">DATE</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{date_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">TIME</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{time_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">STUDENT(S)</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{students_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">COURT</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">{court_label}</td></tr>
            </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">This is an automated message from Green Fuzzy Ball.</p>
    </div>
    """
    return body