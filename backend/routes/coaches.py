from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def coaches_root():
    return {"message": "coaches routes"}