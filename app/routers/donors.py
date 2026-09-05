"""
Blood Link — Donors Router
GET    /api/donors                           — list donors (public)
POST   /api/donors                           — create profile (DONOR only)
GET    /api/donors/me                        — get own donor profile
GET    /api/donors/{donor_id}                — get donor details
PUT    /api/donors/{donor_id}                — update donor profile
PATCH  /api/donors/{donor_id}/availability   — toggle availability
GET    /api/donors/{donor_id}/history        — donation history
GET    /api/donors/{donor_id}/eligibility    — check eligibility & next date
GET    /api/donors/{donor_id}/emergency-requests — nearby matching requests
"""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_current_user, get_db, require_role
from app.database import models
from app.schemas.donor import (
    DonorCreate, DonorUpdate, DonorAvailabilityUpdate,
    DonorOut, DonorPublicOut, DonorEligibility,
)
from app.schemas.inventory import DonationOut
from app.schemas.request import BloodRequestOut
from app.services.compatibility_service import get_compatible_donor_groups

router = APIRouter(prefix="/api/donors", tags=["Donors"])

# Minimum days between whole-blood donations
MIN_DONATION_INTERVAL_DAYS = 90


# ── POST /api/donors — create donor profile ──────────────────────────────────
@router.post(
    "",
    response_model=DonorOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create donor profile (DONOR role required)",
)
def create_donor_profile(
    payload: DonorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("DONOR", "ADMIN")),
):
    if current_user.role == "DONOR" and current_user.donor_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Donor profile already exists for this account",
        )
    donor = models.Donor(
        user_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor


# ── GET /api/donors — list (public summary) ──────────────────────────────────
@router.get(
    "",
    response_model=List[DonorPublicOut],
    summary="List donors (public info only)",
)
def list_donors(
    blood_group: str = Query(None, description="Filter by blood group e.g. O-"),
    city: str = Query(None, description="Filter by city"),
    available_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.Donor)
    if blood_group:
        q = q.filter(models.Donor.blood_group == blood_group)
    if city:
        q = q.filter(models.Donor.city.ilike(f"%{city}%"))
    if available_only:
        q = q.filter(models.Donor.is_available == True)
    return q.offset(skip).limit(limit).all()


# ── GET /api/donors/me — get own profile ─────────────────────────────────────
@router.get(
    "/me",
    response_model=DonorOut,
    summary="Get the current donor's own profile",
)
def get_my_donor_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("DONOR")),
):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor profile not found. Please create your profile first.",
        )
    return donor


# ── GET /api/donors/{donor_id} ───────────────────────────────────────────────
@router.get(
    "/{donor_id}",
    response_model=DonorOut,
    summary="Get donor details (authenticated users only)",
)
def get_donor(
    donor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")

    # Non-admin, non-owner cannot see full details
    if current_user.role not in ("ADMIN", "HOSPITAL") and current_user.id != donor.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return donor


# ── PUT /api/donors/{donor_id} ───────────────────────────────────────────────
@router.put(
    "/{donor_id}",
    response_model=DonorOut,
    summary="Update donor profile (owner or ADMIN)",
)
def update_donor(
    donor_id: int,
    payload: DonorUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if current_user.role != "ADMIN" and current_user.id != donor.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(donor, field, value)
    db.commit()
    db.refresh(donor)
    return donor


# ── PATCH /api/donors/{donor_id}/availability ────────────────────────────────
@router.patch(
    "/{donor_id}/availability",
    response_model=DonorOut,
    summary="Toggle donor availability (owner or ADMIN)",
)
def update_donor_availability(
    donor_id: int,
    payload: DonorAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if current_user.role != "ADMIN" and current_user.id != donor.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    donor.is_available = payload.is_available
    db.commit()
    db.refresh(donor)
    return donor


# ── GET /api/donors/{donor_id}/history ──────────────────────────────────────
@router.get(
    "/{donor_id}/history",
    response_model=List[DonationOut],
    summary="Get donation history for a donor (owner or ADMIN)",
)
def get_donor_history(
    donor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if current_user.role != "ADMIN" and current_user.id != donor.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return (
        db.query(models.Donation)
        .filter(models.Donation.donor_id == donor_id)
        .order_by(models.Donation.donated_at.desc())
        .all()
    )


# ── GET /api/donors/{donor_id}/eligibility ──────────────────────────────────
@router.get(
    "/{donor_id}/eligibility",
    response_model=DonorEligibility,
    summary="Check donor eligibility and next eligible donation date",
)
def get_donor_eligibility(
    donor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if current_user.role != "ADMIN" and current_user.id != donor.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not donor.last_donation_date:
        return DonorEligibility(
            is_eligible=True,
            last_donation_date=None,
            next_eligible_date=None,
            days_until_eligible=0,
            message="You are eligible to donate. No previous donation on record.",
        )

    next_eligible = donor.last_donation_date + timedelta(days=MIN_DONATION_INTERVAL_DAYS)
    now = datetime.now(timezone.utc)
    is_eligible = now >= next_eligible
    days_left = max(0, (next_eligible - now).days) if not is_eligible else 0

    if is_eligible:
        message = "You are eligible to donate blood!"
    else:
        message = f"You can donate again in {days_left} days (after {next_eligible.strftime('%Y-%m-%d')})."

    return DonorEligibility(
        is_eligible=is_eligible,
        last_donation_date=donor.last_donation_date,
        next_eligible_date=next_eligible if not is_eligible else None,
        days_until_eligible=days_left,
        message=message,
    )


# ── GET /api/donors/{donor_id}/emergency-requests ───────────────────────────
@router.get(
    "/{donor_id}/emergency-requests",
    response_model=List[BloodRequestOut],
    summary="See nearby emergency requests matching the donor's blood group",
)
def get_donor_emergency_requests(
    donor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if current_user.role != "ADMIN" and current_user.id != donor.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Get blood groups this donor can donate to
    donor_bg = donor.blood_group.value if hasattr(donor.blood_group, "value") else donor.blood_group

    # Find active requests that need compatible blood
    # We check which request blood groups this donor's blood is compatible with
    compatible_request_groups = _get_receivable_groups(donor_bg)

    requests = (
        db.query(models.BloodRequest)
        .filter(
            models.BloodRequest.blood_group.in_(compatible_request_groups),
            models.BloodRequest.status.in_([
                "CREATED", "MATCHING", "DONOR_NOTIFIED"
            ]),
        )
        .order_by(
            # CRITICAL first, then URGENT, then ROUTINE
            models.BloodRequest.urgency.desc(),
            models.BloodRequest.created_at.desc(),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return requests


def _get_receivable_groups(donor_blood_group: str) -> list:
    """Given a donor's blood group, return which request blood groups they can fulfill."""
    # Reverse the compatibility: if donor is O-, they can donate to everyone
    compatibility_map = {
        "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
        "O+":  ["O+", "A+", "B+", "AB+"],
        "A-":  ["A-", "A+", "AB-", "AB+"],
        "A+":  ["A+", "AB+"],
        "B-":  ["B-", "B+", "AB-", "AB+"],
        "B+":  ["B+", "AB+"],
        "AB-": ["AB-", "AB+"],
        "AB+": ["AB+"],
    }
    return compatibility_map.get(donor_blood_group, [donor_blood_group])
