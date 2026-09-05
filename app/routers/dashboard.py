"""
Blood Link — Dashboard Router
GET /api/dashboard/donor           — donor dashboard stats
GET /api/dashboard/requester       — requester dashboard stats
GET /api/dashboard/bloodbank       — blood bank dashboard stats
GET /api/dashboard/stats           — unified frontend dashboard metrics
GET /api/dashboard/landing-metrics — landing page key metrics
"""

from typing import Optional
from datetime import datetime, timezone, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_optional_current_user, get_db
from app.database import models
from app.schemas.dashboard import (
    DonorDashboardStats,
    RequesterDashboardStats,
    BloodBankDashboardStats,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

MIN_DONATION_INTERVAL_DAYS = 90
LOW_STOCK_THRESHOLD = 5
EXPIRY_WARNING_DAYS = 7


# ── GET /api/dashboard/stats ────────────────────────────────────────────────
@router.get(
    "/stats",
    summary="Unified dashboard stats for frontend",
    description="Returns aggregated metrics for the BloodLink dashboard.",
)
def get_unified_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    active_statuses = [
        models.RequestStatus.CREATED,
        models.RequestStatus.MATCHING,
        models.RequestStatus.DONOR_NOTIFIED,
        models.RequestStatus.DONOR_ACCEPTED,
        models.RequestStatus.EN_ROUTE,
        models.RequestStatus.BLOOD_RECEIVED,
    ]

    if current_user and current_user.role == models.UserRole.REQUESTER:
        active_requests = db.query(models.BloodRequest).filter(
            models.BloodRequest.requested_by_user_id == current_user.id,
            models.BloodRequest.status.in_(active_statuses),
        ).all()
        fulfilled_count = db.query(models.BloodRequest).filter(
            models.BloodRequest.requested_by_user_id == current_user.id,
            models.BloodRequest.status == models.RequestStatus.COMPLETED,
        ).count()
    else:
        active_requests = db.query(models.BloodRequest).filter(
            models.BloodRequest.status.in_(active_statuses),
        ).all()
        fulfilled_count = db.query(models.BloodRequest).filter(
            models.BloodRequest.status == models.RequestStatus.COMPLETED,
        ).count()

    active_count = len(active_requests)
    units_secured = sum((r.units_fulfilled or 0) for r in active_requests)
    total_donors = db.query(models.Donor).filter(models.Donor.is_available == True).count()

    return {
        "activeRequestsCount": active_count,
        "unitsSecuredDisplay": f"{units_secured} units" if units_secured else "0 units",
        "fulfilledCount": fulfilled_count,
        "avgResponseTime": "14 mins",
        "totalDonorsAvailable": total_donors,
    }


# ── GET /api/dashboard/landing-metrics ───────────────────────────────────────
@router.get(
    "/landing-metrics",
    summary="Landing page key metrics",
    description="Returns global public counts of available donors, banks, and resolved requests.",
)
def get_landing_metrics(db: Session = Depends(get_db)):
    active_donors = db.query(models.Donor).filter(models.Donor.is_available == True).count()
    verified_banks = db.query(models.Hospital).filter(models.Hospital.is_verified == True).count()
    completed_requests = db.query(models.BloodRequest).filter(
        models.BloodRequest.status == models.RequestStatus.COMPLETED
    ).count()

    return {
        "donorsAvailable": active_donors,
        "verifiedBanks": verified_banks,
        "requestsResolved": completed_requests,
        "avgResponseMinutes": 14,
    }


# ── GET /api/dashboard/donor ────────────────────────────────────────────────
@router.get(
    "/donor",
    response_model=DonorDashboardStats,
    summary="Get donor dashboard summary stats",
)
def get_donor_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in (models.UserRole.DONOR, models.UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DONOR role required",
        )

    donor = db.query(models.Donor).filter(
        models.Donor.user_id == current_user.id
    ).first()
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor profile not found. Please create your profile first.",
        )

    # Check eligibility
    is_eligible = True
    next_eligible_date = None
    if donor.last_donation_date:
        last_date = donor.last_donation_date
        if getattr(last_date, "tzinfo", None) is None:
            last_date = last_date.replace(tzinfo=timezone.utc)
        next_eligible = last_date + timedelta(days=MIN_DONATION_INTERVAL_DAYS)
        if datetime.now(timezone.utc) < next_eligible:
            is_eligible = False
            next_eligible_date = next_eligible

    # Count pending emergency requests matching donor's blood type
    donor_bg = donor.blood_group.value if hasattr(donor.blood_group, "value") else donor.blood_group
    compatible_groups = _get_receivable_groups(donor_bg)
    pending_requests = (
        db.query(models.BloodRequest)
        .filter(
            models.BloodRequest.blood_group.in_(compatible_groups),
            models.BloodRequest.status.in_([
                models.RequestStatus.CREATED,
                models.RequestStatus.MATCHING,
                models.RequestStatus.DONOR_NOTIFIED,
            ]),
        )
        .count()
    )

    # Count active matches for this donor
    active_matches = (
        db.query(models.Match)
        .filter(
            models.Match.donor_id == donor.id,
            models.Match.status.in_([
                models.MatchStatus.PENDING,
                models.MatchStatus.NOTIFIED,
                models.MatchStatus.ACCEPTED,
            ]),
        )
        .count()
    )

    bg_val = donor.blood_group.value if hasattr(donor.blood_group, "value") else donor.blood_group

    return DonorDashboardStats(
        donor_id=donor.id,
        name=donor.name,
        blood_group=bg_val,
        is_available=donor.is_available,
        is_eligible=is_eligible,
        total_donations=donor.total_donations or 0,
        last_donation_date=donor.last_donation_date,
        next_eligible_date=next_eligible_date,
        pending_requests_count=pending_requests,
        active_matches_count=active_matches,
    )


# ── GET /api/dashboard/requester ────────────────────────────────────────────
@router.get(
    "/requester",
    response_model=RequesterDashboardStats,
    summary="Get requester dashboard summary stats",
)
def get_requester_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in (models.UserRole.REQUESTER, models.UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="REQUESTER role required",
        )

    requester = db.query(models.Requester).filter(
        models.Requester.user_id == current_user.id
    ).first()

    name = requester.name if requester else (current_user.full_name or "Unknown")
    requester_id = requester.id if requester else 0

    total = (
        db.query(models.BloodRequest)
        .filter(models.BloodRequest.requested_by_user_id == current_user.id)
        .count()
    )
    active = (
        db.query(models.BloodRequest)
        .filter(
            models.BloodRequest.requested_by_user_id == current_user.id,
            models.BloodRequest.status.in_([
                models.RequestStatus.CREATED,
                models.RequestStatus.MATCHING,
                models.RequestStatus.DONOR_NOTIFIED,
                models.RequestStatus.DONOR_ACCEPTED,
                models.RequestStatus.EN_ROUTE,
                models.RequestStatus.BLOOD_RECEIVED,
            ]),
        )
        .count()
    )
    fulfilled = (
        db.query(models.BloodRequest)
        .filter(
            models.BloodRequest.requested_by_user_id == current_user.id,
            models.BloodRequest.status == models.RequestStatus.COMPLETED,
        )
        .count()
    )
    cancelled = (
        db.query(models.BloodRequest)
        .filter(
            models.BloodRequest.requested_by_user_id == current_user.id,
            models.BloodRequest.status == models.RequestStatus.CANCELLED,
        )
        .count()
    )

    return RequesterDashboardStats(
        requester_id=requester_id,
        name=name,
        total_requests=total,
        active_requests=active,
        fulfilled_requests=fulfilled,
        cancelled_requests=cancelled,
    )


# ── GET /api/dashboard/bloodbank ────────────────────────────────────────────
@router.get(
    "/bloodbank",
    response_model=BloodBankDashboardStats,
    summary="Get blood bank dashboard summary stats",
)
def get_bloodbank_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in (models.UserRole.HOSPITAL, models.UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOSPITAL role required",
        )

    hospital = db.query(models.Hospital).filter(
        models.Hospital.user_id == current_user.id
    ).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood bank profile not found.",
        )

    # Inventory summary
    inv_records = (
        db.query(models.BloodInventory)
        .filter(models.BloodInventory.hospital_id == hospital.id)
        .all()
    )

    total_available = sum(r.units_available for r in inv_records)
    total_reserved = sum(r.units_reserved for r in inv_records)

    low_stock_count = 0
    expiring_soon_count = 0
    inventory_summary = []
    cutoff = date.today() + timedelta(days=EXPIRY_WARNING_DAYS)

    for inv in inv_records:
        net = inv.units_available - inv.units_reserved
        if net <= LOW_STOCK_THRESHOLD:
            low_stock_count += 1
        if inv.expiry_date and inv.expiry_date <= cutoff:
            expiring_soon_count += 1

        bg_val = inv.blood_group.value if hasattr(inv.blood_group, "value") else inv.blood_group
        inventory_summary.append({
            "blood_group": bg_val,
            "units_available": inv.units_available,
            "units_reserved": inv.units_reserved,
            "net_available": net,
            "expiry_date": str(inv.expiry_date) if inv.expiry_date else None,
        })

    # Incoming requests
    incoming = (
        db.query(models.BloodRequest)
        .filter(
            models.BloodRequest.hospital_id == hospital.id,
            models.BloodRequest.status.in_([
                models.RequestStatus.CREATED,
                models.RequestStatus.MATCHING,
                models.RequestStatus.DONOR_NOTIFIED,
                models.RequestStatus.DONOR_ACCEPTED,
                models.RequestStatus.EN_ROUTE,
            ]),
        )
        .count()
    )

    return BloodBankDashboardStats(
        hospital_id=hospital.id,
        name=hospital.name,
        total_blood_groups_stocked=len(inv_records),
        total_units_available=total_available,
        total_units_reserved=total_reserved,
        low_stock_count=low_stock_count,
        expiring_soon_count=expiring_soon_count,
        incoming_requests_count=incoming,
        inventory_summary=inventory_summary,
    )


def _get_receivable_groups(donor_blood_group: str) -> list:
    """Given a donor's blood group, return which request blood groups they can fulfill."""
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
