"""Blood Link — Auth Schemas."""

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from typing import Optional
from datetime import date, datetime
from app.database.models import (
    UserRole, BloodGroup, Gender, RelationshipToPatient, BloodBankType,
)


# ── Generic Register (lightweight — just creates the user) ──────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.DONOR

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


# ── Combined Signup: Donor ──────────────────────────────────────────────────
class DonorSignupRequest(BaseModel):
    """Combined user + donor profile creation in one request."""
    # Account info
    full_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str

    # Donor info
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    blood_group: BloodGroup
    city: Optional[str] = None
    area: Optional[str] = None
    is_available: bool = True

    # Donation info
    last_donation_date: Optional[datetime] = None
    previous_donation: bool = False
    consent_share_availability: bool = True

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        password = info.data.get("password")
        if password and v != password:
            raise ValueError("Passwords do not match")
        return v


# ── Combined Signup: Requester ──────────────────────────────────────────────
class RequesterSignupRequest(BaseModel):
    """Combined user + requester profile creation in one request."""
    # Account info
    full_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str

    # Requester info
    city: Optional[str] = None
    area: Optional[str] = None
    relationship_to_patient: RelationshipToPatient = RelationshipToPatient.SELF

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        password = info.data.get("password")
        if password and v != password:
            raise ValueError("Passwords do not match")
        return v


# ── Combined Signup: Blood Bank ─────────────────────────────────────────────
class BloodBankSignupRequest(BaseModel):
    """Combined user + blood bank profile creation in one request."""
    # Organization info
    blood_bank_name: str
    official_email: EmailStr
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    license_number: Optional[str] = None
    blood_bank_type: BloodBankType = BloodBankType.PRIVATE

    # Authorized person
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[EmailStr] = None

    # Account
    password: str
    confirm_password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        password = info.data.get("password")
        if password and v != password:
            raise ValueError("Passwords do not match")
        return v


# ── Login ────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: Optional[str] = None


# ── Password Change ─────────────────────────────────────────────────────────
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("confirm_new_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        new_password = info.data.get("new_password")
        if new_password and v != new_password:
            raise ValueError("Passwords do not match")
        return v


# ── User Profile Outputs ───────────────────────────────────────────────────
class DonorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    blood_group: BloodGroup
    age: Optional[int] = None
    gender: Optional[Gender] = None
    weight_kg: Optional[float] = None
    is_available: bool = True
    is_verified: bool = False
    city: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_donations: int = 0
    last_donation_date: Optional[datetime] = None


class RequesterProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    city: Optional[str] = None
    area: Optional[str] = None
    relationship_to_patient: Optional[RelationshipToPatient] = None


class HospitalProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    license_number: Optional[str] = None
    blood_bank_type: Optional[BloodBankType] = None
    is_verified: bool = False
    city: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None


# ── User Output ──────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    donor_profile: Optional[DonorProfileOut] = None
    requester_profile: Optional[RequesterProfileOut] = None
    hospital_profile: Optional[HospitalProfileOut] = None
