from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import (
    CreateStudentRequest,
    UpdateStudentRequest,
    StudentResponse
)

router = APIRouter()


# ─── CREATE STUDENT ──────────────────────────────────────────────────────────

@router.post("/", response_model=StudentResponse, status_code=201)
def create_student(
    data: CreateStudentRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Step 1 — create user
            cursor.execute("""
                INSERT INTO users (name, email, phone, location, role)
                VALUES (%s, %s, %s, %s, 'student')
                RETURNING user_id
            """, (data.name, data.email, data.phone, data.location))

            user = cursor.fetchone()
            user_id = user["user_id"]

            # Step 2 — create student profile
            cursor.execute("""
                INSERT INTO students (user_id, age_group, level, notes)
                VALUES (%s, %s, %s, %s)
            """, (str(user_id), data.age_group, data.level, data.notes))

            # Step 3 — link student to coach
            cursor.execute("""
                INSERT INTO coach_students (coach_id, student_id)
                VALUES (%s, %s)
            """, (str(coach["user_id"]), str(user_id)))

            # Step 4 — return full student data
            cursor.execute("""
                SELECT u.user_id, u.name, u.email, u.phone, u.location,
                       s.age_group, s.level, s.notes
                FROM users u
                JOIN students s ON u.user_id = s.user_id
                WHERE u.user_id = %s
            """, (str(user_id),))

            conn.commit()
            return cursor.fetchone()

    except Exception as e:
        conn.rollback()
        print(f"CREATE STUDENT ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create student"
        )


# ─── GET ALL STUDENTS ─────────────────────────────────────────────────────────

@router.get("/", response_model=list[StudentResponse])
def get_students(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT u.user_id, u.name, u.email, u.phone, u.location,
                   s.age_group, s.level, s.notes
            FROM users u
            JOIN students s ON u.user_id = s.user_id
            JOIN coach_students cs ON s.user_id = cs.student_id
            WHERE cs.coach_id = %s
            ORDER BY u.name
        """, (str(coach["user_id"]),))

        return cursor.fetchall()


# ─── GET ONE STUDENT ──────────────────────────────────────────────────────────

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT u.user_id, u.name, u.email, u.phone, u.location,
                   s.age_group, s.level, s.notes
            FROM users u
            JOIN students s ON u.user_id = s.user_id
            JOIN coach_students cs ON s.user_id = cs.student_id
            WHERE cs.coach_id = %s AND u.user_id = %s
        """, (str(coach["user_id"]), student_id))

        student = cursor.fetchone()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        return student


# ─── UPDATE STUDENT ───────────────────────────────────────────────────────────

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    data: UpdateStudentRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Verify student belongs to this coach
            cursor.execute("""
                SELECT 1 FROM coach_students
                WHERE coach_id = %s AND student_id = %s
            """, (str(coach["user_id"]), student_id))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student not found"
                )

            # Update users table
            if any([data.name, data.email, data.phone, data.location]):
                cursor.execute("""
                    UPDATE users SET
                        name = COALESCE(%s, name),
                        email = COALESCE(%s, email),
                        phone = COALESCE(%s, phone),
                        location = COALESCE(%s, location)
                    WHERE user_id = %s
                """, (data.name, data.email, data.phone, data.location, student_id))

            # Update students table
            if any([data.age_group, data.level, data.notes]):
                cursor.execute("""
                    UPDATE students SET
                        age_group = COALESCE(%s, age_group),
                        level = COALESCE(%s, level),
                        notes = COALESCE(%s, notes)
                    WHERE user_id = %s
                """, (data.age_group, data.level, data.notes, student_id))

            # Return updated student
            cursor.execute("""
                SELECT u.user_id, u.name, u.email, u.phone, u.location,
                       s.age_group, s.level, s.notes
                FROM users u
                JOIN students s ON u.user_id = s.user_id
                WHERE u.user_id = %s
            """, (student_id,))

            conn.commit()
            return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"UPDATE STUDENT ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update student"
        )


# ─── DELETE STUDENT ───────────────────────────────────────────────────────────

@router.delete("/{student_id}", status_code=204)
def delete_student(
    student_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:

            # Verify student belongs to this coach
            cursor.execute("""
                SELECT 1 FROM coach_students
                WHERE coach_id = %s AND student_id = %s
            """, (str(coach["user_id"]), student_id))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student not found"
                )

            # Find sessions where this student is the only participant
            cursor.execute("""
                SELECT ss.session_id
                FROM session_students ss
                WHERE ss.student_id = %s
                  AND NOT EXISTS (
                      SELECT 1 FROM session_students ss2
                      WHERE ss2.session_id = ss.session_id AND ss2.student_id != %s
                  )
            """, (student_id, student_id))

            solo_session_ids = [row[0] for row in cursor.fetchall()]

            # Delete those sessions entirely (cascades to session_students,
            # session_drills, session_drill_ratings)
            if solo_session_ids:
                cursor.execute("""
                    DELETE FROM sessions WHERE session_id = ANY(%s::uuid[])
                """, (solo_session_ids,))

            # Delete user (cascades to students, coach_students, and removes
            # this student from any remaining shared sessions)
            cursor.execute("""
                DELETE FROM users WHERE user_id = %s
            """, (student_id,))

            conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"DELETE STUDENT ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete student"
        )