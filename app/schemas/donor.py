"""Blood Link — Donor Schemas."""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from app.database.models import BloodGroup, Gender


class DonorCreate(BaseModel):
    name: str
    blood_group: BloodGroup
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    weight_kg: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    previous_donation: bool = False
    last_donation_date: Optional[datetime] = None
    consent_share_availability: bool = True


class DonorUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    weight_kg: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None


class DonorAvailabilityUpdate(BaseModel):
    is_available: bool


class DonorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    blood_group: BloodGroup
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    weight_kg: Optional[float] = None
    is_available: bool
    is_verified: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area: Optional[str] = None
    city: Optional[str] = None
    last_donation_date: Optional[datetime] = None
    previous_donation: bool = False
    total_donations: int = 0
    consent_share_availability: bool = True
    created_at: datetime


class DonorPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    """Public view — excludes contact details and location coords."""
    id: int
    name: str
    blood_group: BloodGroup
    is_available: bool
    is_verified: bool
    city: Optional[str] = None
    total_donations: int = 0


class DonorEligibility(BaseModel):
    """Eligibility status and next eligible date."""
    is_eligible: bool
    last_donation_date: Optional[datetime] = None
    next_eligible_date: Optional[datetime] = None
    days_until_eligible: Optional[int] = None
    message: str
