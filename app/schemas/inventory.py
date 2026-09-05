"""Blood Link — Inventory Schemas."""

from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import date, datetime
from app.database.models import BloodGroup


class InventoryCreate(BaseModel):
    hospital_id: int
    blood_group: BloodGroup
    units_available: int
    expiry_date: Optional[date] = None

    @field_validator("units_available")
    @classmethod
    def non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("units_available cannot be negative")
        return v


class InventoryUpdate(BaseModel):
    units_available: Optional[int] = None
    units_reserved: Optional[int] = None
    expiry_date: Optional[date] = None

    @field_validator("units_available", "units_reserved", mode="before")
    @classmethod
    def non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Units cannot be negative")
        return v


class InventoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hospital_id: int
    blood_group: BloodGroup
    units_available: int
    units_reserved: int
    expiry_date: Optional[date] = None
    last_updated: Optional[datetime] = None


class LowStockAlert(BaseModel):
    """Alert when a blood group stock is below threshold."""
    hospital_id: int
    hospital_name: str
    blood_group: BloodGroup
    units_available: int
    units_reserved: int
    net_available: int
    is_critical: bool


class ExpiryAlert(BaseModel):
    """Alert for blood units nearing expiry."""
    inventory_id: int
    hospital_id: int
    hospital_name: str
    blood_group: BloodGroup
    units_available: int
    expiry_date: Optional[date] = None
    days_until_expiry: Optional[int] = None
    is_expired: bool


class DonationRecordCreate(BaseModel):
    """Record a completed donation — also updates inventory."""
    blood_request_id: int
    match_id: Optional[int] = None
    units_donated: int
    notes: Optional[str] = None

    @field_validator("units_donated")
    @classmethod
    def positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("units_donated must be at least 1")
        return v


class DonationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    donor_id: int
    blood_request_id: int
    match_id: Optional[int] = None
    units_donated: int
    blood_group: BloodGroup
    donated_at: datetime
    notes: Optional[str] = None
