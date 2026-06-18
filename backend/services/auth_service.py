from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import psycopg2.extras
import secrets
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import settings

# ─── PASSWORD HASHING ────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ─── JWT TOKENS ──────────────────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# ─── AUTH QUERIES ────────────────────────────────────────────────────────────

def get_user_by_email(conn, email: str) -> Optional[dict]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )
        return cursor.fetchone()

def get_user_by_id(conn, user_id: UUID) -> Optional[dict]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s",
            (str(user_id),)
        )
        return cursor.fetchone()

def register_coach(conn, name: str, email: str, password: str,
                   phone: Optional[str], location: Optional[str]) -> dict:
    hashed = hash_password(password)

    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        # Step 1 — insert into users
        cursor.execute("""
            INSERT INTO users (name, email, hashed_password, role, phone, location)
            VALUES (%s, %s, %s, 'coach', %s, %s)
            RETURNING user_id, name, email, role, created_at
        """, (name, email, hashed, phone, location))

        user = cursor.fetchone()

        # Step 2 — insert into coaches
        cursor.execute("""
            INSERT INTO coaches (user_id)
            VALUES (%s)
        """, (str(user["user_id"]),))

        conn.commit()
        return user

def login_coach(conn, email: str, password: str) -> Optional[dict]:
    user = get_user_by_email(conn, email)

    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    if user["role"] != "coach":
        return None

    return user


def generate_password_reset_token() -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    return token, expires_at

def store_reset_token(conn, email: str, token: str, expires_at: datetime):
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE users
            SET password_reset_token = %s,
                password_reset_expires_at = %s
            WHERE email = %s
        """, (token, expires_at, email))
        conn.commit()

def verify_reset_token(conn, token: str):
    print(f"Verifying token: '{token}'")
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT * FROM users
            WHERE password_reset_token = %s
            AND password_reset_expires_at > NOW()
        """, (token,))
        result = cursor.fetchone()
        print(f"Result: {result}")
        return result

def reset_user_password(conn, user_id, new_password: str):
    hashed = hash_password(new_password)
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE users
            SET hashed_password = %s,
                password_reset_token = NULL,
                password_reset_expires_at = NULL
            WHERE user_id = %s
        """, (hashed, str(user_id)))
        conn.commit()

def send_reset_email(to_email: str, reset_link: str):
    msg = MIMEMultipart()
    msg['From'] = f"CoachPilot <{settings.GMAIL_USER}>"
    msg['To'] = to_email
    msg['Subject'] = 'Reset your CoachPilot password'

    body = f"""
    <html>
      <body style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        
        <div style="margin-bottom: 32px;">
          <span style="font-size: 24px;">🎾</span>
          <strong style="font-size: 18px; margin-left: 8px;">CoachPilot</strong>
        </div>

        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Reset your password
        </h2>
        <p style="color: #6b7280; margin-bottom: 32px;">
          We received a request to reset your CoachPilot password. 
          Click the button below to choose a new one.
        </p>

        <a href="{reset_link}" style="
          background-color: #16a34a;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          display: inline-block;
          margin-bottom: 32px;
        ">
          Reset password
        </a>

        <p style="color: #9ca3af; font-size: 13px; margin-bottom: 8px;">
          This link expires in 1 hour.
        </p>
        <p style="color: #9ca3af; font-size: 13px;">
          If you didn't request this, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          © 2026 CoachPilot
        </p>

      </body>
    </html>
    """

    msg.attach(MIMEText(body, 'html'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.send_message(msg)