from sqlalchemy import Column, Integer, String, Date
from db import Base

class Semester(Base):
    __tablename__ = "Semesters"
    
    semester_id = Column(Integer, primary_key=True)
    semester_name = Column(String(15), nullable=False, unique=True)
    academic_year = Column(String(9), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    def to_dict(self):
        return {
            "semester_id": self.semester_id,
            "semester_name": self.semester_name,
            "academic_year": self.academic_year,
            "start_date": str(self.start_date) if self.start_date else None,
            "end_date": str(self.end_date) if self.end_date else None
        } 