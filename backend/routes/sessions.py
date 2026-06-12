from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def sessions_root():
    return {"message": "sessions routes"}