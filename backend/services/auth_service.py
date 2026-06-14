from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import psycopg2.extras

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