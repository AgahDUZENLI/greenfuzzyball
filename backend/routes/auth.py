from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse
from passlib.context import CryptContext
from config import settings
import psycopg2
import psycopg2.extras

from db.connection import get_db
from models.schemas import (
    RegisterRequest,
    TokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from services.auth_service import (
    get_user_by_email,
    register_coach,
    login_coach,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_user_by_id,
    generate_password_reset_token,
    store_reset_token,
    verify_reset_token,
    reset_user_password,
    send_reset_email
)
from middleware.auth_middleware import get_current_user, get_current_coach

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── REGISTER ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: RegisterRequest, conn=Depends(get_db)):
    try:
        user = register_coach(
            conn=conn,
            name=data.name,
            email=data.email,
            password=data.password,
            phone=data.phone,
            location=data.location
        )

        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO coach_drills (coach_id, drill_id)
                SELECT %s, drill_id FROM drills
                WHERE coach_id IS NULL
            """, (str(user["user_id"]),))
            conn.commit()

        return user

    except Exception as e:
        print(f"REGISTER ERROR: {type(e).__name__}: {str(e)}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong"
        )
    
# ─── LOGIN ───────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), conn=Depends(get_db)):
    user = login_coach(conn=conn, email=form_data.username, password=form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": str(user["user_id"])})
    refresh_token = create_refresh_token({"sub": str(user["user_id"])})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


# ─── REFRESH TOKEN ───────────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str, conn=Depends(get_db)):
    payload = decode_token(refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    user = get_user_by_id(conn, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    new_access_token = create_access_token({"sub": str(user["user_id"])})
    new_refresh_token = create_refresh_token({"sub": str(user["user_id"])})

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )


# ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, conn=Depends(get_db)):
    user = get_user_by_email(conn, data.email)

    if user:
        token, expires_at = generate_password_reset_token()
        store_reset_token(conn, data.email, token, expires_at)
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        try:
            send_reset_email(data.email, reset_link)
        except Exception as e:
            print(f"EMAIL ERROR: {e}")

    return {"message": "If that email exists you will receive a reset link"}


# ─── RESET PASSWORD ──────────────────────────────────────────────────────────

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, conn=Depends(get_db)):
    user = verify_reset_token(conn, data.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    reset_user_password(conn, user["user_id"], data.new_password)
    return {"message": "Password updated successfully"}


# ─── ME ──────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user


# ─── GOOGLE OAUTH ────────────────────────────────────────────────────────────

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"}
)

@router.get("/google")
async def google_login(request: Request):
    redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, conn=Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve user info from Google"
        )

    email = user_info.get("email")
    name = user_info.get("name")

    user = get_user_by_email(conn, email)

    if not user:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO users (name, email, role)
                VALUES (%s, %s, 'coach')
                RETURNING user_id, name, email, role, created_at
            """, (name, email))
            user = cursor.fetchone()
            cursor.execute("""
                INSERT INTO coaches (user_id) VALUES (%s)
            """, (str(user["user_id"]),))
            conn.commit()

    access_token = create_access_token({"sub": str(user["user_id"])})
    refresh_token = create_refresh_token({"sub": str(user["user_id"])})

    frontend_url = f"http://localhost:5173/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
    return RedirectResponse(url=frontend_url)


# ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────

@router.post("/change-password")
def change_password(
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT hashed_password FROM users WHERE user_id = %s
            """, (str(coach["user_id"]),))
            user = cursor.fetchone()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            if not pwd_context.verify(data.get("current_password"), user["hashed_password"]):
                raise HTTPException(status_code=400, detail="Current password is incorrect")

            new_hash = pwd_context.hash(data.get("new_password"))

            cursor.execute("""
                UPDATE users SET hashed_password = %s WHERE user_id = %s
            """, (new_hash, str(coach["user_id"])))

            conn.commit()
            return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"CHANGE PASSWORD ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not change password"
        )