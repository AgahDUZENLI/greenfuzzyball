from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import CreateCourtRequest, UpdateCourtRequest, CourtResponse

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
                SELECT court_id, name, city, area, address, map_url
                FROM courts
                WHERE created_by IS NULL AND LOWER(city) = LOWER(%s)
                ORDER BY area, name
            """, (city,))
        else:
            cursor.execute("""
                SELECT court_id, name, city, area, address, map_url
                FROM courts
                WHERE created_by IS NULL
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
            SELECT court_id, name, city, area, address, map_url,
                   (created_by = %s) as is_own
            FROM courts
            WHERE created_by IS NULL OR created_by = %s
            ORDER BY area, name
        """, (str(coach["user_id"]), str(coach["user_id"])))
        return cursor.fetchall()


# ─── CREATE COURT ─────────────────────────────────────────────────────────────

@router.post("/", response_model=CourtResponse, status_code=201)
def create_court(
    data: CreateCourtRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO courts (name, city, area, address, map_url, created_by)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING court_id, name, city, area, address, map_url
            """, (
                data.name, data.city, data.area, data.address, data.map_url,
                str(coach["user_id"])
            ))
            court = cursor.fetchone()
            conn.commit()
            court["is_own"] = True
            return court
    except Exception:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create location"
        )


# ─── UPDATE COURT ──────────────────────────────────────────────────────────────

@router.patch("/{court_id}", response_model=CourtResponse)
def update_court(
    court_id: str,
    data: UpdateCourtRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT court_id FROM courts WHERE court_id = %s AND created_by = %s
            """, (court_id, str(coach["user_id"])))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Location not found")

            set_parts = []
            values = []
            if data.name is not None:
                set_parts.append("name = %s")
                values.append(data.name)
            if data.city is not None:
                set_parts.append("city = %s")
                values.append(data.city)
            if data.area is not None:
                set_parts.append("area = %s")
                values.append(data.area)
            if data.address is not None:
                set_parts.append("address = %s")
                values.append(data.address)
            if data.map_url is not None:
                set_parts.append("map_url = %s")
                values.append(data.map_url)

            if set_parts:
                values.append(court_id)
                cursor.execute(f"""
                    UPDATE courts SET {', '.join(set_parts)}
                    WHERE court_id = %s
                """, values)

            cursor.execute("""
                SELECT court_id, name, city, area, address, map_url
                FROM courts WHERE court_id = %s
            """, (court_id,))
            court = cursor.fetchone()
            conn.commit()
            court["is_own"] = True
            return court

    except HTTPException:
        raise
    except Exception:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update location"
        )


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