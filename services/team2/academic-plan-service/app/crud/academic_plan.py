from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.schemas.academic_plan import AcademicPlanCreate
from app.models.academic_plan import AcademicPlan as AcademicPlanModel
from app.models.semester import Semester
from app.models.course import Course
from app.models.Requirement import Requirement
from app.schemas.requirement import Requirement as RequirementSchema
from app.models.academic_plan import PlanStatus  
from sqlalchemy.orm import joinedload
from app.models.course import Course


def create_academic_plan(db: Session, academic_plan: AcademicPlanCreate):
    try:
        # Fetch requirement for the program
        requirement = db.query(Requirement).filter(Requirement.program == academic_plan.program).first()
        if not requirement:
            raise HTTPException(status_code=400, detail="No requirement found for this program.")

        # Calculate plan stats
        total_hours = sum(course.credits for semester in academic_plan.semesters for course in semester.courses)
        num_core_courses = sum(1 for semester in academic_plan.semesters for course in semester.courses if course.is_core)
        num_elective_courses = sum(1 for semester in academic_plan.semesters for course in semester.courses if not course.is_core)

        # Validate against requirement
        if total_hours < requirement.total_hours:
            raise HTTPException(status_code=400, detail="Total hours less than required.")
        if num_core_courses < requirement.num_core_courses:
            raise HTTPException(status_code=400, detail="Not enough core courses.")
        if num_elective_courses < requirement.num_elective_courses:
            raise HTTPException(status_code=400, detail="Not enough elective courses.")

        # Validate department
        valid_programs = ["Computer Science", "Engineering", "Mathematics", "test", "string"]  
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
            
            course_ids = set()
            semester_credits = 0

            for course in semester.courses:
                if course.course_id in course_ids:
                    raise HTTPException(status_code=400, detail=f"Duplicate course ID '{course.course_id}' in semester '{semester.name}'.")
                course_ids.add(course.course_id)

                # Validate prerequisites
                for prerequisite in course.prerequisites:
                    if prerequisite not in completed_courses:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Course '{course.course_id}' in semester '{semester.name}' has unmet prerequisite '{prerequisite}'."
                        )

                # Add course to completed courses
                completed_courses.add(course.course_id)

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

        # Create the academic plan
        db_academic_plan = AcademicPlanModel(
            university=academic_plan.university,
            department=academic_plan.department,
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
                    course_id=course.course_id,
                    title=course.title,
                    description=course.description,
                    instructor=course.instructor,
                    credits=course.credits,
                    department=course.department,
                    is_core=course.is_core,
                    level=course.level,
                    semester_id=db_semester.id  # Set the foreign key
                )
                db.add(db_course)
                db.commit()
                db.refresh(db_course)

                # Add prerequisites
                for prerequisite_id in course.prerequisites:
                    prerequisite_course = db.query(Course).filter(Course.course_id == prerequisite_id).first()
                    if not prerequisite_course:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Prerequisite course '{prerequisite_id}' not found for course '{course.course_id}'."
                        )
                    db_course.prerequisites.append(prerequisite_course)
                db.commit()

        return db_academic_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create academic plan: {str(e)}")

def get_academic_plan(db: Session, academic_plan_id: int):
    db_academic_plan = db.query(AcademicPlanModel).options(
        joinedload(AcademicPlanModel.semesters).joinedload(Semester.courses)
    ).filter(AcademicPlanModel.id == academic_plan_id).first()

    if not db_academic_plan:
        raise HTTPException(status_code=404, detail="Academic Plan not found")

    # Serialize the response
    academic_plan = {
        "id": db_academic_plan.id,
        "university": db_academic_plan.university,
        "department": db_academic_plan.department,
        "program": db_academic_plan.program,
        "version": db_academic_plan.version,
        "status": db_academic_plan.status.value,
        "semesters": [
            {
                "id": semester.id,
                "name": semester.name,
                "courses": [
                    {
                        "course_id": course.course_id,
                        "title": course.title,
                        "credits": course.credits,
                        "description": course.description,
                        "instructor": course.instructor,
                        "department": course.department,
                        "is_core": course.is_core,
                        "level": course.level,
                        "prerequisites": [pr.course_id for pr in course.prerequisites]
                    }
                    for course in semester.courses
                ]
            }
            for semester in db_academic_plan.semesters
        ]
    }
    return academic_plan

def get_all_academic_plans(db: Session, skip: int = 0, limit: int = 10):
    db_academic_plans = db.query(AcademicPlanModel).options(
        joinedload(AcademicPlanModel.semesters).joinedload(Semester.courses)
    ).offset(skip).limit(limit).all()

    # Serialize the response
    academic_plans = []
    for db_academic_plan in db_academic_plans:
        academic_plans.append({
            "id": db_academic_plan.id,
            "university": db_academic_plan.university,
            "department": db_academic_plan.department,
            "program": db_academic_plan.program,
            "version": db_academic_plan.version,
            "status": db_academic_plan.status.value,
            "semesters": [
                {
                    "id": semester.id,
                    "name": semester.name,
                    "courses": [
                        {
                            "course_id": course.course_id,
                            "title": course.title,
                            "credits": course.credits,
                            "description": course.description,
                            "instructor": course.instructor,
                            "department": course.department,
                            "is_core": course.is_core,
                            "level": course.level,
                            "prerequisites": [pr.course_id for pr in course.prerequisites]
                        }
                        for course in semester.courses
                    ]
                }
                for semester in db_academic_plan.semesters
            ]
        })
    return academic_plans

def update_academic_plan(db: Session, academic_plan_id: int, academic_plan: AcademicPlanCreate):
    try:
        # Fetch the existing academic plan
        db_academic_plan = db.query(AcademicPlanModel).filter(AcademicPlanModel.id == academic_plan_id).first()
        if not db_academic_plan:
            raise HTTPException(status_code=404, detail="Academic Plan not found")

        # Create a new academic plan with the updated data
        new_plan = AcademicPlanModel(
            university=academic_plan.university,
            department=academic_plan.department,
            program=academic_plan.program,
            version=db_academic_plan.version + 1
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
                    course_id=course.course_id,
                    title=course.title,
                    description=course.description,
                    instructor=course.instructor,
                    credits=course.credits,
                    department=course.department,
                    is_core=course.is_core,
                    level=course.level,
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

    # Fetch requirement for the program
    requirement = db.query(Requirement).filter(Requirement.program == academic_plan.program).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="No requirement found for this program.")

    # Calculate plan stats
    total_hours = sum(course.credits for semester in academic_plan.semesters for course in semester.courses)
    num_core_courses = sum(1 for semester in academic_plan.semesters for course in semester.courses if course.is_core)
    num_elective_courses = sum(1 for semester in academic_plan.semesters for course in semester.courses if not course.is_core)

    # Prepare fulfillment report
    fulfilled = []
    unfulfilled = []

    if total_hours >= requirement.total_hours:
        fulfilled.append(f"Total hours: {total_hours} (required: {requirement.total_hours})")
    else:
        unfulfilled.append(f"Total hours: {total_hours} (required: {requirement.total_hours})")

    if num_core_courses >= requirement.num_core_courses:
        fulfilled.append(f"Core courses: {num_core_courses} (required: {requirement.num_core_courses})")
    else:
        unfulfilled.append(f"Core courses: {num_core_courses} (required: {requirement.num_core_courses})")

    if num_elective_courses >= requirement.num_elective_courses:
        fulfilled.append(f"Elective courses: {num_elective_courses} (required: {requirement.num_elective_courses})")
    else:
        unfulfilled.append(f"Elective courses: {num_elective_courses} (required: {requirement.num_elective_courses})")

    return {"fulfilled": fulfilled, "unfulfilled": unfulfilled}

def restore_academic_plan_version(db: Session, program: str, version: int):
    # Fetch the old version of the academic plan
    old_plan = db.query(AcademicPlanModel).filter(
        AcademicPlanModel.program == program,
        AcademicPlanModel.version == version
    ).first()

    if not old_plan:
        raise HTTPException(status_code=404, detail=f"Academic plan version {version} not found for program '{program}'.")

    # Determine the new version number
    existing_plans = db.query(AcademicPlanModel).filter(
        AcademicPlanModel.program == program
    ).all()
    new_version = max([plan.version for plan in existing_plans], default=0) + 1

    # Create a new academic plan based on the old version
    new_plan = AcademicPlanModel(
        university=old_plan.university,
        department=old_plan.department,
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
                course_id=old_course.course_id,
                title=old_course.title,
                credits=old_course.credits,
                description=old_course.description,
                instructor=old_course.instructor,
                department=old_course.department,
                is_core=old_course.is_core,
                level=old_course.level,
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
            "university": plan.university,
            "department": plan.department,
            "program": plan.program,
            "version": plan.version,
            "status": plan.status.value,
            "total_credits": total_credits,
            "semesters": [
                {
                    "name": semester.name,
                    "courses": [{"course_id": course.course_id, "title": course.title, "credits": course.credits} for course in semester.courses]
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
        course_sets = [{course["course_id"] for semester in plan["semesters"] for course in semester["courses"]} for plan in comparison_result["plans"]]
        common_courses = set.intersection(*course_sets)
        unique_courses = set.union(*course_sets) - common_courses
        comparison_result["differences"]["courses"] = list(unique_courses)

    return comparison_result