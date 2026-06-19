from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.middleware.sessions import SessionMiddleware


from config import settings
from db.connection import init_db, close_db
from routes import auth, coaches, students, drills, sessions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print(f"CoachPilot API starting in {settings.ENVIRONMENT} mode")
    yield
    # Shutdown
    close_db()
    print("CoachPilot API shutting down")


app = FastAPI(
    title="CoachPilot API",
    description="Tennis coaching management API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allows React frontend to talk to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(coaches.router, prefix="/coaches", tags=["coaches"])
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(drills.router, prefix="/drills", tags=["drills"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": "CoachPilot API",
        "version": "1.0.0"
    }