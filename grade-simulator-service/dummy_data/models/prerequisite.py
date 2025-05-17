from sqlalchemy import Column, String, Integer, ForeignKey, Table
from db import Base

class Prerequisite(Base):
    __tablename__ = "CoursePrerequisites"
    
    course_id = Column(String(10), ForeignKey("Courses.course_id"), primary_key=True, nullable=False)
    prerequisite_course_id = Column(String(10), ForeignKey("Courses.course_id"), primary_key=True, nullable=False)
    
    def to_dict(self):
        return {
            "course_id": self.course_id,
            "prerequisite_course_id": self.prerequisite_course_id
        } 