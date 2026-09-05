"""
Blood Link — Blood Requests Router
POST   /api/requests                          — create blood request
GET    /api/requests                          — list blood requests
GET    /api/requests/my                       — list my own requests (REQUESTER)
GET    /api/requests/{request_id}             — get single request
PATCH  /api/requests/{request_id}/status      — update request status
POST   /api/requests/{request_id}/close       — close/fulfill a request (REQUESTER)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.dependencies import get_current_user, get_db
from app.database import models
from app.schemas.request import BloodRequestCreate, BloodRequestOut, BloodRequestStatusUpdate

router = APIRouter(prefix="/api/requests", tags=["Blood Requests"])

# Valid forward and simulation transitions
VALID_TRANSITIONS = {
    "CREATED":         {"MATCHING", "DONOR_NOTIFIED", "DONOR_ACCEPTED", "CANCELLED"},
    "MATCHING":        {"CREATED", "DONOR_NOTIFIED", "DONOR_ACCEPTED", "CANCELLED"},
    "DONOR_NOTIFIED":  {"MATCHING", "DONOR_ACCEPTED", "EN_ROUTE", "CANCELLED"},
    "DONOR_ACCEPTED":  {"MATCHING", "DONOR_NOTIFIED", "EN_ROUTE", "BLOOD_RECEIVED", "CANCELLED"},
    "EN_ROUTE":        {"MATCHING", "DONOR_ACCEPTED", "BLOOD_RECEIVED", "COMPLETED", "CANCELLED"},
    "BLOOD_RECEIVED":  {"MATCHING", "EN_ROUTE", "COMPLETED", "CANCELLED"},
    "COMPLETED":       {"MATCHING", "CREATED"},
    "CANCELLED":       {"MATCHING", "CREATED"},
}


# ── POST /api/requests ──────────────────────────────────────────────────────
@router.post(
    "",
    response_model=BloodRequestOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create an emergency blood request (HOSPITAL, REQUESTER, or ADMIN)",
    description=(
        "Creates a new emergency blood request. "
        "Requesters can create requests without a hospital_id. "
        "Urgency levels: ROUTINE, URGENT, CRITICAL."
    ),
)
def create_blood_request(
    payload: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "REQUESTER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOSPITAL or REQUESTER accounts can create blood requests",
        )

    hospital = None
    hosp_lat = payload.latitude
    hosp_lon = payload.longitude

    if payload.hospital_id:
        # Validate hospital exists
        hospital = db.query(models.Hospital).filter(
            models.Hospital.id == payload.hospital_id
        ).first()
        if not hospital:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hospital with id={payload.hospital_id} not found",
            )

        # Non-admin HOSPITAL must own the hospital
        if current_user.role == "HOSPITAL":
            if hospital.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only create requests for your own hospital",
                )

        hosp_lat = payload.latitude or hospital.latitude
        hosp_lon = payload.longitude or hospital.longitude

    hosp_city = payload.city
    hosp_area = payload.area
    if hospital:
        hosp_city = hosp_city or hospital.city
        hosp_area = hosp_area or hospital.address
    elif current_user.requester_profile:
        hosp_city = hosp_city or current_user.requester_profile.city
        hosp_area = hosp_area or current_user.requester_profile.area

    request = models.BloodRequest(
        hospital_id=payload.hospital_id,
        requested_by_user_id=current_user.id,
        blood_group=payload.blood_group,
        units_required=payload.units_required,
        urgency=payload.urgency,
        latitude=hosp_lat,
        longitude=hosp_lon,
        hospital_name=payload.hospital_name,
        city=hosp_city,
        area=hosp_area,
        required_by=payload.required_by,
        patient_reference=payload.patient_reference,
        notes=payload.notes,
        status=models.RequestStatus.CREATED,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


# ── GET /api/requests ────────────────────────────────────────────────────────
@router.get(
    "",
    response_model=List[BloodRequestOut],
    summary="List blood requests",
)
def list_blood_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    blood_group: Optional[str] = Query(None),
    hospital_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.BloodRequest)

    # Donors see only active requests
    if current_user.role == "DONOR":
        q = q.filter(
            models.BloodRequest.status.in_([
                "CREATED", "MATCHING", "DONOR_NOTIFIED"
            ])
        )
    elif status_filter:
        q = q.filter(models.BloodRequest.status == status_filter)

    if blood_group:
        q = q.filter(models.BloodRequest.blood_group == blood_group)
    if hospital_id:
        q = q.filter(models.BloodRequest.hospital_id == hospital_id)

    return q.order_by(models.BloodRequest.created_at.desc()).offset(skip).limit(limit).all()


# ── GET /api/requests/my ────────────────────────────────────────────────────
@router.get(
    "/my",
    response_model=List[BloodRequestOut],
    summary="List my own blood requests (the ones I created)",
)
def list_my_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.BloodRequest).filter(
        models.BloodRequest.requested_by_user_id == current_user.id
    )
    if status_filter:
        q = q.filter(models.BloodRequest.status == status_filter)

    return q.order_by(models.BloodRequest.created_at.desc()).offset(skip).limit(limit).all()


# ── GET /api/requests/{request_id} ──────────────────────────────────────────
@router.get(
    "/{request_id}",
    response_model=BloodRequestOut,
    summary="Get a single blood request",
)
def get_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    request = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")
    return request


# ── PATCH /api/requests/{request_id}/status ─────────────────────────────────
@router.patch(
    "/{request_id}/status",
    response_model=BloodRequestOut,
    summary="Update request status (HOSPITAL, REQUESTER, ADMIN, or DONOR)",
)
def update_request_status(
    request_id: int,
    payload: BloodRequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    request = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")

    if current_user.role not in ("HOSPITAL", "REQUESTER", "ADMIN", "DONOR"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to update status",
        )

    if current_user.role == "REQUESTER" and request.requested_by_user_id and request.requested_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own requests",
        )

    if current_user.role == "DONOR" and payload.status != models.RequestStatus.DONOR_ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Donors can only accept requests (status: DONOR_ACCEPTED)",
        )

    current_status = request.status.value if hasattr(request.status, "value") else request.status
    new_status = payload.status.value if hasattr(payload.status, "value") else payload.status

    allowed = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot transition from '{current_status}' to '{new_status}'. Allowed: {allowed}",
        )

    request.status = payload.status
    db.commit()
    db.refresh(request)
    return request


# ── POST /api/requests/{request_id}/close ────────────────────────────────────
@router.post(
    "/{request_id}/close",
    response_model=BloodRequestOut,
    summary="Close/fulfill a request (owner of the request or ADMIN)",
    description="Marks a request as COMPLETED once blood has been fulfilled.",
)
def close_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    request = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blood request not found")

    if current_user.role != "ADMIN" and request.requested_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the request creator or ADMIN can close the request",
        )

    terminal_statuses = ("COMPLETED", "CANCELLED")
    current_status = request.status.value if hasattr(request.status, "value") else request.status
    if current_status in terminal_statuses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Request is already '{current_status}' and cannot be closed again",
        )

    request.status = models.RequestStatus.COMPLETED
    db.commit()
    db.refresh(request)
    return request
