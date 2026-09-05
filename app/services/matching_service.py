"""
Blood Link — AI-Assisted Matching Engine

DISCLAIMER:
The match score is an AI-assisted prioritization score used for
emergency candidate ranking only. It does NOT constitute a medical
opinion, clinically validate donor eligibility, or make transfusion
decisions. All final eligibility and clinical decisions must be made
by qualified medical professionals.

Architecture note:
    The scoring logic is isolated in _compute_score() so that a real
    trained ML model can replace or augment it in future iterations.
"""

import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session

from app.database import models
from app.services.compatibility_service import (
    get_compatible_donor_groups,
    compatibility_score,
)
from app.services.distance_service import safe_distance, distance_score

logger = logging.getLogger(__name__)

# ── Scoring weights (must sum to 1.0) ────────────────────────────────────────
WEIGHTS = {
    "compatibility": 0.40,  # Blood-group compatibility
    "distance":      0.25,  # Proximity to hospital
    "availability":  0.15,  # Donor marked available
    "verification":  0.10,  # Donor profile verified
    "reliability":   0.10,  # Historical response rate
}

# Minimum donation interval for eligibility (standard 90 days for whole blood)
MIN_DONATION_INTERVAL_DAYS = 90
MAX_DISTANCE_KM = 50.0       # Beyond this, distance score → 0
TOP_N_CANDIDATES = 20        # Number of ranked candidates to return/store


# ── Internal helpers ──────────────────────────────────────────────────────────

def _normalize_dt(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _availability_score(donor: models.Donor) -> float:
    """1.0 if available, 0.0 otherwise."""
    return 1.0 if donor.is_available else 0.0


def _verification_score(donor: models.Donor) -> float:
    """1.0 if fully verified, 0.5 if account verified, 0.0 if neither."""
    if donor.is_verified and donor.user.is_verified:
        return 1.0
    if donor.user.is_verified:
        return 0.5
    return 0.0


def _reliability_score(donor: models.Donor) -> float:
    """
    Estimate reliability from donation history.

    - Each completed donation contributes to the score, capped at 1.0.
    - Donors who have never donated start at 0.5 (neutral prior).
    - Donor was recently active → slight boost.
    """
    if donor.total_donations == 0:
        return 0.5  # no history → neutral prior

    # Use log scale so very prolific donors don't dominate
    import math
    base = min(1.0, math.log1p(donor.total_donations) / math.log1p(10))

    # Recency boost: last donation within 1 year
    if donor.last_donation_date:
        last_dt = _normalize_dt(donor.last_donation_date)
        days_since = (
            datetime.now(timezone.utc) - last_dt
        ).days
        if days_since <= 365:
            base = min(1.0, base + 0.1)

    return round(base, 4)


def _is_eligible(donor: models.Donor) -> bool:
    """
    Basic eligibility check: donor must be available and not have donated
    too recently. Does NOT replace clinical evaluation.
    """
    if not donor.is_available:
        return False
    if donor.last_donation_date:
        last_dt = _normalize_dt(donor.last_donation_date)
        days_since = (datetime.now(timezone.utc) - last_dt).days
        if days_since < MIN_DONATION_INTERVAL_DAYS:
            return False
    return True


def _compute_score(
    donor: models.Donor,
    request: models.BloodRequest,
    distance_km: Optional[float],
) -> tuple[float, dict]:
    """
    Compute the AI-assisted prioritization score for a donor/request pair.

    Returns:
        (score_0_to_100, breakdown_dict)
    """
    compat = compatibility_score(
        donor.blood_group.value if hasattr(donor.blood_group, "value") else donor.blood_group,
        request.blood_group.value if hasattr(request.blood_group, "value") else request.blood_group,
    )

    dist_score = (
        distance_score(distance_km, MAX_DISTANCE_KM)
        if distance_km is not None
        else 0.5  # unknown distance → neutral
    )

    avail  = _availability_score(donor)
    verif  = _verification_score(donor)
    relia  = _reliability_score(donor)

    # Urgency multiplier — boosts all scores for CRITICAL requests
    urgency_mult = {
        "CRITICAL": 1.10,
        "URGENT":   1.05,
        "ROUTINE":  1.00,
    }.get(
        request.urgency.value if hasattr(request.urgency, "value") else request.urgency,
        1.00,
    )

    raw = (
        WEIGHTS["compatibility"] * compat
        + WEIGHTS["distance"]      * dist_score
        + WEIGHTS["availability"]  * avail
        + WEIGHTS["verification"]  * verif
        + WEIGHTS["reliability"]   * relia
    )

    score = min(100.0, round(raw * urgency_mult * 100, 2))

    breakdown = {
        "compatibility_component": round(WEIGHTS["compatibility"] * compat * 100, 2),
        "distance_component":      round(WEIGHTS["distance"] * dist_score * 100, 2),
        "availability_component":  round(WEIGHTS["availability"] * avail * 100, 2),
        "verification_component":  round(WEIGHTS["verification"] * verif * 100, 2),
        "reliability_component":   round(WEIGHTS["reliability"] * relia * 100, 2),
        "urgency_multiplier":       urgency_mult,
        "distance_km":             distance_km,
        "weights_used":            WEIGHTS,
        "disclaimer": (
            "AI-assisted prioritization score only. "
            "Not medically validated. Final decisions require clinical evaluation."
        ),
    }
    return score, breakdown


# ── Public API ────────────────────────────────────────────────────────────────

def run_matching(request: models.BloodRequest, db: Session) -> List[models.Match]:
    """
    Execute the full matching pipeline for a blood request.

    Steps:
        1. Determine compatible donor blood groups.
        2. Filter available, verified-enough donors.
        3. Calculate distance to the hospital.
        4. Score each candidate.
        5. Rank candidates (highest score first).
        6. Persist Match records in DB (upsert-style).
        7. Return the top N Match objects.

    Args:
        request: The BloodRequest ORM object.
        db:      Active database session.

    Returns:
        List of Match ORM objects (ranked, best first).
    """
    logger.info("Running matching for request_id=%s blood_group=%s", request.id, request.blood_group)

    # Step 1 — compatible blood groups
    compatible_groups = get_compatible_donor_groups(
        request.blood_group.value if hasattr(request.blood_group, "value") else request.blood_group
    )

    # Step 2 — candidate donors
    candidates: List[models.Donor] = (
        db.query(models.Donor)
        .join(models.User, models.Donor.user_id == models.User.id)
        .filter(
            models.Donor.blood_group.in_(compatible_groups),
            models.Donor.is_available == True,
            models.User.is_active == True,
        )
        .all()
    )

    logger.info("Found %d candidate donors for request_id=%s", len(candidates), request.id)

    if not candidates:
        return []

    # Hospital coordinates
    hosp_lat = request.latitude or (request.hospital.latitude if request.hospital else None)
    hosp_lon = request.longitude or (request.hospital.longitude if request.hospital else None)

    # Step 3-5 — score and rank
    scored = []
    for donor in candidates:
        dist = safe_distance(donor.latitude, donor.longitude, hosp_lat, hosp_lon)
        score, breakdown = _compute_score(donor, request, dist)
        scored.append((donor, dist, score, breakdown))

    scored.sort(key=lambda x: x[2], reverse=True)
    top = scored[:TOP_N_CANDIDATES]

    # Step 6 — persist / update Match records
    match_objects = []
    for donor, dist, score, breakdown in top:
        # Check if match already exists
        existing = (
            db.query(models.Match)
            .filter(
                models.Match.blood_request_id == request.id,
                models.Match.donor_id == donor.id,
            )
            .first()
        )
        if existing:
            # Update score but don't overwrite ACCEPTED/REJECTED statuses
            if existing.status == models.MatchStatus.PENDING:
                existing.match_score = score
                existing.distance_km = dist
                existing.score_breakdown = json.dumps(breakdown)
            match_objects.append(existing)
        else:
            match = models.Match(
                blood_request_id=request.id,
                donor_id=donor.id,
                match_score=score,
                distance_km=dist,
                status=models.MatchStatus.PENDING,
                score_breakdown=json.dumps(breakdown),
            )
            db.add(match)
            match_objects.append(match)

    db.commit()

    # Refresh to get IDs
    for m in match_objects:
        db.refresh(m)

    logger.info(
        "Matching complete for request_id=%s — %d candidates stored",
        request.id, len(match_objects),
    )
    return match_objects


def get_ranked_matches(request_id: int, db: Session) -> List[models.Match]:
    """
    Retrieve existing Match records for a request, ranked by score.

    Used after run_matching() has already been called.
    """
    return (
        db.query(models.Match)
        .filter(models.Match.blood_request_id == request_id)
        .order_by(models.Match.match_score.desc())
        .all()
    )
