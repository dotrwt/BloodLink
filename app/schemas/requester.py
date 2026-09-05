"""Blood Link — Requester Schemas."""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.database.models import RelationshipToPatient


class RequesterCreate(BaseModel):
    name: str
    city: Optional[str] = None
    area: Optional[str] = None
    relationship_to_patient: RelationshipToPatient = RelationshipToPatient.SELF


class RequesterUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    relationship_to_patient: Optional[RelationshipToPatient] = None


class RequesterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    city: Optional[str] = None
    area: Optional[str] = None
    relationship_to_patient: Optional[RelationshipToPatient] = None
    created_at: datetime
