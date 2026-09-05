"""Blood Link — Match Schemas."""

from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from app.database.models import MatchStatus, BloodGroup


class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    blood_request_id: int
    donor_id: int
    donor_name: str
    blood_group: BloodGroup
    distance_km: Optional[float] = None
    match_score: float
    is_available: bool
    is_verified: bool
    status: MatchStatus
    eta_minutes: Optional[int] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    created_at: datetime


class MatchActionResponse(BaseModel):
    message: str
    match_id: int
    new_status: MatchStatus
    request_status: Optional[str] = None


class MatchETAUpdate(BaseModel):
    """Donor shares their estimated arrival time."""
    eta_minutes: int
