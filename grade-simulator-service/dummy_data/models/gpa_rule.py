from sqlalchemy import Column, Integer, String, Numeric
from db import Base
from decimal import Decimal

class GPARule(Base):
    __tablename__ = "GPA_Rules"
    
    rule_id = Column(Integer, primary_key=True, autoincrement=True)
    letter_grade = Column(String(2), nullable=False, unique=True)
    gpa_points = Column(Numeric(3, 1), nullable=False)
    min_percentage = Column(Integer, nullable=False)
    max_percentage = Column(Integer, nullable=False)
    
    def to_dict(self):
        return {
            "rule_id": self.rule_id,
            "letter_grade": self.letter_grade,
            "gpa_points": float(self.gpa_points) if isinstance(self.gpa_points, Decimal) else self.gpa_points,
            "min_percentage": self.min_percentage,
            "max_percentage": self.max_percentage
        } 