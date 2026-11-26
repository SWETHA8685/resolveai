from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class IncidentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    service: str = Field(min_length=2, max_length=100)
    error_log: str = Field(min_length=5)


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    service: str
    error_log: str
    severity: Optional[str] = None
    category: Optional[str] = None
    root_cause: Optional[str] = None
    recommendations: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None


class StatusUpdate(BaseModel):
    status: str
