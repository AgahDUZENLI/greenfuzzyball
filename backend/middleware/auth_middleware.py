from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from uuid import UUID
import psycopg2.extras

from services.auth_service import decode_token
from db.connection import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    conn = Depends(get_db)
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode the token
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    # Get user_id from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Check token type
    token_type: str = payload.get("type")
    if token_type != "access":
        raise credentials_exception

    # Get user from database
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s",
            (user_id,)
        )
        user = cursor.fetchone()

    if user is None:
        raise credentials_exception

    return user


def get_current_coach(
    current_user: dict = Depends(get_current_user)
) -> dict:
    if current_user["role"] != "coach":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only coaches can access this resource"
        )
    return current_user


def get_current_student(
    current_user: dict = Depends(get_current_user)
) -> dict:
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this resource"
        )
    return current_user