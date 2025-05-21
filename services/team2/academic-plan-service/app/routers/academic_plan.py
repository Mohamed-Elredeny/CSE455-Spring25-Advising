from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.academic_plan import AcademicPlan, AcademicPlanCreate, PlanGenerationRequest
from app.crud.academic_plan import (
    create_academic_plan,
    get_academic_plan,
    get_all_academic_plans,
    update_academic_plan,
    delete_academic_plan,
    check_requirements_fulfillment,
    approve_academic_plan,
    reject_academic_plan,
    compare_academic_plans,
)
from app.crud.plan_generation import generate_plan
from app.core.database import get_db
from app.models.academic_plan import AcademicPlan as AcademicPlanModel
from fastapi import File, UploadFile
import pandas as pd
from app.models.course import Course
from app.models.semester import Semester

router = APIRouter()

# Create a new academic plan
@router.post(
    "/",
    response_model=AcademicPlan,
    tags=["Academic Plans"],
    summary="Create a new academic plan",
    description="This endpoint allows you to create a new academic plan for a student, including semesters and courses."
)
def create_plan(academic_plan: AcademicPlanCreate, db: Session = Depends(get_db)):
    """
    Create a new academic plan.

    - **student_id**: The ID of the student.
    - **program**: The academic program (e.g., "Computer Science").
    - **semesters**: A list of semesters, each containing courses.
    """
    return create_academic_plan(db, academic_plan)

# Get a specific academic plan by ID
@router.get(
    "/{academic_plan_id}",
    response_model=AcademicPlan,
    tags=["Academic Plans"],
    summary="Get an academic plan by ID",
    description="Retrieve a specific academic plan by its ID.",
    responses={
        200: {"description": "Academic plan retrieved successfully"},
        404: {"description": "Academic plan not found"},
    },
)
def read_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return get_academic_plan(db, academic_plan_id)

# Get all academic plans with pagination
@router.get(
    "/",
    response_model=list[AcademicPlan],
    tags=["Academic Plans"],
    summary="Get all academic plans",
    description="Retrieve all academic plans with optional pagination.",
)
def read_all_plans(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_all_academic_plans(db, skip=skip, limit=limit)

# Update an academic plan (creates a new version)
@router.put(
    "/{academic_plan_id}",
    response_model=AcademicPlan,
    tags=["Academic Plans"],
    summary="Update an academic plan",
    description="Update an academic plan by creating a new version.",
)
def update_plan(academic_plan_id: int, academic_plan: AcademicPlanCreate, db: Session = Depends(get_db)):
    return update_academic_plan(db, academic_plan_id, academic_plan)

# Delete an academic plan
@router.delete(
    "/{academic_plan_id}",
    response_model=dict,
    tags=["Academic Plans"],
    summary="Delete an academic plan",
    description="Delete an academic plan by its ID.",
)
def delete_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return delete_academic_plan(db, academic_plan_id)

# Check if an academic plan fulfills all requirements
@router.get(
    "/{academic_plan_id}/requirements",
    response_model=dict,
    tags=["Academic Plans"],
    summary="Check requirements fulfillment",
    description="Check if an academic plan fulfills all program requirements.",
)
def check_fulfillment_route(academic_plan_id: int, db: Session = Depends(get_db)):
    return check_requirements_fulfillment(db, academic_plan_id)

# Generate a new academic plan based on requirements and preferences
@router.post(
    "/generate",
    response_model=AcademicPlan,
    tags=["Academic Plans"],
    summary="Generate a new academic plan",
    description="Generate a new academic plan based on requirements and preferences.",
)
def generate_plan_route(request: PlanGenerationRequest, db: Session = Depends(get_db)):
    """
    Generate a new academic plan.

    - **program**: The academic program (e.g., "Computer Science").
    - **preferences**: Optional preferences for plan generation (e.g., max credits per semester).
    """
    return generate_plan(db, request.program, request.preferences)


# Restore a specific version of an academic plan (by program and version)
@router.post(
    "/{program}/restore/{version}",
    response_model=AcademicPlan,
    tags=["Academic Plans"],
    summary="Restore an academic plan version",
    description="Restore a specific version of an academic plan for a program.",
)
def restore_plan_version(program: str, version: int, db: Session = Depends(get_db)):
    from app.crud.academic_plan import restore_academic_plan_version
    return restore_academic_plan_version(db, program, version)

# Get all versions of an academic plan for a program
@router.get(
    "/{program}/versions",
    response_model=list[AcademicPlan],
    tags=["Academic Plans"],
    summary="Get all versions of an academic plan",
    description="Retrieve all versions of an academic plan for a specific program.",
)
def get_plan_versions(program: str, db: Session = Depends(get_db)):
    plans = db.query(AcademicPlanModel).filter(
        AcademicPlanModel.program == program
    ).order_by(AcademicPlanModel.version.desc()).all()
    if not plans:
        raise HTTPException(status_code=404, detail="No plans found for the given program.")
    return plans

# Approve an academic plan
@router.put(
    "/{academic_plan_id}/approve",
    response_model=AcademicPlan,
    tags=["Academic Plans"],
    summary="Approve an academic plan",
    description="Approve an academic plan by its ID.",
)
def approve_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return approve_academic_plan(db, academic_plan_id)

# Reject an academic plan
@router.put(
    "/{academic_plan_id}/reject",
    response_model=AcademicPlan,
    tags=["Academic Plans"],
    summary="Reject an academic plan",
    description="Reject an academic plan by its ID.",
)
def reject_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return reject_academic_plan(db, academic_plan_id)

# Compare two academic plans
@router.post(
    "/academic-plans/compare",
    response_model=dict,
    tags=["Academic Plans"],
    summary="Compare academic plans",
    description="Compare two or more academic plans and highlight their differences.",
)
def compare_plans(plan_ids: list[int], db: Session = Depends(get_db)):
    """
    Compare academic plans.

    - **plan_ids**: A list of academic plan IDs to compare.
    """
    return compare_academic_plans(db, plan_ids)


# Upload an academic plan via Excel
@router.post(
    "/upload",
    tags=["Academic Plans"],
    summary="Upload an academic plan via Excel",
    description="Upload an academic plan for a program using an Excel file."
)
def upload_academic_plan(program: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload an academic plan for a program using an Excel file.

    - **program**: The academic program (e.g., "Computer Science").
    - **file**: The Excel file containing the academic plan.
    """
    try:
        # Read the Excel file
        df = pd.read_excel(file.file)

        # Validate the Excel file structure
        required_columns = ["Semester", "Course Code", "Course Title", "Credits", "Description", "Prerequisites"]
        if not all(column in df.columns for column in required_columns):
            raise HTTPException(status_code=400, detail=f"Excel file must contain the following columns: {', '.join(required_columns)}")

        # Create a new academic plan
        db_academic_plan = AcademicPlanModel(program=program)
        db.add(db_academic_plan)
        db.commit()
        db.refresh(db_academic_plan)

        # Process the Excel data
        semesters = {}
        for _, row in df.iterrows():
            semester_name = row["Semester"]
            if semester_name not in semesters:
                db_semester = Semester(name=semester_name, academic_plan_id=db_academic_plan.id)
                db.add(db_semester)
                db.commit()
                db.refresh(db_semester)
                semesters[semester_name] = db_semester

            db_course = Course(
                code=row["Course Code"],
                title=row["Course Title"],
                credits=row["Credits"],
                description=row["Description"],
                prerequisites=row["Prerequisites"].split(",") if row["Prerequisites"] else [],
                semester_id=semesters[semester_name].id
            )
            db.add(db_course)
            db.commit()

        return {"message": "Academic plan uploaded successfully", "program": program}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload academic plan: {str(e)}")