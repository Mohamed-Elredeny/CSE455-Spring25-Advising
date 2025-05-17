import os
import sqlite3
from db import engine, Base

# Import all models to ensure they're registered with Base
from models.student import Student
from models.course import Course
from models.grade import Grade
from models.semester import Semester
from models.gpa_rule import GPARule
from models.program_plan import ProgramPlan
from models.prerequisite import Prerequisite
from models.graduation_requirement import GraduationRequirement

def init_db():
    """
    Initialize the SQLite database with tables and sample data
    """
    # Create all tables based on the models
    Base.metadata.create_all(bind=engine)
    
    # Path to SQLite database
    db_path = 'simulator_db.sqlite'
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Insert sample data
    
    # Insert Courses data
    courses = [
        ('CSE014', 'Structured Programming', 3, 'Core'),
        ('CSE015', 'Object Oriented Programming', 3, 'Core'),
        ('CSE111', 'Data Structures', 3, 'Core'),
        ('CSE131', 'Logic Design', 3, 'Core'),
        ('CSE132', 'Computer Architecture', 3, 'Core'),
        ('CSE211', 'Web Programming', 3, 'Core'),
        ('CSE221', 'Database Systems', 3, 'Core'),
        ('CSE233', 'Operating Systems', 3, 'Core'),
        ('CSE251', 'Software Engineering', 3, 'Core'),
        ('CSE261', 'Computer Networks', 3, 'Core'),
        ('CSE315', 'Discrete Mathematics', 3, 'Core'),
        ('CSE323', 'Advanced Databases', 3, 'Core'),
        ('CSE352', 'Systems Analysis & Design', 3, 'Core'),
        ('CSE454', 'Advanced Software Engineering', 3, 'Core'),
        ('CSE494', 'Graduation Project 2', 3, 'Core'),
        ('MAT111', 'Mathematics I', 3, 'Core'),
        ('MAT112', 'Mathematics II', 3, 'Core'),
        ('MAT131', 'Probability & Statistics I', 3, 'Core'),
        ('PHY211', 'Physics II', 3, 'Core')
    ]
    
    cursor.executemany(
        "INSERT INTO Courses (course_id, name, credits, category) VALUES (?, ?, ?, ?)",
        courses
    )
    
    # Insert CoursePrerequisites data
    prerequisites = [
        ('CSE015', 'CSE014'),
        ('CSE111', 'CSE015'),
        ('CSE132', 'CSE131'),
        ('CSE211', 'CSE015'),
        ('CSE221', 'CSE111'),
        ('CSE233', 'CSE132'),
        ('CSE261', 'CSE132'),
        ('CSE323', 'CSE221'),
        ('CSE454', 'CSE251'),
        ('CSE494', 'CSE323'),
        ('CSE494', 'CSE454'),
        ('MAT112', 'MAT111')
    ]
    
    cursor.executemany(
        "INSERT INTO CoursePrerequisites (course_id, prerequisite_course_id) VALUES (?, ?)",
        prerequisites
    )
    
    # Insert GPA_Rules data
    gpa_rules = [
        (1, 'A+', 4.0, 97, 100),
        (2, 'A', 4.0, 93, 96),
        (3, 'A-', 3.7, 89, 92),
        (4, 'B+', 3.3, 84, 88),
        (5, 'B', 3.0, 80, 83),
        (6, 'B-', 2.7, 76, 79),
        (7, 'C+', 2.3, 73, 75),
        (8, 'C', 2.0, 70, 72),
        (9, 'C-', 1.7, 67, 69),
        (10, 'D+', 1.3, 64, 66),
        (11, 'D', 1.0, 60, 63),
        (12, 'F', 0.0, 0, 59)
    ]
    
    cursor.executemany(
        "INSERT INTO GPA_Rules (rule_id, letter_grade, gpa_points, min_percentage, max_percentage) VALUES (?, ?, ?, ?, ?)",
        gpa_rules
    )
    
    # Insert Semesters data
    semesters = [
        (211, 'Fall 2021', '2021-2022', '2021-09-01', '2021-12-31'),
        (222, 'Spring 2022', '2021-2022', '2022-01-15', '2022-05-15')
    ]
    
    cursor.executemany(
        "INSERT INTO Semesters (semester_id, semester_name, academic_year, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
        semesters
    )
    
    # Insert Students data
    students = [
        ('21100001', 'Ali', 'Ali@example.com', 'SWE'),
        ('21100002', 'Ahmed', 'Ahmed@example.com', 'SWE'),
        ('21200001', 'Mohamed', 'Mohamed@example.com', 'SWE')
    ]
    
    cursor.executemany(
        "INSERT INTO Students (student_id, name, email, program_id) VALUES (?, ?, ?, ?)",
        students
    )
    
    # Insert Graduation_Requirements data
    graduation_requirements = [
        ('SWE', 2.0, 133, None)
    ]
    
    cursor.executemany(
        "INSERT INTO Graduation_Requirements (program_id, min_gpa, min_credits, course_id) VALUES (?, ?, ?, ?)",
        graduation_requirements
    )
    
    # Insert Program_Plans data
    program_plans = [
        (1, 'SWE', 'MAT111', 'Core'),
        (2, 'SWE', 'PHY211', 'Core'),
        (3, 'SWE', 'CSE014', 'Core'),
        (4, 'SWE', 'MAT112', 'Core'),
        (5, 'SWE', 'MAT131', 'Core'),
        (6, 'SWE', 'CSE015', 'Core'),
        (7, 'SWE', 'CSE315', 'Core'),
        (8, 'SWE', 'CSE111', 'Core'),
        (9, 'SWE', 'CSE131', 'Core'),
        (10, 'SWE', 'CSE132', 'Core'),
        (11, 'SWE', 'CSE211', 'Core'),
        (12, 'SWE', 'CSE221', 'Core'),
        (13, 'SWE', 'CSE251', 'Core'),
        (14, 'SWE', 'CSE233', 'Core'),
        (15, 'SWE', 'CSE261', 'Core'),
        (16, 'SWE', 'CSE352', 'Core'),
        (17, 'SWE', 'CSE323', 'Core'),
        (18, 'SWE', 'CSE454', 'Core'),
        (19, 'SWE', 'CSE494', 'Core')
    ]
    
    cursor.executemany(
        "INSERT INTO Program_Plans (plan_id, program_id, course_id, category) VALUES (?, ?, ?, ?)",
        program_plans
    )
    
    # Insert Grades data
    grades = [
        (1, '21100001', 'MAT111', 211, 'A', 95, 12.0),
        (2, '21100001', 'CSE014', 211, 'B+', 87, 9.9),
        (3, '21100002', 'PHY211', 211, 'A-', 90, 11.1),
        (4, '21200001', 'CSE015', 222, 'B', 82, 9.0),
        (5, '21200001', 'CSE111', 222, 'C+', 74, 6.9),
        (6, '21100002', 'MAT131', 211, 'B-', 78, 8.1)
    ]
    
    cursor.executemany(
        "INSERT INTO Grades (grade_id, student_id, course_id, semester_id, grade, percentage, course_grade_points) VALUES (?, ?, ?, ?, ?, ?, ?)",
        grades
    )
    
    # Commit the transaction
    conn.commit()
    conn.close()
    
    print("SQLite database initialized with schema and sample data")

if __name__ == "__main__":
    # Check if database file already exists
    db_path = 'simulator_db.sqlite'
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database file: {db_path}")
    
    # Initialize database
    init_db() 