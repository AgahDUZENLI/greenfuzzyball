from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime, date, time
from datetime import date as _Date  # alias to avoid shadowing in fields literally named `date` with a default

# ─── AUTH ───────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    location: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    user_id: UUID
    name: str
    email: EmailStr
    role: str
    created_at: datetime

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str
    


# ─── COACHES ────────────────────────────────────

class CoachResponse(BaseModel):
    user_id: UUID
    name: str
    email: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    notes: Optional[str]
    created_at: datetime
    availability_start: Optional[time]
    availability_end: Optional[time]
    session_duration: Optional[list[int]]
    coaching_days: Optional[list[str]]
    notification_preferences: Optional[dict] = None

# ─── STUDENTS ───────────────────────────────────

class CreateStudentRequest(BaseModel):
    # from users table
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    # from students table
    age_group: str
    level: str
    notes: Optional[str] = None

class UpdateStudentRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    age_group: Optional[str] = None
    level: Optional[str] = None
    notes: Optional[str] = None

class StudentResponse(BaseModel):
    user_id: UUID
    name: str
    age_group: str
    level: str
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class AddStudentToCoachRequest(BaseModel):
    student_id: UUID
    started_at: Optional[datetime] = None
    notes: Optional[str] = None


# ─── DRILL CATEGORIES ───────────────────────────

class CreateCategoryRequest(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    drill_category_id: UUID
    name: str
    coach_id: Optional[UUID] = None


# ─── DRILLS ─────────────────────────────────────

class CreateDrillRequest(BaseModel):
    name: str
    description: Optional[str] = None
    category_ids: list[UUID] = []

class UpdateDrillRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_ids: Optional[list[UUID]] = None

class DrillResponse(BaseModel):
    drill_id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime
    categories: list[CategoryResponse] = []


# ─── SESSIONS ───────────────────────────────────

class CreateSessionRequest(BaseModel):
    date: date
    start_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    type: str
    notes: Optional[str] = None
    court_id: Optional[UUID] = None
    student_ids: list[UUID] = []
    drill_ids: list[UUID] = []

class SessionResponse(BaseModel):
    session_id: UUID
    date: date
    start_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    type: str
    notes: Optional[str] = None
    created_at: datetime
    court_id: Optional[UUID] = None
    court_name: Optional[str] = None
    court_area: Optional[str] = None
    student_names: list[str] = []
    unrated: bool = False

# ─── SESSION UPDATES ────────────────────────────

class AddDrillToSessionRequest(BaseModel):
    drill_id: UUID

class UpdateSessionRequest(BaseModel):
    date: Optional[_Date] = None
    start_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    type: Optional[str] = None
    court_id: Optional[UUID] = None
    student_ids: Optional[list[UUID]] = None
    notes: Optional[str] = None

# ─── RATINGS ────────────────────────────────────

class CreateRatingRequest(BaseModel):
    student_id: UUID
    drill_id: UUID
    rating: int = Field(ge=1, le=10)
    notes: Optional[str] = None

class RatingResponse(BaseModel):
    session_id: UUID
    drill_id: UUID
    student_id: UUID
    rating: int
    notes: Optional[str] = None
    created_at: datetime