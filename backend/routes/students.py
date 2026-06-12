from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def students_root():
    return {"message": "students routes"}