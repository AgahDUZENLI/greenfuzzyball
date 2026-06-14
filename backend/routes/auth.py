from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from db.connection import get_db
from models.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse
)
from services.auth_service import (
    register_coach,
    login_coach,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_user_by_id
)
from middleware.auth_middleware import get_current_user

router = APIRouter()

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
    
# ─── LOGIN ─────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    conn=Depends(get_db)
):
    user = login_coach(
        conn = conn,
        email=form_data.username,
        password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token({"sub": str(user["user_id"])})
    refresh_token = create_refresh_token({"sub": str(user["user_id"])})

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")
    
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

    new_access_token = create_access_token({"sub": str(user["user_id"]), "role": user["role"]})
    new_refresh_token = create_refresh_token({"sub": str(user["user_id"]), "role": user["role"]})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

# ─── ME ──────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user