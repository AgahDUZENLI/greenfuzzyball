from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def drills_root():
    return {"message": "drills routes"}