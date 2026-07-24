from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras
from passlib.context import CryptContext

from db.connection import get_db
from models.schemas import (
    RegisterMemberRequest,
    MemberResponse,
    AddChildRequest,
    ChildResponse,
    JoinRequestCreate,
    JoinRequestResponse,
    SessionRequestCreate,
    SessionRequestResponse
)
from middleware.auth_middleware import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── REGISTER MEMBER ─────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
def register_member(data: RegisterMemberRequest, conn=Depends(get_db)):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Check email not taken
            cursor.execute("SELECT 1 FROM users WHERE email = %s", (data.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")

            hashed = pwd_context.hash(data.password)

            # Create user
            cursor.execute("""
                INSERT INTO users (name, email, phone, hashed_password, role)
                VALUES (%s, %s, %s, %s, 'member')
                RETURNING user_id, name, email, phone, role, created_at
            """, (data.name, data.email, data.phone or None, hashed))

            user = cursor.fetchone()
            user_id = str(user["user_id"])

            # Create member profile
            cursor.execute("""
                INSERT INTO members (user_id, is_student)
                VALUES (%s, %s)
            """, (user_id, data.is_student))

            # If member also takes lessons → create student record
            if data.is_student:
                if not data.age_group or not data.level:
                    raise HTTPException(
                        status_code=400,
                        detail="age_group and level required if is_student is true"
                    )
                cursor.execute("""
                    INSERT INTO students (user_id, age_group, level)
                    VALUES (%s, %s, %s)
                """, (user_id, data.age_group, data.level))

            conn.commit()
            return {
                "user_id": user["user_id"],
                "name": user["name"],
                "email": user["email"],
                "phone": user["phone"],
                "role": user["role"],
                "is_student": data.is_student,
                "created_at": user["created_at"]
            }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"REGISTER MEMBER ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not register member"
        )


# ─── GET MEMBER PROFILE ───────────────────────────────────────────────────────

@router.get("/me")
def get_member_profile(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT u.user_id, u.name, u.email, u.phone, u.location,
                   u.created_at, m.is_student, m.notes
            FROM users u
            JOIN members m ON u.user_id = m.user_id
            WHERE u.user_id = %s
        """, (str(current_user["user_id"]),))

        member = cursor.fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        return member


# ─── UPDATE MEMBER PROFILE ───────────────────────────────────────────────────

@router.put("/me")
def update_member_profile(
    data: dict,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE users SET name = %s, email = %s, phone = %s, location = %s
                WHERE user_id = %s
            """, (
                data.get("name"),
                data.get("email"),
                data.get("phone"),
                data.get("location"),
                str(current_user["user_id"])
            ))
            cursor.execute("""
                UPDATE members SET notes = %s
                WHERE user_id = %s
            """, (
                data.get("notes"),
                str(current_user["user_id"])
            ))
            conn.commit()

            cursor.execute("""
                SELECT u.user_id, u.name, u.email, u.phone, u.location,
                       u.created_at, m.is_student, m.notes
                FROM users u
                JOIN members m ON u.user_id = m.user_id
                WHERE u.user_id = %s
            """, (str(current_user["user_id"]),))
            return cursor.fetchone()
    except Exception as e:
        conn.rollback()
        print(f"UPDATE MEMBER PROFILE ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile"
        )


# ─── ADD CHILD ────────────────────────────────────────────────────────────────

@router.post("/children", status_code=201)
def add_child(
    data: AddChildRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Create student user record for child (no login)
            cursor.execute("""
                INSERT INTO users (name, phone, role)
                VALUES (%s, %s, 'student')
                RETURNING user_id
            """, (data.name, data.phone or None))

            child_user = cursor.fetchone()
            child_id = str(child_user["user_id"])

            # Create student profile
            cursor.execute("""
                INSERT INTO students (user_id, age_group, level, notes)
                VALUES (%s, %s, %s, %s)
            """, (child_id, data.age_group, data.level, data.notes or None))

            # Link child to member
            cursor.execute("""
                INSERT INTO member_children (member_id, student_id)
                VALUES (%s, %s)
            """, (str(current_user["user_id"]), child_id))

            conn.commit()

            cursor.execute("""
                SELECT u.user_id, u.name, u.phone,
                       s.age_group, s.level, s.notes
                FROM users u
                JOIN students s ON u.user_id = s.user_id
                WHERE u.user_id = %s
            """, (child_id,))

            return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"ADD CHILD ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not add child"
        )


# ─── GET CHILDREN ─────────────────────────────────────────────────────────────

@router.get("/children")
def get_children(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT u.user_id, u.name, u.phone,
                   s.age_group, s.level, s.notes
            FROM users u
            JOIN students s ON u.user_id = s.user_id
            JOIN member_children mc ON s.user_id = mc.student_id
            WHERE mc.member_id = %s
        """, (str(current_user["user_id"]),))
        return cursor.fetchall()


# ─── REQUEST TO JOIN COACH ───────────────────────────────────────────────────

@router.post("/join-request", status_code=201)
def request_join_coach(
    data: JoinRequestCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Check not already requested
            cursor.execute("""
                SELECT 1 FROM coach_join_requests
                WHERE member_id = %s AND coach_id = %s AND status = 'pending'
            """, (str(current_user["user_id"]), str(data.coach_id)))

            if cursor.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail="You already have a pending request with this coach"
                )

            cursor.execute("""
                INSERT INTO coach_join_requests (member_id, coach_id, notes)
                VALUES (%s, %s, %s)
                RETURNING request_id, member_id, coach_id, status, notes, created_at
            """, (str(current_user["user_id"]), str(data.coach_id), data.notes or None))

            conn.commit()
            return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not send join request"
        )


# ─── GET MY JOIN REQUESTS ────────────────────────────────────────────────────

@router.get("/join-requests")
def get_my_join_requests(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT r.request_id, r.member_id, r.coach_id, r.status, r.notes, r.created_at,
                   u.name as coach_name
            FROM coach_join_requests r
            JOIN users u ON r.coach_id = u.user_id
            WHERE r.member_id = %s
            ORDER BY r.created_at DESC
        """, (str(current_user["user_id"]),))
        return cursor.fetchall()


# ─── REQUEST A SESSION ────────────────────────────────────────────────────────

@router.post("/session-requests", status_code=201)
def request_session(
    data: SessionRequestCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO session_requests
                (member_id, coach_id, student_id, requested_date, requested_time, notes)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING request_id, member_id, coach_id, student_id,
                          requested_date, requested_time, status, notes, created_at
            """, (
                str(current_user["user_id"]),
                str(data.coach_id),
                str(data.student_id),
                data.requested_date,
                data.requested_time,
                data.notes or None
            ))

            conn.commit()
            return cursor.fetchone()

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not request session"
        )


# ─── GET MY SESSIONS ─────────────────────────────────────────────────────────

@router.get("/sessions")
def get_member_sessions(
    student_id: str = None,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

        # Default to own sessions if member is also a student
        sid = student_id or str(current_user["user_id"])

        cursor.execute("""
            SELECT
                s.session_id, s.date, s.start_time, s.duration_minutes,
                s.type, s.notes, s.created_at,
                c.name as court_name, c.area as court_area,
                u.name as coach_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'drill_id', d.drill_id,
                            'name', d.name,
                            'rating', sdr.rating
                        )
                    ) FILTER (WHERE d.drill_id IS NOT NULL),
                    '[]'
                ) as drills
            FROM sessions s
            JOIN session_students ss ON s.session_id = ss.session_id
            LEFT JOIN courts c ON s.court_id = c.court_id
            LEFT JOIN users u ON s.coach_id = u.user_id
            LEFT JOIN session_drills sd ON s.session_id = sd.session_id
            LEFT JOIN drills d ON sd.drill_id = d.drill_id
            LEFT JOIN session_drill_ratings sdr ON
                sdr.session_id = s.session_id AND
                sdr.drill_id = d.drill_id AND
                sdr.student_id = %s
            WHERE ss.student_id = %s
            GROUP BY s.session_id, c.name, c.area, u.name
            ORDER BY s.date DESC
        """, (sid, sid))

        return cursor.fetchall()


# ─── GET MY PROGRESS ─────────────────────────────────────────────────────────

@router.get("/progress")
def get_member_progress(
    student_id: str = None,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

        sid = student_id or str(current_user["user_id"])

        cursor.execute("""
            SELECT
                s.date,
                d.name as drill_name,
                sdr.rating,
                AVG(sdr.rating) OVER (
                    PARTITION BY sdr.drill_id
                    ORDER BY s.date
                    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
                ) as rolling_avg
            FROM session_drill_ratings sdr
            JOIN sessions s ON sdr.session_id = s.session_id
            JOIN drills d ON sdr.drill_id = d.drill_id
            WHERE sdr.student_id = %s
            ORDER BY s.date ASC
        """, (sid,))

        return cursor.fetchall()