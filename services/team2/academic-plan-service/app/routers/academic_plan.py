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
router = APIRouter()

# Create a new academic plan
@router.post("/", response_model=AcademicPlan)
def create_plan(academic_plan: AcademicPlanCreate, db: Session = Depends(get_db)):
    return create_academic_plan(db, academic_plan)

# Get a specific academic plan by ID
@router.get("/{academic_plan_id}", response_model=AcademicPlan)
def read_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return get_academic_plan(db, academic_plan_id)

# Get all academic plans with pagination
@router.get("/", response_model=list[AcademicPlan])
def read_all_plans(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_all_academic_plans(db, skip=skip, limit=limit)

# Update an academic plan (creates a new version)
@router.put("/{academic_plan_id}", response_model=AcademicPlan)
def update_plan(academic_plan_id: int, academic_plan: AcademicPlanCreate, db: Session = Depends(get_db)):
    return update_academic_plan(db, academic_plan_id, academic_plan)

# Delete an academic plan
@router.delete("/{academic_plan_id}", response_model=dict)
def delete_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return delete_academic_plan(db, academic_plan_id)

# Check if an academic plan fulfills all requirements
@router.get("/{academic_plan_id}/requirements", response_model=dict)
def check_fulfillment_route(academic_plan_id: int, db: Session = Depends(get_db)):
    return check_requirements_fulfillment(db, academic_plan_id)

# Generate a new academic plan based on requirements and preferences
@router.post("/generate", response_model=AcademicPlan)
def generate_plan_route(request: PlanGenerationRequest, db: Session = Depends(get_db)):
    return generate_plan(db, request.student_id, request.program, request.preferences)

# Restore a specific version of an academic plan
@router.post("/{student_id}/{program}/restore/{version}", response_model=AcademicPlan)
def restore_plan_version(student_id: int, program: str, version: int, db: Session = Depends(get_db)):
    from app.crud.academic_plan import restore_academic_plan_version
    return restore_academic_plan_version(db, student_id, program, version)

# Get all versions of an academic plan for a student and program
@router.get("/{student_id}/{program}/versions", response_model=list[AcademicPlan])
def get_plan_versions(student_id: int, program: str, db: Session = Depends(get_db)):
    plans = db.query(AcademicPlanModel).filter(
        AcademicPlanModel.student_id == student_id,
        AcademicPlanModel.program == program
    ).order_by(AcademicPlanModel.version.desc()).all()
    if not plans:
        raise HTTPException(status_code=404, detail="No plans found for the given student and program.")
    return plans
# Implementing workflow logic for academic plans
@router.put("/{academic_plan_id}/approve", response_model=AcademicPlan)
def approve_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return approve_academic_plan(db, academic_plan_id)

@router.put("/{academic_plan_id}/reject", response_model=AcademicPlan)
def reject_plan(academic_plan_id: int, db: Session = Depends(get_db)):
    return reject_academic_plan(db, academic_plan_id)


#comare two academic plans
@router.post("/academic-plans/compare", response_model=dict)
def compare_plans(plan_ids: list[int], db: Session = Depends(get_db)):
    return compare_academic_plans(db, plan_ids)