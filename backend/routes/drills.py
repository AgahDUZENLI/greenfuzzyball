from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2.extras

from db.connection import get_db
from middleware.auth_middleware import get_current_coach
from models.schemas import (
    CreateDrillRequest,
    UpdateDrillRequest,
    DrillResponse,
    CreateCategoryRequest,
    CategoryResponse
)

router = APIRouter()


# ─── CATEGORIES ──────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT drill_category_id, name, coach_id
            FROM drill_categories
            WHERE coach_id IS NULL OR coach_id = %s
            ORDER BY name
        """, (str(coach["user_id"]),))
        return cursor.fetchall()


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CreateCategoryRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO drill_categories (coach_id, name)
                VALUES (%s, %s)
                RETURNING drill_category_id, name, coach_id
            """, (str(coach["user_id"]), data.name))
            conn.commit()
            return cursor.fetchone()
    except Exception as e:
        conn.rollback()
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create category"
        )


# ─── DRILLS ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[DrillResponse])
def get_drills(
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT d.drill_id, d.name, d.description, d.created_at
            FROM drills d
            WHERE d.coach_id = %s
            ORDER BY d.name
        """, (str(coach["user_id"]),))
        drills = cursor.fetchall()

        # Get categories for each drill
        result = []
        for drill in drills:
            cursor.execute("""
                SELECT dc.drill_category_id, dc.name, dc.coach_id
                FROM drill_categories dc
                JOIN drill_drill_categories ddc 
                    ON dc.drill_category_id = ddc.drill_category_id
                WHERE ddc.drill_id = %s
            """, (str(drill["drill_id"]),))
            categories = cursor.fetchall()
            drill_dict = dict(drill)
            drill_dict["categories"] = categories
            result.append(drill_dict)

        return result


@router.post("/", response_model=DrillResponse, status_code=201)
def create_drill(
    data: CreateDrillRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Create drill
            cursor.execute("""
                INSERT INTO drills (coach_id, name, description)
                VALUES (%s, %s, %s)
                RETURNING drill_id, name, description, created_at
            """, (str(coach["user_id"]), data.name, data.description))

            drill = cursor.fetchone()
            drill_id = drill["drill_id"]

            # Link categories
            for category_id in data.category_ids:
                cursor.execute("""
                    INSERT INTO drill_drill_categories (drill_id, drill_category_id)
                    VALUES (%s, %s)
                """, (str(drill_id), str(category_id)))

            # Get categories for response
            cursor.execute("""
                SELECT dc.drill_category_id, dc.name, dc.coach_id
                FROM drill_categories dc
                JOIN drill_drill_categories ddc
                    ON dc.drill_category_id = ddc.drill_category_id
                WHERE ddc.drill_id = %s
            """, (str(drill_id),))

            drill_dict = dict(drill)
            drill_dict["categories"] = cursor.fetchall()

            conn.commit()
            return drill_dict

    except Exception as e:
        conn.rollback()
        print(f"CREATE DRILL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create drill"
        )


@router.get("/{drill_id}", response_model=DrillResponse)
def get_drill(
    drill_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
        cursor.execute("""
            SELECT drill_id, name, description, created_at
            FROM drills
            WHERE drill_id = %s AND coach_id = %s
        """, (drill_id, str(coach["user_id"])))

        drill = cursor.fetchone()
        if not drill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drill not found"
            )

        cursor.execute("""
            SELECT dc.drill_category_id, dc.name, dc.coach_id
            FROM drill_categories dc
            JOIN drill_drill_categories ddc
                ON dc.drill_category_id = ddc.drill_category_id
            WHERE ddc.drill_id = %s
        """, (drill_id,))

        drill_dict = dict(drill)
        drill_dict["categories"] = cursor.fetchall()
        return drill_dict


@router.put("/{drill_id}", response_model=DrillResponse)
def update_drill(
    drill_id: str,
    data: UpdateDrillRequest,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # Verify drill belongs to coach
            cursor.execute("""
                SELECT 1 FROM drills
                WHERE drill_id = %s AND coach_id = %s
            """, (drill_id, str(coach["user_id"])))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Drill not found"
                )

            # Update drill
            if data.name or data.description:
                cursor.execute("""
                    UPDATE drills SET
                        name = COALESCE(%s, name),
                        description = COALESCE(%s, description)
                    WHERE drill_id = %s
                """, (data.name, data.description, drill_id))

            # Update categories if provided
            if data.category_ids is not None:
                cursor.execute("""
                    DELETE FROM drill_drill_categories
                    WHERE drill_id = %s
                """, (drill_id,))

                for category_id in data.category_ids:
                    cursor.execute("""
                        INSERT INTO drill_drill_categories (drill_id, drill_category_id)
                        VALUES (%s, %s)
                    """, (drill_id, str(category_id)))

            # Return updated drill
            cursor.execute("""
                SELECT drill_id, name, description, created_at
                FROM drills WHERE drill_id = %s
            """, (drill_id,))

            drill = cursor.fetchone()
            cursor.execute("""
                SELECT dc.drill_category_id, dc.name, dc.coach_id
                FROM drill_categories dc
                JOIN drill_drill_categories ddc
                    ON dc.drill_category_id = ddc.drill_category_id
                WHERE ddc.drill_id = %s
            """, (drill_id,))

            drill_dict = dict(drill)
            drill_dict["categories"] = cursor.fetchall()

            conn.commit()
            return drill_dict

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"UPDATE DRILL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update drill"
        )


@router.delete("/{drill_id}", status_code=204)
def delete_drill(
    drill_id: str,
    conn=Depends(get_db),
    coach=Depends(get_current_coach)
):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 1 FROM drills
                WHERE drill_id = %s AND coach_id = %s
            """, (drill_id, str(coach["user_id"])))

            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Drill not found"
                )

            cursor.execute("""
                DELETE FROM drills WHERE drill_id = %s
            """, (drill_id,))

            conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"DELETE DRILL ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete drill"
        )