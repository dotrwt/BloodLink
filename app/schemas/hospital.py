"""Blood Link — Hospital / Blood Bank Schemas."""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.database.models import BloodBankType


class HospitalCreate(BaseModel):
    name: str
    license_number: Optional[str] = None
    blood_bank_type: BloodBankType = BloodBankType.PRIVATE
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None


class HospitalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    license_number: Optional[str] = None
    blood_bank_type: Optional[BloodBankType] = None
    is_verified: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None
    created_at: datetime
