"""Blood Link — Dashboard Stats Schemas."""

from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class DonorDashboardStats(BaseModel):
    """Summary stats for the donor dashboard."""
    donor_id: int
    name: str
    blood_group: str
    is_available: bool
    is_eligible: bool
    total_donations: int
    last_donation_date: Optional[datetime] = None
    next_eligible_date: Optional[datetime] = None
    pending_requests_count: int  # nearby emergency requests they can respond to
    active_matches_count: int    # matches they've been notified about


class RequesterDashboardStats(BaseModel):
    """Summary stats for the requester dashboard."""
    requester_id: int
    name: str
    total_requests: int
    active_requests: int
    fulfilled_requests: int
    cancelled_requests: int


class BloodBankDashboardStats(BaseModel):
    """Summary stats for the blood bank dashboard."""
    hospital_id: int
    name: str
    total_blood_groups_stocked: int
    total_units_available: int
    total_units_reserved: int
    low_stock_count: int        # blood groups below threshold
    expiring_soon_count: int    # units expiring within 7 days
    incoming_requests_count: int
    inventory_summary: List[Dict[str, object]]  # [{blood_group, units, reserved}]
