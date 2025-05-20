from sqlalchemy import Column, String, Integer
from db import Base

class Course(Base):
    __tablename__ = "Courses"
    
    course_id = Column(String(10), primary_key=True)
    name = Column(String(100), nullable=False)
    credits = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    
    def to_dict(self):
        return {
            "course_id": self.course_id,
            "name": self.name,
            "credits": self.credits,
            "category": self.category
        } 