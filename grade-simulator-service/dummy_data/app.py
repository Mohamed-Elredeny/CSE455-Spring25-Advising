from flask import Flask, jsonify, request
from flask_restful import Api, Resource
from sqlalchemy.orm import joinedload
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from db import get_db, engine, Base, SessionLocal
from models.student import Student
from models.course import Course
from models.grade import Grade
from models.semester import Semester
from models.program_plan import ProgramPlan
from models.gpa_rule import GPARule
from models.graduation_requirement import GraduationRequirement
from models.prerequisite import Prerequisite
from decimal import Decimal
import json
import flask.json
import os
import sys
import importlib.util

# Custom JSON encoder to handle Decimal objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(CustomJSONEncoder, self).default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
api = Api(app)

# Configure Flask-RESTful to use custom JSON encoder for Decimal serialization
@api.representation('application/json')
def output_json(data, code, headers=None):
    resp = app.make_response(json.dumps(data, cls=CustomJSONEncoder))
    resp.headers.extend(headers or {})
    return resp

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

# Helper function to convert SQLAlchemy objects to dictionaries
def row_to_dict(row):
    return {column.name: getattr(row, column.name) for column in row.__table__.columns}

# API endpoints for Student data
class StudentResource(Resource):
    def get(self, student_id=None):
        db = get_db()
        
        if student_id:
            student = db.query(Student).filter(Student.student_id == student_id).first()
            if not student:
                return {"error": "Student not found"}, 404
            return student.to_dict()
        else:
            students = db.query(Student).all()
            return [student.to_dict() for student in students]

api.add_resource(StudentResource, '/api/students', '/api/students/<string:student_id>')

# API endpoints for student grade data with course information
class StudentGradeResource(Resource):
    def get(self, student_id):
        db = get_db()
        
        # Check if student exists
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return {"error": "Student not found"}, 404
            
        # Count student grades
        grade_count = db.query(func.count(Grade.grade_id)).filter(
            Grade.student_id == student_id
        ).scalar()
        
        # Use SQLite compatible query
        stmt = text("""
            SELECT g.*, c.* 
            FROM Grades g
            JOIN Courses c ON g.course_id = c.course_id
            WHERE g.student_id = :student_id
        """)
        
        result = db.execute(stmt, {"student_id": student_id})
        
        grades = []
        for row in result:
            # Create a grade dictionary
            grade_dict = {}
            for column in Grade.__table__.columns:
                value = getattr(row, column.name)
                # Convert Decimal to float
                if isinstance(value, Decimal):
                    value = float(value)
                grade_dict[column.name] = value
                
            # Add course information
            grade_dict["course"] = {}
            for column in Course.__table__.columns:
                value = getattr(row, column.name)
                # Convert Decimal to float
                if isinstance(value, Decimal):
                    value = float(value)
                grade_dict["course"][column.name] = value
                
            grades.append(grade_dict)
            
        return grades

api.add_resource(StudentGradeResource, '/api/students/<string:student_id>/grades')

# API endpoints for Course data
class CourseResource(Resource):
    def get(self, course_id=None):
        db = get_db()
        
        if course_id:
            course = db.query(Course).filter(Course.course_id == course_id).first()
            if not course:
                return {"error": "Course not found"}, 404
            return course.to_dict()
        else:
            courses = db.query(Course).all()
            return [course.to_dict() for course in courses]

api.add_resource(CourseResource, '/api/courses', '/api/courses/<string:course_id>')

# API endpoints for GPA Rules
class GPARuleResource(Resource):
    def get(self, letter_grade=None):
        db = get_db()
        
        if letter_grade:
            rule = db.query(GPARule).filter(GPARule.letter_grade == letter_grade).first()
            if not rule:
                return {"error": "GPA rule not found"}, 404
            return rule.to_dict()
        else:
            rules = db.query(GPARule).all()
            return [rule.to_dict() for rule in rules]

api.add_resource(GPARuleResource, '/api/gpa-rules', '/api/gpa-rules/<string:letter_grade>')

# API endpoints for Program Plan data
class ProgramPlanResource(Resource):
    def get(self, program_id=None, course_id=None):
        db = get_db()
        
        if program_id and course_id:
            plan = db.query(ProgramPlan).filter(
                ProgramPlan.program_id == program_id,
                ProgramPlan.course_id == course_id
            ).first()
            
            if not plan:
                return {"error": "Program plan entry not found"}, 404
                
            return plan.to_dict()
        elif program_id:
            # Fetch course details for program plan - using SQLite compatible names
            stmt = text("""
                SELECT pp.*, c.* 
                FROM Program_Plans pp
                JOIN Courses c ON pp.course_id = c.course_id
                WHERE pp.program_id = :program_id
            """)
            
            result = db.execute(stmt, {"program_id": program_id})
            
            plans = []
            for row in result:
                plan_dict = {}
                for column in ProgramPlan.__table__.columns:
                    value = getattr(row, column.name)
                    # Convert Decimal to float
                    if isinstance(value, Decimal):
                        value = float(value)
                    plan_dict[column.name] = value
                    
                # Add course info
                plan_dict["Course"] = {}
                for column in Course.__table__.columns:
                    value = getattr(row, column.name)
                    # Convert Decimal to float
                    if isinstance(value, Decimal):
                        value = float(value)
                    plan_dict["Course"][column.name] = value
                    
                plans.append(plan_dict)
                
            return plans
        else:
            plans = db.query(ProgramPlan).all()
            return [plan.to_dict() for plan in plans]

api.add_resource(ProgramPlanResource, 
                 '/api/program-plans', 
                 '/api/program-plans/<string:program_id>',
                 '/api/program-plans/<string:program_id>/<string:course_id>')

# API endpoints for Program Plan data with detailed course and prerequisite info
class ProgramPlanDetailResource(Resource):
    def get(self, program_id):
        db = get_db()
        
        # This is a more complex query to fetch program plans with course and prerequisite information
        # First, get the program plans with course info
        program_plans_query = text("""
            SELECT pp.*, c.*
            FROM Program_Plans pp
            JOIN Courses c ON pp.course_id = c.course_id
            WHERE pp.program_id = :program_id
        """)
        
        program_plans_result = db.execute(program_plans_query, {"program_id": program_id})
        
        program_plans = []
        for row in program_plans_result:
            plan_dict = {}
            for column in ProgramPlan.__table__.columns:
                value = getattr(row, column.name)
                if isinstance(value, Decimal):
                    value = float(value)
                plan_dict[column.name] = value
                
            # Add course info
            plan_dict["Course"] = {}
            for column in Course.__table__.columns:
                value = getattr(row, column.name)
                if isinstance(value, Decimal):
                    value = float(value)
                plan_dict["Course"][column.name] = value
            
            # Now get prerequisites for this course
            prereq_query = text("""
                SELECT c.*
                FROM CoursePrerequisites p
                JOIN Courses c ON p.prerequisite_course_id = c.course_id
                WHERE p.course_id = :course_id
            """)
            
            prereq_result = db.execute(prereq_query, {"course_id": plan_dict["course_id"]})
            
            # Add prerequisites array
            plan_dict["prerequisites"] = []
            for prereq_row in prereq_result:
                prereq_dict = {}
                for column in Course.__table__.columns:
                    value = getattr(prereq_row, column.name)
                    if isinstance(value, Decimal):
                        value = float(value)
                    prereq_dict[column.name] = value
                plan_dict["prerequisites"].append(prereq_dict)
                
            program_plans.append(plan_dict)
            
        return program_plans

api.add_resource(ProgramPlanDetailResource, '/api/program-plans/<string:program_id>/detailed')

# API endpoints for Semester data
class SemesterResource(Resource):
    def get(self, semester_id=None):
        db = get_db()
        
        if semester_id:
            semester = db.query(Semester).filter(Semester.semester_id == semester_id).first()
            if not semester:
                return {"error": "Semester not found"}, 404
            return semester.to_dict()
        else:
            semesters = db.query(Semester).all()
            return [semester.to_dict() for semester in semesters]

api.add_resource(SemesterResource, '/api/semesters', '/api/semesters/<int:semester_id>')

# API endpoints for Graduation Requirements
class GraduationRequirementResource(Resource):
    def get(self, program_id=None):
        db = get_db()
        
        if program_id:
            requirement = db.query(GraduationRequirement).filter(GraduationRequirement.program_id == program_id).first()
            if not requirement:
                return {"error": f"Graduation requirement not found for program: {program_id}"}, 404
            return requirement.to_dict()
        else:
            requirements = db.query(GraduationRequirement).all()
            return [requirement.to_dict() for requirement in requirements]

api.add_resource(GraduationRequirementResource, 
                 '/api/graduation-requirements', 
                 '/api/graduation-requirements/<string:program_id>')

# Health check endpoint
@app.route('/health')
def health_check():
    # Check database connection
    try:
        # Get a connection from the pool and immediately release it
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "unhealthy", "database": str(e)}), 500

# Database cleanup on application exit
@app.teardown_appcontext
def shutdown_session(exception=None):
    # This helps ensure sessions are closed properly
    SessionLocal.remove() if hasattr(SessionLocal, 'remove') else None

if __name__ == '__main__':
    # Check if SQLite database exists, if not initialize it
    db_path = 'simulator_db.sqlite'
    if not os.path.exists(db_path):
        print("SQLite database not found. Initializing...")
        try:
            # Import the init_sqlite module and run initialization
            spec = importlib.util.spec_from_file_location("init_sqlite", "init_sqlite.py")
            init_sqlite = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(init_sqlite)
            init_sqlite.init_db()
        except Exception as e:
            print(f"Error initializing database: {e}")
            sys.exit(1)
    
    app.run(debug=True, host='0.0.0.0', port=5002)
