from sqlalchemy import Column, Integer, String, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base

class Course(Base):
    __tablename__ = "course"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String, nullable=False)
    title = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    prerequisites = Column(ARRAY(String), nullable=False)
    semester_id = Column(Integer, ForeignKey("semester.id", ondelete="CASCADE"), nullable=False)
    semester = relationship("Semester", back_populates="courses")