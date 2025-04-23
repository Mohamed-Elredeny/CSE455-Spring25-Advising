from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.schemas.academic_plan import AcademicPlanCreate
from app.models.academic_plan import AcademicPlan as AcademicPlanModel
from app.models.semester import Semester
from app.models.course import Course
from app.models.Requirement import Requirement
from app.schemas.requirement import Requirement as RequirementSchema
from app.models.academic_plan import PlanStatus  # Import PlanStatus


def create_academic_plan(db: Session, academic_plan: AcademicPlanCreate):
    try:
        # Validate program
        valid_programs = ["Computer Science", "Engineering", "Mathematics"]  # Example list of valid programs
        if academic_plan.program not in valid_programs:
            raise HTTPException(status_code=400, detail=f"Invalid program: {academic_plan.program}")

        # Validate semesters
        if not academic_plan.semesters:
            raise HTTPException(status_code=400, detail="Academic plan must have at least one semester.")
        
        semester_names = set()
        total_credits = 0
        completed_courses = set()  # Tracks completed courses for prerequisite validation

        for semester in academic_plan.semesters:
            if semester.name in semester_names:
                raise HTTPException(status_code=400, detail=f"Duplicate semester name: {semester.name}")
            semester_names.add(semester.name)

            # Validate courses
            if not semester.courses:
                raise HTTPException(status_code=400, detail=f"Semester '{semester.name}' must have at least one course.")
            
            course_codes = set()
            semester_credits = 0

            for course in semester.courses:
                if course.code in course_codes:
                    raise HTTPException(status_code=400, detail=f"Duplicate course code '{course.code}' in semester '{semester.name}'.")
                course_codes.add(course.code)

                # Validate prerequisites
                for prerequisite in course.prerequisites:
                    if prerequisite not in completed_courses:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Course '{course.code}' in semester '{semester.name}' has unmet prerequisite '{prerequisite}'."
                        )

                # Add course to completed courses
                completed_courses.add(course.code)

                # Add credits
                semester_credits += course.credits
                total_credits += course.credits

            # Validate per-semester credit limit
            if semester_credits > 18:  # Example limit
                raise HTTPException(
                    status_code=400,
                    detail=f"Semester '{semester.name}' exceeds the credit limit of 18 credits (total: {semester_credits})."
                )

        # Validate total credits
        if total_credits < 2:  # Example minimum total credits for a program
            raise HTTPException(
                status_code=400,
                detail=f"Academic plan does not meet the minimum total credit requirement of 120 credits (total: {total_credits})."
            )
        # Check if a plan already exists for the student and program
        existing_plans = db.query(AcademicPlanModel).filter(
            AcademicPlanModel.student_id == academic_plan.student_id,
            AcademicPlanModel.program == academic_plan.program
        ).all()

        # Determine the new version number
        new_version = max([plan.version for plan in existing_plans], default=0) + 1


        # Create the academic plan
        db_academic_plan = AcademicPlanModel(
            student_id=academic_plan.student_id,
            program=academic_plan.program
        )
        db.add(db_academic_plan)
        db.commit()
        db.refresh(db_academic_plan)

        # Add semesters and courses
        for semester in academic_plan.semesters:
            db_semester = Semester(name=semester.name, academic_plan_id=db_academic_plan.id)
            db.add(db_semester)
            db.commit()
            db.refresh(db_semester)

            for course in semester.courses:
                db_course = Course(
                    code=course.code,
                    title=course.title,
                    credits=course.credits,
                    description=course.description,
                    prerequisites=course.prerequisites,
                    semester_id=db_semester.id
                )
                db.add(db_course)
                db.commit()

        return db_academic_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create academic plan: {str(e)}")

def get_academic_plan(db: Session, academic_plan_id: int):
    db_academic_plan = db.query(AcademicPlanModel).filter(AcademicPlanModel.id == academic_plan_id).first()
    if not db_academic_plan:
        raise HTTPException(status_code=404, detail="Academic Plan not found")
    return db_academic_plan

def get_all_academic_plans(db: Session, skip: int = 0, limit: int = 10):
    return db.query(AcademicPlanModel).offset(skip).limit(limit).all()

def update_academic_plan(db: Session, academic_plan_id: int, academic_plan: AcademicPlanCreate):
    try:
        # Fetch the existing academic plan
        db_academic_plan = db.query(AcademicPlanModel).filter(AcademicPlanModel.id == academic_plan_id).first()
        if not db_academic_plan:
            raise HTTPException(status_code=404, detail="Academic Plan not found")

        # Determine the new version number
        existing_plans = db.query(AcademicPlanModel).filter(
            AcademicPlanModel.student_id == db_academic_plan.student_id,
            AcademicPlanModel.program == db_academic_plan.program
        ).all()
        new_version = max([plan.version for plan in existing_plans], default=0) + 1

        # Create a new academic plan with the updated data
        new_plan = AcademicPlanModel(
            student_id=db_academic_plan.student_id,
            program=db_academic_plan.program,
            version=new_version
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        # Add updated semesters and courses to the new plan
        for semester in academic_plan.semesters:
            db_semester = Semester(name=semester.name, academic_plan_id=new_plan.id)
            db.add(db_semester)
            db.commit()
            db.refresh(db_semester)

            for course in semester.courses:
                db_course = Course(
                    code=course.code,
                    title=course.title,
                    credits=course.credits,
                    description=course.description,
                    prerequisites=course.prerequisites,
                    semester_id=db_semester.id
                )
                db.add(db_course)
                db.commit()

        return new_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update academic plan: {str(e)}")
    
def delete_academic_plan(db: Session, academic_plan_id: int):
    try:
        # Delete related semesters and courses
        db.query(Course).filter(Course.semester_id.in_(
            db.query(Semester.id).filter(Semester.academic_plan_id == academic_plan_id)
        )).delete(synchronize_session=False)
        db.query(Semester).filter(Semester.academic_plan_id == academic_plan_id).delete(synchronize_session=False)
        db.commit()

        # Delete the academic plan
        db_academic_plan = db.query(AcademicPlanModel).filter(AcademicPlanModel.id == academic_plan_id).first()
        if not db_academic_plan:
            raise HTTPException(status_code=404, detail="Academic Plan not found")
        db.delete(db_academic_plan)
        db.commit()

        return {"message": "Academic Plan deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete academic plan: {str(e)}")
    
def check_requirements_fulfillment(db: Session, academic_plan_id: int):
    # Fetch the academic plan
    academic_plan = db.query(AcademicPlanModel).filter(AcademicPlanModel.id == academic_plan_id).first()
    if not academic_plan:
        raise HTTPException(status_code=404, detail="Academic Plan not found")

    # Fetch requirements for the program
    requirements = db.query(Requirement).filter(Requirement.program == academic_plan.program).all()

    # Track fulfilled and unfulfilled requirements
    fulfilled = []
    unfulfilled = []

    # Get all completed courses
    completed_courses = {course.code for semester in academic_plan.semesters for course in semester.courses}

    for requirement in requirements:
        if requirement.course_code in completed_courses:
            fulfilled.append(RequirementSchema.from_orm(requirement))
        else:
            unfulfilled.append(RequirementSchema.from_orm(requirement))

    return {"fulfilled": fulfilled, "unfulfilled": unfulfilled}

def restore_academic_plan_version(db: Session, student_id: int, program: str, version: int):
    # Fetch the old version of the academic plan
    old_plan = db.query(AcademicPlanModel).filter(
        AcademicPlanModel.student_id == student_id,
        AcademicPlanModel.program == program,
        AcademicPlanModel.version == version
    ).first()

    if not old_plan:
        raise HTTPException(status_code=404, detail=f"Academic plan version {version} not found for program '{program}'.")

    # Determine the new version number
    existing_plans = db.query(AcademicPlanModel).filter(
        AcademicPlanModel.student_id == student_id,
        AcademicPlanModel.program == program
    ).all()
    new_version = max([plan.version for plan in existing_plans], default=0) + 1

    # Create a new academic plan based on the old version
    new_plan = AcademicPlanModel(
        student_id=old_plan.student_id,
        program=old_plan.program,
        version=new_version
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    # Duplicate semesters and courses from the old plan
    for old_semester in old_plan.semesters:
        new_semester = Semester(name=old_semester.name, academic_plan_id=new_plan.id)
        db.add(new_semester)
        db.commit()
        db.refresh(new_semester)

        for old_course in old_semester.courses:
            new_course = Course(
                code=old_course.code,
                title=old_course.title,
                credits=old_course.credits,
                description=old_course.description,
                prerequisites=old_course.prerequisites,
                semester_id=new_semester.id
            )
            db.add(new_course)
            db.commit()

    return new_plan

def approve_academic_plan(db: Session, academic_plan_id: int):
    db_plan =db.query(AcademicPlanModel).filter(AcademicPlanModel.id == academic_plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Academic Plan not found")
    db_plan.status = PlanStatus.APPROVED
    db.commit()
    db.refresh(db_plan)
    return db_plan

def reject_academic_plan(db: Session, academic_plan_id: int):
    db_plan = db.query(AcademicPlanModel).filter(AcademicPlanModel.id == academic_plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Academic Plan not found")
    db_plan.status = PlanStatus.REJECTED
    db.commit()
    db.refresh(db_plan)
    return db_plan

def compare_academic_plans(db: Session, plan_ids: list[int]):
    # Fetch the academic plans
    plans = db.query(AcademicPlanModel).filter(AcademicPlanModel.id.in_(plan_ids)).all()
    if len(plans) != len(plan_ids):
        raise HTTPException(status_code=404, detail="One or more academic plans not found")

    # Initialize comparison result
    comparison_result = {
        "plans": [],
        "differences": {
            "courses": [],
            "semesters": [],
            "total_credits": []
        }
    }

    # Collect data for each plan
    for plan in plans:
        total_credits = sum(course.credits for semester in plan.semesters for course in semester.courses)
        comparison_result["plans"].append({
            "id": plan.id,
            "student_id": plan.student_id,
            "program": plan.program,
            "version": plan.version,
            "status": plan.status.value,
            "total_credits": total_credits,
            "semesters": [
                {
                    "name": semester.name,
                    "courses": [{"code": course.code, "title": course.title, "credits": course.credits} for course in semester.courses]
                }
                for semester in plan.semesters
            ]
        })

    # Compare plans
    if len(plans) > 1:
        # Compare total credits
        total_credits_set = {plan["total_credits"] for plan in comparison_result["plans"]}
        if len(total_credits_set) > 1:
            comparison_result["differences"]["total_credits"] = list(total_credits_set)

        # Compare semesters
        semester_sets = [{semester["name"] for semester in plan["semesters"]} for plan in comparison_result["plans"]]
        common_semesters = set.intersection(*semester_sets)
        unique_semesters = set.union(*semester_sets) - common_semesters
        comparison_result["differences"]["semesters"] = list(unique_semesters)

        # Compare courses
        course_sets = [{course["code"] for semester in plan["semesters"] for course in semester["courses"]} for plan in comparison_result["plans"]]
        common_courses = set.intersection(*course_sets)
        unique_courses = set.union(*course_sets) - common_courses
        comparison_result["differences"]["courses"] = list(unique_courses)

    return comparison_result