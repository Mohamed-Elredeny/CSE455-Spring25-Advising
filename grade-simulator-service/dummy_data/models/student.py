from sqlalchemy import Column, String, Integer
from db import Base

class Student(Base):
    __tablename__ = "Students"
    
    student_id = Column(String(10), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    program_id = Column(String(10), nullable=False)
    
    def to_dict(self):
        return {
            "student_id": self.student_id,
            "name": self.name,
            "email": self.email,
            "program_id": self.program_id
        } 