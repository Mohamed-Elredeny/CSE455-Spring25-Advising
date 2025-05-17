from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class ProgramPlan(Base):
    __tablename__ = "Program_Plans"
    
    plan_id = Column(Integer, primary_key=True, autoincrement=True)
    program_id = Column(String(10), nullable=False)
    course_id = Column(String(10), ForeignKey("Courses.course_id"), nullable=True)
    category = Column(String(50), nullable=True)
    
    def to_dict(self):
        return {
            "plan_id": self.plan_id,
            "program_id": self.program_id,
            "course_id": self.course_id,
            "category": self.category
        } 