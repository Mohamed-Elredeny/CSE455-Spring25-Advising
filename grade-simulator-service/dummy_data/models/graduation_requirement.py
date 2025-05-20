from sqlalchemy import Column, Integer, String, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from db import Base
from decimal import Decimal

class GraduationRequirement(Base):
    __tablename__ = "Graduation_Requirements"
    
    program_id = Column(String(10), primary_key=True)
    min_gpa = Column(Numeric(3, 1), nullable=False)
    min_credits = Column(Integer, nullable=False)
    course_id = Column(String(10), ForeignKey("Courses.course_id"), nullable=True)
    
    def to_dict(self):
        return {
            "program_id": self.program_id,
            "min_gpa": float(self.min_gpa) if isinstance(self.min_gpa, Decimal) else self.min_gpa,
            "min_credits": self.min_credits,
            "course_id": self.course_id
        } 