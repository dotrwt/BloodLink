"""
Blood Link — Notifications Router
GET    /api/notifications                    — list user's notifications
GET    /api/notifications/count              — unread notification count
PATCH  /api/notifications/{id}/read          — mark single as read
POST   /api/notifications/mark-all-read      — mark all as read
DELETE /api/notifications/{id}               — delete a notification
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_current_user, get_db
from app.database import models
from app.schemas.notification import NotificationOut, NotificationCountOut

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


# ── GET /api/notifications ──────────────────────────────────────────────────
@router.get(
    "",
    response_model=List[NotificationOut],
    summary="Get notifications for the authenticated user",
)
def list_notifications(
    unread_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    )
    if unread_only:
        q = q.filter(models.Notification.is_read == False)
    return (
        q.order_by(models.Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ── GET /api/notifications/count ────────────────────────────────────────────
@router.get(
    "/count",
    response_model=NotificationCountOut,
    summary="Get notification count (total and unread)",
)
def get_notification_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .count()
    )
    unread = (
        db.query(models.Notification)
        .filter(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False,
        )
        .count()
    )
    return NotificationCountOut(total=total, unread=unread)


# ── PATCH /api/notifications/{id}/read ──────────────────────────────────────
@router.patch(
    "/{notification_id}/read",
    response_model=NotificationOut,
    summary="Mark a notification as read",
)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notif = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


# ── POST /api/notifications/mark-all-read ───────────────────────────────────
@router.post(
    "/mark-all-read",
    summary="Mark all notifications as read",
)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    updated = (
        db.query(models.Notification)
        .filter(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False,
        )
        .update({"is_read": True})
    )
    db.commit()
    return {"message": f"Marked {updated} notifications as read"}


# ── DELETE /api/notifications/{id} ──────────────────────────────────────────
@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a notification",
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notif = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    db.delete(notif)
    db.commit()
