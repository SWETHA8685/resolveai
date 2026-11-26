from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models
from routes import router as incident_router

# Create database tables when the application starts.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResolveAI",
    description="AI-powered IT incident management and root cause analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incident_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to ResolveAI",
        "status": "Running successfully",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy", "application": "ResolveAI"}
