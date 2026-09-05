"""
Blood Link — Matches Router
GET   /api/matches/{request_id}          — run or retrieve AI-ranked matches
POST  /api/matches/{match_id}/accept     — donor accepts match
POST  /api/matches/{match_id}/reject     — donor rejects match
PATCH /api/matches/{match_id}/eta        — donor updates ETA
GET   /api/matches/donor/me              — get all matches for the current donor
"""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict

from app.core.dependencies import get_current_user, get_db
from app.database import models
from app.schemas.match import MatchOut, MatchActionResponse, MatchETAUpdate
from app.services.matching_service import run_matching, get_ranked_matches
from app.services.notification_service import notify_donor_match, notify_hospital_accepted

router = APIRouter(prefix="/api/matches", tags=["AI Matching"])


def _build_match_out(match: models.Match) -> MatchOut:
    """Map Match ORM → MatchOut schema (including donor fields)."""
    breakdown: Optional[Dict[str, Any]] = None
    if match.score_breakdown:
        try:
            breakdown = json.loads(match.score_breakdown)
        except (json.JSONDecodeError, TypeError):
            breakdown = None

    return MatchOut(
        id=match.id,
        blood_request_id=match.blood_request_id,
        donor_id=match.donor_id,
        donor_name=match.donor.name,
        blood_group=match.donor.blood_group,
        distance_km=match.distance_km,
        match_score=match.match_score,
        is_available=match.donor.is_available,
        is_verified=match.donor.is_verified,
        status=match.status,
        eta_minutes=match.eta_minutes,
        score_breakdown=breakdown,
        created_at=match.created_at,
    )


# ── GET /api/matches/donor/me ────────────────────────────────────────────────
@router.get(
    "/donor/me",
    response_model=List[MatchOut],
    summary="Get all matches for the current donor",
    description="Returns all match records where the authenticated donor has been matched.",
)
def get_my_matches(
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("DONOR", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DONOR accounts can view their matches",
        )

    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor profile not found")

    q = db.query(models.Match).filter(models.Match.donor_id == donor.id)
    if status_filter:
        q = q.filter(models.Match.status == status_filter)

    matches = q.order_by(models.Match.created_at.desc()).all()
    return [_build_match_out(m) for m in matches]


# ── GET /api/matches/{request_id} ────────────────────────────────────────────
@router.get(
    "/{request_id}",
    response_model=List[MatchOut],
    summary="Run AI matching and return ranked donor candidates",
    description=(
        "Triggers the AI-assisted matching engine for the given blood request. "
        "Returns donors ranked by AI-assisted prioritization score (0-100). "
        "⚠️ DISCLAIMER: Scores are for emergency coordination only and are NOT "
        "medically validated. Final transfusion decisions require clinical evaluation."
    ),
)
def get_matches_for_request(
    request_id: int,
    refresh: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("HOSPITAL", "ADMIN", "REQUESTER"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOSPITAL, REQUESTER, or ADMIN accounts can view match results",
        )

    request = (
        db.query(models.BloodRequest)
        .filter(models.BloodRequest.id == request_id)
        .first()
    )
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blood request {request_id} not found",
        )

    # Run matching so newly registered/logged-in donors immediately appear in the candidate list
    matches = run_matching(request, db)
    if not matches:
        matches = get_ranked_matches(request_id, db)

    # Update request status to DONOR_NOTIFIED if it was still CREATED or MATCHING
    if request.status in (models.RequestStatus.CREATED, models.RequestStatus.MATCHING) and matches:
        request.status = models.RequestStatus.DONOR_NOTIFIED
        db.commit()

    return [_build_match_out(m) for m in matches]


# ── POST /api/matches/{match_id}/accept ──────────────────────────────────────
@router.post(
    "/{match_id}/accept",
    response_model=MatchActionResponse,
    summary="Donor accepts a match",
    description="Marks the match as ACCEPTED and updates the blood request status to DONOR_ACCEPTED.",
)
def accept_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("DONOR", "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only DONOR accounts can accept matches")

    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    # Verify ownership
    if current_user.role == "DONOR":
        donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
        if not donor or donor.id != match.donor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This match does not belong to you")

    if match.status not in (models.MatchStatus.PENDING, models.MatchStatus.NOTIFIED):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Match is already '{match.status.value}' and cannot be accepted",
        )

    # Update match
    match.status = models.MatchStatus.ACCEPTED
    match.responded_at = datetime.now(timezone.utc)

    # Update request
    request = match.blood_request
    request.status = models.RequestStatus.DONOR_ACCEPTED

    db.commit()

    # Notify hospital
    try:
        if request.hospital:
            notify_hospital_accepted(db, request.hospital, match.donor, request)
    except Exception:
        pass

    return MatchActionResponse(
        message="Match accepted successfully",
        match_id=match.id,
        new_status=models.MatchStatus.ACCEPTED,
        request_status=models.RequestStatus.DONOR_ACCEPTED.value,
    )


# ── POST /api/matches/{match_id}/reject ──────────────────────────────────────
@router.post(
    "/{match_id}/reject",
    response_model=MatchActionResponse,
    summary="Donor rejects a match",
    description="Marks the match as REJECTED. The request remains open for other donors.",
)
def reject_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("DONOR", "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only DONOR accounts can reject matches")

    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    if current_user.role == "DONOR":
        donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
        if not donor or donor.id != match.donor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This match does not belong to you")

    if match.status in (models.MatchStatus.ACCEPTED,):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Match is already ACCEPTED and cannot be rejected",
        )
    if match.status == models.MatchStatus.REJECTED:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match is already REJECTED")

    match.status = models.MatchStatus.REJECTED
    match.responded_at = datetime.now(timezone.utc)
    db.commit()

    return MatchActionResponse(
        message="Match rejected",
        match_id=match.id,
        new_status=models.MatchStatus.REJECTED,
    )


# ── PATCH /api/matches/{match_id}/eta ────────────────────────────────────────
@router.patch(
    "/{match_id}/eta",
    response_model=MatchActionResponse,
    summary="Donor shares/updates ETA after accepting a match",
)
def update_match_eta(
    match_id: int,
    payload: MatchETAUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ("DONOR", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DONOR accounts can update ETA",
        )

    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    if current_user.role == "DONOR":
        donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.id).first()
        if not donor or donor.id != match.donor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This match does not belong to you",
            )

    if match.status != models.MatchStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="ETA can only be set on ACCEPTED matches",
        )

    match.eta_minutes = payload.eta_minutes

    # Also update request status to EN_ROUTE
    request = match.blood_request
    if request.status == models.RequestStatus.DONOR_ACCEPTED:
        request.status = models.RequestStatus.EN_ROUTE

    db.commit()

    return MatchActionResponse(
        message=f"ETA updated to {payload.eta_minutes} minutes",
        match_id=match.id,
        new_status=match.status,
        request_status=request.status.value if hasattr(request.status, "value") else request.status,
    )
