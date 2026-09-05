"""
Blood Link — Hospitals / Blood Banks Router
POST  /api/hospitals                         — create profile (HOSPITAL role)
GET   /api/hospitals                         — list all
GET   /api/hospitals/me                      — get own blood bank profile
GET   /api/hospitals/{hospital_id}           — get details
PUT   /api/hospitals/{hospital_id}           — update profile
GET   /api/hospitals/{hospital_id}/requests  — incoming blood requests for this bank
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.dependencies import get_current_user, get_db
from app.database import models
from app.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalOut
from app.schemas.request import BloodRequestOut

router = APIRouter(prefix="/api/hospitals", tags=["Blood Banks / Hospitals"])


# ── POST /api/hospitals ─────────────────────────────────────────────────────
@router.post(
    "",
    response_model=HospitalOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create blood bank / hospital profile (HOSPITAL role required)",
)
def create_hospital_profile(
    payload: HospitalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="HOSPITAL role required"
        )
    if current_user.hospital_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Hospital profile already exists for this account",
        )
    hospital = models.Hospital(user_id=current_user.id, **payload.model_dump())
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


# ── GET /api/hospitals ──────────────────────────────────────────────────────
@router.get(
    "",
    response_model=List[HospitalOut],
    summary="List all blood banks / hospitals",
)
def list_hospitals(
    city: Optional[str] = Query(None, description="Filter by city"),
    blood_bank_type: Optional[str] = Query(None, description="Filter by type"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.Hospital)
    if city:
        q = q.filter(models.Hospital.city.ilike(f"%{city}%"))
    if blood_bank_type:
        q = q.filter(models.Hospital.blood_bank_type == blood_bank_type)
    return q.offset(skip).limit(limit).all()


# ── GET /api/hospitals/me ───────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=HospitalOut,
    summary="Get the current user's blood bank profile",
)
def get_my_hospital_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="HOSPITAL role required"
        )
    hospital = db.query(models.Hospital).filter(
        models.Hospital.user_id == current_user.id
    ).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood bank profile not found. Please create your profile first.",
        )
    return hospital


# ── GET /api/hospitals/{hospital_id} ────────────────────────────────────────
@router.get(
    "/{hospital_id}",
    response_model=HospitalOut,
    summary="Get blood bank / hospital details",
)
def get_hospital(
    hospital_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    hospital = db.query(models.Hospital).filter(
        models.Hospital.id == hospital_id
    ).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    return hospital


# ── PUT /api/hospitals/{hospital_id} ────────────────────────────────────────
@router.put(
    "/{hospital_id}",
    response_model=HospitalOut,
    summary="Update blood bank / hospital profile (owner or ADMIN)",
)
def update_hospital(
    hospital_id: int,
    payload: HospitalUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    hospital = db.query(models.Hospital).filter(
        models.Hospital.id == hospital_id
    ).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    if current_user.role != "ADMIN" and current_user.id != hospital.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(hospital, field, value)
    db.commit()
    db.refresh(hospital)
    return hospital


# ── GET /api/hospitals/{hospital_id}/requests ────────────────────────────────
@router.get(
    "/{hospital_id}/requests",
    response_model=List[BloodRequestOut],
    summary="View incoming blood requests for this blood bank",
    description="Shows all blood requests directed at this hospital/blood bank.",
)
def get_hospital_incoming_requests(
    hospital_id: int,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    hospital = db.query(models.Hospital).filter(
        models.Hospital.id == hospital_id
    ).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    if current_user.role != "ADMIN" and current_user.id != hospital.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    q = db.query(models.BloodRequest).filter(
        models.BloodRequest.hospital_id == hospital_id
    )
    if status_filter:
        q = q.filter(models.BloodRequest.status == status_filter)

    return (
        q.order_by(models.BloodRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
