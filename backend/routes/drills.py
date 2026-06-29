from fastapi import APIRouter, Depends, HTTPException, status, Query
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach

router = APIRouter()


# ─── GET ALL DRILLS (coach's library) ────────────────────────────────────────

@router.get("/")
def get_drills(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT 
                d.drill_id, d.name, d.description, d.coach_id,
                d.share_token, d.created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'drill_category_id', dc.drill_category_id,
                            'name', dc.name
                        )
                    ) FILTER (WHERE dc.drill_category_id IS NOT NULL),
                    '[]'
                ) as categories
            FROM drills d
            JOIN coach_drills cd ON d.drill_id = cd.drill_id
            LEFT JOIN drill_drill_categories ddc ON d.drill_id = ddc.drill_id
            LEFT JOIN drill_categories dc ON ddc.drill_category_id = dc.drill_category_id
            WHERE cd.coach_id = %s
            GROUP BY d.drill_id
            ORDER BY d.name ASC
        """, (str(coach["user_id"]),))
        return cursor.fetchall()


# ─── GET CATEGORIES ───────────────────────────────────────────────────────────

@router.get("/categories")
def get_categories(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT drill_category_id, name, coach_id
            FROM drill_categories
            WHERE coach_id IS NULL OR coach_id = %s
            ORDER BY name ASC
        """, (str(coach["user_id"]),))
        return cursor.fetchall()


# ─── CREATE DRILL ─────────────────────────────────────────────────────────────

@router.post("/", status_code=201)
def create_drill(
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Create drill with coach_id
            cursor.execute("""
                INSERT INTO drills (coach_id, name, description)
                VALUES (%s, %s, %s)
                RETURNING drill_id, name, description, coach_id, share_token, created_at
            """, (
                str(coach["user_id"]),
                data.get("name"),
                data.get("description")
            ))
            drill = cursor.fetchone()
            drill_id = drill["drill_id"]

            # Add to coach's library
            cursor.execute("""
                INSERT INTO coach_drills (coach_id, drill_id)
                VALUES (%s, %s)
            """, (str(coach["user_id"]), str(drill_id)))

            # Link categories
            for cat_id in data.get("category_ids", []):
                cursor.execute("""
                    INSERT INTO drill_drill_categories (drill_id, drill_category_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (str(drill_id), cat_id))

            conn.commit()

            # Return with categories
            cursor.execute("""
                SELECT 
                    d.drill_id, d.name, d.description, d.coach_id,
                    d.share_token, d.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'drill_category_id', dc.drill_category_id,
                                'name', dc.name
                            )
                        ) FILTER (WHERE dc.drill_category_id IS NOT NULL),
                        '[]'
                    ) as categories
                FROM drills d
                LEFT JOIN drill_drill_categories ddc ON d.drill_id = ddc.drill_id
                LEFT JOIN drill_categories dc ON ddc.drill_category_id = dc.drill_category_id
                WHERE d.drill_id = %s
                GROUP BY d.drill_id
            """, (str(drill_id),))
            return cursor.fetchone()

    except Exception as e:
        conn.rollback()
        print(f"CREATE DRILL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create drill"
        )


# ─── UPDATE DRILL ─────────────────────────────────────────────────────────────

@router.put("/{drill_id}")
def update_drill(
    drill_id: str,
    data: dict,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Only allow editing own drills
            cursor.execute("""
                SELECT 1 FROM drills
                WHERE drill_id = %s AND coach_id = %s
            """, (drill_id, str(coach["user_id"])))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only edit your own drills"
                )

            cursor.execute("""
                UPDATE drills SET name = %s, description = %s
                WHERE drill_id = %s
                RETURNING drill_id, name, description, coach_id, share_token, created_at
            """, (data.get("name"), data.get("description"), drill_id))

            conn.commit()

            # Return with categories
            cursor.execute("""
                SELECT 
                    d.drill_id, d.name, d.description, d.coach_id,
                    d.share_token, d.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'drill_category_id', dc.drill_category_id,
                                'name', dc.name
                            )
                        ) FILTER (WHERE dc.drill_category_id IS NOT NULL),
                        '[]'
                    ) as categories
                FROM drills d
                LEFT JOIN drill_drill_categories ddc ON d.drill_id = ddc.drill_id
                LEFT JOIN drill_categories dc ON ddc.drill_category_id = dc.drill_category_id
                WHERE d.drill_id = %s
                GROUP BY d.drill_id
            """, (drill_id,))
            return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"UPDATE DRILL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update drill"
        )


# ─── REMOVE DRILL FROM LIBRARY ────────────────────────────────────────────────

@router.delete("/{drill_id}/remove", status_code=204)
def remove_drill_from_library(
    drill_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                DELETE FROM coach_drills
                WHERE coach_id = %s AND drill_id = %s
            """, (str(coach["user_id"]), drill_id))
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not remove drill"
        )


# ─── DELETE DRILL PERMANENTLY (own drills only) ───────────────────────────────

@router.delete("/{drill_id}", status_code=204)
def delete_drill(
    drill_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT coach_id FROM drills WHERE drill_id = %s
            """, (drill_id,))
            drill = cursor.fetchone()

            if not drill:
                raise HTTPException(status_code=404, detail="Drill not found")

            if str(drill[0]) != str(coach["user_id"]):
                # Not owner — just remove from library
                cursor.execute("""
                    DELETE FROM coach_drills
                    WHERE coach_id = %s AND drill_id = %s
                """, (str(coach["user_id"]), drill_id))
            else:
                # Owner — delete permanently
                cursor.execute("DELETE FROM drills WHERE drill_id = %s", (drill_id,))

            conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete drill"
        )


# ─── SHARE DRILL ─────────────────────────────────────────────────────────────
@router.get("/share/{token}")
def get_shared_drill(token: str, conn=Depends(get_db)):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT 
                d.drill_id, d.name, d.description, d.share_token,
                u.name as coach_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'drill_category_id', dc.drill_category_id,
                            'name', dc.name
                        )
                    ) FILTER (WHERE dc.drill_category_id IS NOT NULL),
                    '[]'
                ) as categories
            FROM drills d
            JOIN users u ON d.coach_id = u.user_id
            LEFT JOIN drill_drill_categories ddc ON d.drill_id = ddc.drill_id
            LEFT JOIN drill_categories dc ON ddc.drill_category_id = dc.drill_category_id
            WHERE d.share_token = %s
            GROUP BY d.drill_id, u.name
        """, (token,))

        drill = cursor.fetchone()
        if not drill:
            raise HTTPException(status_code=404, detail="Drill not found")
        return drill


# ─── IMPORT SHARED DRILL ─────────────────────────────────────────────────────
@router.post("/share/{token}/import", status_code=201)
def import_shared_drill(
    token: str,
    force: bool = Query(False),
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            cursor.execute("""
                SELECT d.*, 
                    array_agg(ddc.drill_category_id) FILTER (WHERE ddc.drill_category_id IS NOT NULL) as category_ids
                FROM drills d
                LEFT JOIN drill_drill_categories ddc ON d.drill_id = ddc.drill_id
                WHERE d.share_token = %s
                GROUP BY d.drill_id
            """, (token,))

            original = cursor.fetchone()
            if not original:
                raise HTTPException(status_code=404, detail="Drill not found")

            cursor.execute("""
                SELECT d.drill_id, d.name FROM drills d
                JOIN coach_drills cd ON d.drill_id = cd.drill_id
                WHERE cd.coach_id = %s AND LOWER(d.name) = LOWER(%s)
            """, (str(coach["user_id"]), original["name"]))

            existing = cursor.fetchone()

            if existing and not force:
                raise HTTPException(
                    status_code=409,
                    detail=f"You already have a drill named '{original['name']}'"
                )

            name = f"{original['name']} (copy)" if existing else original["name"]

            cursor.execute("""
                INSERT INTO drills (coach_id, name, description)
                VALUES (%s, %s, %s)
                RETURNING drill_id
            """, (str(coach["user_id"]), name, original["description"]))

            new_drill_id = cursor.fetchone()["drill_id"]

            cursor.execute("""
                INSERT INTO coach_drills (coach_id, drill_id)
                VALUES (%s, %s)
            """, (str(coach["user_id"]), str(new_drill_id)))

            category_ids = original["category_ids"] or []
            if isinstance(category_ids, str):
                category_ids = [c.strip() for c in category_ids.strip('{}').split(',') if c.strip()]

            for cat_id in category_ids:
                if cat_id:
                    cursor.execute("""
                        INSERT INTO drill_drill_categories (drill_id, drill_category_id)
                        VALUES (%s, %s) ON CONFLICT DO NOTHING
                    """, (str(new_drill_id), str(cat_id)))

            conn.commit()
            return {"message": "Drill imported successfully", "drill_id": str(new_drill_id), "name": name}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"IMPORT DRILL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not import drill"
        )