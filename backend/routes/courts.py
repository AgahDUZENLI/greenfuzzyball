from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach

router = APIRouter()


# ─── GET ALL COURTS ───────────────────────────────────────────────────────────

@router.get("/")
def get_courts(
    city: str = None,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        if city:
            cursor.execute("""
                SELECT court_id, name, city, area
                FROM courts
                WHERE LOWER(city) = LOWER(%s)
                ORDER BY area, name
            """, (city,))
        else:
            cursor.execute("""
                SELECT court_id, name, city, area
                FROM courts
                ORDER BY city, area, name
            """)
        return cursor.fetchall()


# ─── GET COACH COURTS ─────────────────────────────────────────────────────────

@router.get("/mine")
def get_coach_courts(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT c.court_id, c.name, c.city, c.area
            FROM courts c
            JOIN coach_courts cc ON c.court_id = cc.court_id
            WHERE cc.coach_id = %s
            ORDER BY c.area, c.name
        """, (str(coach["user_id"]),))
        return cursor.fetchall()


# ─── ADD COURT TO COACH ───────────────────────────────────────────────────────

@router.post("/{court_id}/add")
def add_court_to_coach(
    court_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO coach_courts (coach_id, court_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (str(coach["user_id"]), court_id))
            conn.commit()
        return {"message": "Court added"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not add court"
        )


# ─── REMOVE COURT FROM COACH ──────────────────────────────────────────────────

@router.delete("/{court_id}/remove")
def remove_court_from_coach(
    court_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                DELETE FROM coach_courts
                WHERE coach_id = %s AND court_id = %s
            """, (str(coach["user_id"]), court_id))
            conn.commit()
        return {"message": "Court removed"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not remove court"
        )