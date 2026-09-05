"""Blood Link — Notification Schemas."""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.database.models import NotificationChannel, NotificationStatus


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    channel: NotificationChannel
    status: NotificationStatus
    is_read: bool
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    created_at: datetime


class NotificationCountOut(BaseModel):
    """Unread notification count for badge display."""
    total: int
    unread: int
