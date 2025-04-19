from fastapi import FastAPI
from app.routers import academic_plan, semester, course, requirement
from app.core.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Academic Plan Service",
    description="API for managing academic plans, semesters, and courses",
    version="1.0.0"
)

# Include routers
app.include_router(academic_plan.router, prefix="/academic-plans", tags=["Academic Plans"])
app.include_router(semester.router, prefix="/semesters", tags=["Semesters"])
app.include_router(course.router, prefix="/courses", tags=["Courses"])
app.include_router(requirement.router, prefix="/requirements", tags=["Requirements"])