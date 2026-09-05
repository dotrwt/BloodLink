"""Blood Link — Blood Request Schemas."""


from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from app.database.models import BloodGroup, UrgencyLevel, RequestStatus


class BloodRequestCreate(BaseModel):
    blood_group: BloodGroup
    units_required: int
    hospital_id: Optional[int] = None
    hospital_name: Optional[str] = None
    urgency: UrgencyLevel = UrgencyLevel.URGENT
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    area: Optional[str] = None
    required_by: Optional[datetime] = None
    patient_reference: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("units_required")
    @classmethod
    def units_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("units_required must be at least 1")
        return v


class BloodRequestStatusUpdate(BaseModel):
    status: RequestStatus


class BloodRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hospital_id: Optional[int] = None
    requested_by_user_id: int
    blood_group: BloodGroup
    units_required: int
    units_fulfilled: int
    urgency: UrgencyLevel
    status: RequestStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hospital_name: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    required_by: Optional[datetime] = None
    patient_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
