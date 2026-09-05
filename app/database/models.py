"""
Blood Link — SQLAlchemy ORM Models

Tables:
    users           — authentication & role management
    donors          — donor profile & availability
    requesters      — requester profile (person raising blood requirement)
    hospitals       — blood bank / hospital details
    blood_inventory — per-hospital blood stock (with expiry tracking)
    blood_requests  — emergency blood requests
    matches         — AI-generated donor-request matches
    notifications   — notification records
    donations       — completed donation history
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, UniqueConstraint,
)
from sqlalchemy.orm import relationship
import enum

from app.database.database import Base


# ── Enums ─────────────────────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    DONOR = "DONOR"
    HOSPITAL = "HOSPITAL"
    REQUESTER = "REQUESTER"
    ADMIN = "ADMIN"


class BloodGroup(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class RelationshipToPatient(str, enum.Enum):
    SELF = "SELF"
    PARENT = "PARENT"
    SIBLING = "SIBLING"
    RELATIVE = "RELATIVE"
    FRIEND = "FRIEND"
    OTHER = "OTHER"


class BloodBankType(str, enum.Enum):
    GOVERNMENT = "GOVERNMENT"
    PRIVATE = "PRIVATE"
    HOSPITAL_BASED = "HOSPITAL_BASED"
    NGO = "NGO"
    OTHER = "OTHER"


class RequestStatus(str, enum.Enum):
    CREATED = "CREATED"
    MATCHING = "MATCHING"
    DONOR_NOTIFIED = "DONOR_NOTIFIED"
    DONOR_ACCEPTED = "DONOR_ACCEPTED"
    EN_ROUTE = "EN_ROUTE"
    BLOOD_RECEIVED = "BLOOD_RECEIVED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class UrgencyLevel(str, enum.Enum):
    ROUTINE = "ROUTINE"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"


class MatchStatus(str, enum.Enum):
    PENDING = "PENDING"
    NOTIFIED = "NOTIFIED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class NotificationChannel(str, enum.Enum):
    IN_APP = "IN_APP"
    SMS = "SMS"
    EMAIL = "EMAIL"
    PUSH = "PUSH"


class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"


# ── Helper ────────────────────────────────────────────────────────────────────
def _now():
    return datetime.now(timezone.utc)


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.DONOR)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relationships
    donor_profile = relationship("Donor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    requester_profile = relationship("Requester", back_populates="user", uselist=False, cascade="all, delete-orphan")
    hospital_profile = relationship("Hospital", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    blood_group = Column(Enum(BloodGroup), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    weight_kg = Column(Float, nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    area = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    last_donation_date = Column(DateTime(timezone=True), nullable=True)
    previous_donation = Column(Boolean, default=False)
    total_donations = Column(Integer, default=0)
    consent_share_availability = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relationships
    user = relationship("User", back_populates="donor_profile")
    matches = relationship("Match", back_populates="donor", cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="donor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Donor id={self.id} name={self.name} blood_group={self.blood_group}>"


class Requester(Base):
    __tablename__ = "requesters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    city = Column(String(100), nullable=True)
    area = Column(String(200), nullable=True)
    relationship_to_patient = Column(Enum(RelationshipToPatient), nullable=True, default=RelationshipToPatient.SELF)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relationships
    user = relationship("User", back_populates="requester_profile")

    def __repr__(self):
        return f"<Requester id={self.id} name={self.name}>"


class Hospital(Base):
    """Represents a Blood Bank / Hospital organization."""
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=True)
    blood_bank_type = Column(Enum(BloodBankType), nullable=True, default=BloodBankType.PRIVATE)
    is_verified = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True)
    # Authorized contact person
    contact_person_name = Column(String(150), nullable=True)
    contact_person_designation = Column(String(100), nullable=True)
    contact_person_phone = Column(String(20), nullable=True)
    contact_person_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relationships
    user = relationship("User", back_populates="hospital_profile")
    blood_requests = relationship("BloodRequest", back_populates="hospital", cascade="all, delete-orphan")
    inventory = relationship("BloodInventory", back_populates="hospital", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Hospital id={self.id} name={self.name}>"


class BloodInventory(Base):
    __tablename__ = "blood_inventory"
    __table_args__ = (
        UniqueConstraint("hospital_id", "blood_group", name="uq_hospital_blood_group"),
    )

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    blood_group = Column(Enum(BloodGroup), nullable=False, index=True)
    units_available = Column(Integer, default=0, nullable=False)
    units_reserved = Column(Integer, default=0, nullable=False)
    safe_threshold = Column(Integer, default=5, nullable=False)
    expiry_date = Column(Date, nullable=True)
    last_updated = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relationships
    hospital = relationship("Hospital", back_populates="inventory")

    def __repr__(self):
        return f"<BloodInventory hospital={self.hospital_id} {self.blood_group}={self.units_available}u>"


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=True, index=True)
    requested_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blood_group = Column(Enum(BloodGroup), nullable=False, index=True)
    units_required = Column(Integer, nullable=False)
    units_fulfilled = Column(Integer, default=0)
    urgency = Column(Enum(UrgencyLevel), nullable=False, default=UrgencyLevel.URGENT)
    status = Column(Enum(RequestStatus), nullable=False, default=RequestStatus.CREATED, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    hospital_name = Column(String(255), nullable=True)
    patient_name = Column(String(150), nullable=True)
    emergency_contact = Column(String(30), nullable=True)
    city = Column(String(100), nullable=True)
    area = Column(String(100), nullable=True)
    required_by = Column(DateTime(timezone=True), nullable=True)
    patient_reference = Column(String(255), nullable=True)  # anonymised reference only
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relationships
    hospital = relationship("Hospital", back_populates="blood_requests")
    requested_by = relationship("User", foreign_keys=[requested_by_user_id])
    matches = relationship("Match", back_populates="blood_request", cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="blood_request")

    def __repr__(self):
        return f"<BloodRequest id={self.id} {self.blood_group} status={self.status}>"


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    blood_request_id = Column(Integer, ForeignKey("blood_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Float, nullable=False)          # 0-100, AI-assisted prioritization score
    distance_km = Column(Float, nullable=True)
    status = Column(Enum(MatchStatus), nullable=False, default=MatchStatus.PENDING, index=True)
    score_breakdown = Column(Text, nullable=True)        # JSON string of score components
    eta_minutes = Column(Integer, nullable=True)         # Donor's estimated arrival time
    notified_at = Column(DateTime(timezone=True), nullable=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relationships
    blood_request = relationship("BloodRequest", back_populates="matches")
    donor = relationship("Donor", back_populates="matches")

    def __repr__(self):
        return f"<Match id={self.id} donor={self.donor_id} score={self.match_score} status={self.status}>"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    channel = Column(Enum(NotificationChannel), default=NotificationChannel.IN_APP)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    is_read = Column(Boolean, default=False)
    reference_type = Column(String(50), nullable=True)   # e.g. "blood_request", "match"
    reference_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now)

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification id={self.id} user={self.user_id} status={self.status}>"


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    blood_request_id = Column(Integer, ForeignKey("blood_requests.id"), nullable=False, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    units_donated = Column(Integer, nullable=False)
    blood_group = Column(Enum(BloodGroup), nullable=False)
    donated_at = Column(DateTime(timezone=True), default=_now)
    notes = Column(Text, nullable=True)

    # Relationships
    donor = relationship("Donor", back_populates="donations")
    blood_request = relationship("BloodRequest", back_populates="donations")

    def __repr__(self):
        return f"<Donation id={self.id} donor={self.donor_id} units={self.units_donated}>"


class InventoryBatch(Base):
    __tablename__ = "inventory_batches"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("blood_inventory.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(50), nullable=False)
    units = Column(Integer, nullable=False)
    collection_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False, default="AVAILABLE")
    created_at = Column(DateTime(timezone=True), default=_now)

    inventory = relationship("BloodInventory", backref="batches")


class DonorResponse(Base):
    __tablename__ = "donor_responses"
    __table_args__ = (
        UniqueConstraint("request_id", "donor_id", name="uq_request_donor_response"),
    )

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("blood_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="PENDING")
    eta_minutes = Column(Integer, nullable=True)
    responded_at = Column(DateTime(timezone=True), default=_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)


class BloodBankResponse(Base):
    __tablename__ = "blood_bank_responses"
    __table_args__ = (
        UniqueConstraint("request_id", "hospital_id", name="uq_request_hospital_response"),
    )

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("blood_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    units_offered = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="PENDING")
    responded_at = Column(DateTime(timezone=True), default=_now)
