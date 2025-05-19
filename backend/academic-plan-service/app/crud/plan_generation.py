from sqlalchemy.orm import Session
from app.models.Requirement import Requirement
from app.models.course import Course
from app.models.academic_plan import AcademicPlan as AcademicPlanModel
from app.models.semester import Semester
from fastapi import HTTPException

def generate_plan(db: Session, student_id: int, program: str, preferences: dict = None):
    # Step 1: Get remaining requirements
    requirements = db.query(Requirement).filter(Requirement.program == program).all()
    # Default preferences if not provided
    if preferences is None:
        preferences = {"max_credits_per_semester": 18, "total_credits": 120}

    if not requirements:
        raise HTTPException(status_code=404, detail=f"No requirements found for program: {program}")

    # Fetch completed courses for the student (if tracked in the database)
    completed_courses = set()  # Replace with actual query if completed courses are stored

    # Determine remaining requirements
    remaining_requirements = [
        req for req in requirements if req.course_code not in completed_courses
    ]

    # Step 2: Choose appropriate courses from the catalog
    remaining_courses = db.query(Course).filter(Course.code.in_([req.course_code for req in remaining_requirements])).all()

    # Step 3: Distribute courses across semesters
    semesters = []
    semester_credits = 0
    semester_courses = []
    total_credits = 0

    for course in remaining_courses:
        # Check prerequisites
        if not all(prerequisite in completed_courses for prerequisite in course.prerequisites):
            continue

        # Add course to the current semester
        semester_courses.append(course)
        semester_credits += course.credits
        total_credits += course.credits
        completed_courses.add(course.code)

        # Finalize semester if credit limit is reached
        if semester_credits >= preferences.get("max_credits_per_semester", 18):
            semesters.append({"name": f"Semester {len(semesters) + 1}", "courses": semester_courses})
            semester_credits = 0
            semester_courses = []

        # Stop if total credits are satisfied
        if total_credits >= preferences.get("total_credits", 120):
            break

    # Add the last semester if it has any courses
    if semester_courses:
        semesters.append({"name": f"Semester {len(semesters) + 1}", "courses": semester_courses})

    # Step 4: Create the academic plan in the database
    db_academic_plan = AcademicPlanModel(student_id=student_id, program=program)
    db.add(db_academic_plan)
    db.commit()
    db.refresh(db_academic_plan)

    # Add semesters and courses to the database
    for semester in semesters:
        db_semester = Semester(name=semester["name"], academic_plan_id=db_academic_plan.id)
        db.add(db_semester)
        db.commit()
        db.refresh(db_semester)

        for course in semester["courses"]:
            course.semester_id = db_semester.id
            db.commit()

    return db_academic_plan