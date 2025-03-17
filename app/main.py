from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import courses, sections
from app.database.database import engine, Base

# Note: We're not creating tables here anymore
# Use alembic migrations instead: alembic upgrade head

app = FastAPI(
    title="Course Management API",
    description="API for managing university courses and sections",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses.router)
app.include_router(sections.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Course Management API",
        "docs": "/docs",
        "openapi": "/openapi.json"
    } 