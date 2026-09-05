"""
Blood Link — Requesters Router
POST   /api/requesters                 — create requester profile
GET    /api/requesters/me              — get own requester profile
PUT    /api/requesters/me              — update own profile
GET    /api/requesters/{requester_id}  — get requester details (ADMIN)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db, require_role
from app.database import models
from app.schemas.requester import RequesterCreate, RequesterUpdate, RequesterOut

router = APIRouter(prefix="/api/requesters", tags=["Requesters"])


# ── POST /api/requesters ────────────────────────────────────────────────────
@router.post(
    "",
    response_model=RequesterOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create requester profile (REQUESTER role required)",
)
def create_requester_profile(
    payload: RequesterCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("REQUESTER", "ADMIN")),
):
    if current_user.role == "REQUESTER" and current_user.requester_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Requester profile already exists for this account",
        )
    requester = models.Requester(
        user_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(requester)
    db.commit()
    db.refresh(requester)
    return requester


# ── GET /api/requesters/me ──────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=RequesterOut,
    summary="Get the current requester's own profile",
)
def get_my_requester_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("REQUESTER")),
):
    requester = db.query(models.Requester).filter(
        models.Requester.user_id == current_user.id
    ).first()
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester profile not found. Please create your profile first.",
        )
    return requester


# ── PUT /api/requesters/me ──────────────────────────────────────────────────
@router.put(
    "/me",
    response_model=RequesterOut,
    summary="Update own requester profile",
)
def update_my_requester_profile(
    payload: RequesterUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("REQUESTER")),
):
    requester = db.query(models.Requester).filter(
        models.Requester.user_id == current_user.id
    ).first()
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester profile not found.",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(requester, field, value)
    db.commit()
    db.refresh(requester)
    return requester


# ── GET /api/requesters/{requester_id} ──────────────────────────────────────
@router.get(
    "/{requester_id}",
    response_model=RequesterOut,
    summary="Get requester details (owner or ADMIN)",
)
def get_requester(
    requester_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    requester = db.query(models.Requester).filter(
        models.Requester.id == requester_id
    ).first()
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requester not found"
        )
    if current_user.role != "ADMIN" and current_user.id != requester.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )
    return requester
