from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    service = Column(String(100), nullable=False)
    error_log = Column(Text, nullable=False)
    severity = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)
    root_cause = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="Open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
