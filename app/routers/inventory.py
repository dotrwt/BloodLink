"""
Blood Link — Blood Inventory Router
GET    /api/inventory                      — list blood inventory
POST   /api/inventory                      — add inventory record
PATCH  /api/inventory/{inventory_id}       — update inventory units
GET    /api/inventory/low-stock            — low stock alerts
GET    /api/inventory/expiring             — expiry alerts
POST   /api/donations                      — record a completed donation
GET    /api/donations                      — list donation records
"""

from datetime import date, datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.dependencies import get_current_user, get_db
from app.database import models
from app.schemas.inventory import (
    InventoryCreate, InventoryUpdate, InventoryOut,
    DonationRecordCreate, DonationOut,
    LowStockAlert, ExpiryAlert,
)

router = APIRouter(tags=["Inventory & Donations"])

# Threshold for low-stock alerts (units)
LOW_STOCK_THRESHOLD = 5
# Days before expiry to trigger alert
EXPIRY_WARNING_DAYS = 7


# ── INVENTORY ────────────────────────────────────────────────────────────────

@router.get(
    "/api/inventory",
    response_model=List[InventoryOut],
    summary="List blood inventory",
)
def list_inventory(
    hospital_id: Optional[int] = Query(None),
    blood_group: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.BloodInventory)
    if hospital_id:
        q = q.filter(models.BloodInventory.hospital_id == hospital_id)
    if blood_group:
        q = q.filter(models.BloodInventory.blood_group == blood_group)
    return q.all()


@router.post(
    "/api/inventory",
    response_model=InventoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Add inventory record (HOSPITAL or ADMIN)",
)
def create_inventory(
    payload: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOSPITAL or ADMIN role required",
        )

    hospital = db.query(models.Hospital).filter(
        models.Hospital.id == payload.hospital_id
    ).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )

    # Check for duplicate
    existing = (
        db.query(models.BloodInventory)
        .filter(
            models.BloodInventory.hospital_id == payload.hospital_id,
            models.BloodInventory.blood_group == payload.blood_group,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Inventory for {payload.blood_group} already exists for this hospital. Use PATCH to update.",
        )

    inv = models.BloodInventory(
        hospital_id=payload.hospital_id,
        blood_group=payload.blood_group,
        units_available=payload.units_available,
        expiry_date=payload.expiry_date,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.patch(
    "/api/inventory/{inventory_id}",
    response_model=InventoryOut,
    summary="Update inventory units (HOSPITAL or ADMIN)",
)
def update_inventory(
    inventory_id: int,
    payload: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOSPITAL or ADMIN role required",
        )

    inv = db.query(models.BloodInventory).filter(
        models.BloodInventory.id == inventory_id
    ).first()
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found",
        )

    if payload.units_available is not None:
        inv.units_available = payload.units_available
    if payload.units_reserved is not None:
        if payload.units_reserved > (payload.units_available if payload.units_available is not None else inv.units_available):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reserved units cannot exceed available units",
            )
        inv.units_reserved = payload.units_reserved
    if payload.expiry_date is not None:
        inv.expiry_date = payload.expiry_date

    db.commit()
    db.refresh(inv)
    return inv


# ── LOW-STOCK ALERTS ─────────────────────────────────────────────────────────

@router.get(
    "/api/inventory/low-stock",
    response_model=List[LowStockAlert],
    summary="Get low-stock alerts for blood bank",
    description=f"Returns inventory records where net available units (available - reserved) are below {LOW_STOCK_THRESHOLD}.",
)
def get_low_stock_alerts(
    hospital_id: Optional[int] = Query(None, description="Filter by hospital"),
    threshold: int = Query(LOW_STOCK_THRESHOLD, description="Low-stock threshold"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOSPITAL or ADMIN role required",
        )

    q = db.query(models.BloodInventory).join(models.Hospital)

    if hospital_id:
        q = q.filter(models.BloodInventory.hospital_id == hospital_id)
    elif current_user.role == "HOSPITAL":
        # Only show own hospital's alerts
        own_hospital = db.query(models.Hospital).filter(
            models.Hospital.user_id == current_user.id
        ).first()
        if own_hospital:
            q = q.filter(models.BloodInventory.hospital_id == own_hospital.id)

    records = q.all()
    alerts = []
    for inv in records:
        net = inv.units_available - inv.units_reserved
        if net <= threshold:
            alerts.append(LowStockAlert(
                hospital_id=inv.hospital_id,
                hospital_name=inv.hospital.name,
                blood_group=inv.blood_group,
                units_available=inv.units_available,
                units_reserved=inv.units_reserved,
                net_available=net,
                is_critical=net <= 0,
            ))
    return alerts


# ── EXPIRY ALERTS ────────────────────────────────────────────────────────────

@router.get(
    "/api/inventory/expiring",
    response_model=List[ExpiryAlert],
    summary="Get blood units nearing expiry",
    description=f"Returns inventory records expiring within {EXPIRY_WARNING_DAYS} days.",
)
def get_expiry_alerts(
    hospital_id: Optional[int] = Query(None),
    days: int = Query(EXPIRY_WARNING_DAYS, description="Warning window in days"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOSPITAL or ADMIN role required",
        )

    q = db.query(models.BloodInventory).join(models.Hospital).filter(
        models.BloodInventory.expiry_date.isnot(None)
    )

    if hospital_id:
        q = q.filter(models.BloodInventory.hospital_id == hospital_id)
    elif current_user.role == "HOSPITAL":
        own_hospital = db.query(models.Hospital).filter(
            models.Hospital.user_id == current_user.id
        ).first()
        if own_hospital:
            q = q.filter(models.BloodInventory.hospital_id == own_hospital.id)

    cutoff = date.today() + timedelta(days=days)
    q = q.filter(models.BloodInventory.expiry_date <= cutoff)

    records = q.all()
    alerts = []
    for inv in records:
        days_until = (inv.expiry_date - date.today()).days if inv.expiry_date else None
        alerts.append(ExpiryAlert(
            inventory_id=inv.id,
            hospital_id=inv.hospital_id,
            hospital_name=inv.hospital.name,
            blood_group=inv.blood_group,
            units_available=inv.units_available,
            expiry_date=inv.expiry_date,
            days_until_expiry=days_until,
            is_expired=(days_until is not None and days_until <= 0),
        ))
    return alerts


# ── DONATIONS ────────────────────────────────────────────────────────────────

@router.post(
    "/api/donations",
    response_model=DonationOut,
    status_code=status.HTTP_201_CREATED,
    summary="Record a completed donation (DONOR or HOSPITAL or ADMIN)",
    description=(
        "Records a donation event, updates hospital inventory, "
        "and marks the blood request as BLOOD_RECEIVED."
    ),
)
def record_donation(
    payload: DonationRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("DONOR", "HOSPITAL", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    # Resolve donor
    if current_user.role == "DONOR":
        donor = db.query(models.Donor).filter(
            models.Donor.user_id == current_user.id
        ).first()
        if not donor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Donor profile not found",
            )
    else:
        # Admin/Hospital specify a match_id to identify the donor
        if not payload.match_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="match_id is required when recording donation as HOSPITAL/ADMIN",
            )
        match = db.query(models.Match).filter(
            models.Match.id == payload.match_id
        ).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Match not found"
            )
        donor = match.donor

    # Validate request
    request = db.query(models.BloodRequest).filter(
        models.BloodRequest.id == payload.blood_request_id
    ).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood request not found",
        )

    if request.status in ("COMPLETED", "CANCELLED"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Blood request is already '{request.status}' — cannot record donation",
        )

    # Update inventory (only if request has a hospital_id)
    if request.hospital_id:
        inv = (
            db.query(models.BloodInventory)
            .filter(
                models.BloodInventory.hospital_id == request.hospital_id,
                models.BloodInventory.blood_group == donor.blood_group,
            )
            .first()
        )
        if inv:
            inv.units_available += payload.units_donated
        else:
            inv = models.BloodInventory(
                hospital_id=request.hospital_id,
                blood_group=donor.blood_group,
                units_available=payload.units_donated,
            )
            db.add(inv)

    # Update request fulfillment
    request.units_fulfilled = (request.units_fulfilled or 0) + payload.units_donated
    if request.status not in ("BLOOD_RECEIVED", "COMPLETED"):
        request.status = models.RequestStatus.BLOOD_RECEIVED

    if request.units_fulfilled >= request.units_required:
        request.status = models.RequestStatus.COMPLETED

    # Update donor stats
    donor.last_donation_date = datetime.now(timezone.utc)
    donor.total_donations = (donor.total_donations or 0) + 1

    # Create donation record
    donation = models.Donation(
        donor_id=donor.id,
        blood_request_id=request.id,
        match_id=payload.match_id,
        units_donated=payload.units_donated,
        blood_group=donor.blood_group,
        notes=payload.notes,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


@router.get(
    "/api/donations",
    response_model=List[DonationOut],
    summary="List donation records (HOSPITAL or ADMIN)",
)
def list_donations(
    donor_id: Optional[int] = Query(None),
    request_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN", "DONOR"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    q = db.query(models.Donation)

    if current_user.role == "DONOR":
        own_donor = db.query(models.Donor).filter(
            models.Donor.user_id == current_user.id
        ).first()
        if own_donor:
            q = q.filter(models.Donation.donor_id == own_donor.id)
    else:
        if donor_id:
            q = q.filter(models.Donation.donor_id == donor_id)
        if request_id:
            q = q.filter(models.Donation.blood_request_id == request_id)

    return (
        q.order_by(models.Donation.donated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
