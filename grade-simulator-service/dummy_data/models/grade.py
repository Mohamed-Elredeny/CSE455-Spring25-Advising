from sqlalchemy import Column, String, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from db import Base
from decimal import Decimal

class Grade(Base):
    __tablename__ = "Grades"
    
    grade_id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(10), ForeignKey("Students.student_id"), nullable=False)
    course_id = Column(String(10), ForeignKey("Courses.course_id"), nullable=False)
    semester_id = Column(Integer, ForeignKey("Semesters.semester_id"), nullable=False)
    grade = Column(String(2), nullable=True)
    percentage = Column(Integer, nullable=True)
    course_grade_points = Column(Numeric(4, 1), nullable=True)
    
    def to_dict(self):
        return {
            "grade_id": self.grade_id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "semester_id": self.semester_id,
            "grade": self.grade,
            "percentage": self.percentage,
            "course_grade_points": float(self.course_grade_points) if isinstance(self.course_grade_points, Decimal) else self.course_grade_points
        } 