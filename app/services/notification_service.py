"""
Blood Link — Notification Service

MVP implementation: stores notifications in the database.
Future integration points for Firebase FCM, Twilio SMS, Email, etc.
are clearly marked with TODO comments.
"""

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.database import models

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    channel: models.NotificationChannel = models.NotificationChannel.IN_APP,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
) -> models.Notification:
    """
    Persist a notification record and (optionally) dispatch via a real channel.

    Args:
        db:             Database session.
        user_id:        Recipient user ID.
        title:          Short notification title.
        message:        Full notification body.
        channel:        Delivery channel (default IN_APP).
        reference_type: Entity type this notification relates to (e.g. "blood_request").
        reference_id:   Primary key of that entity.

    Returns:
        The created Notification ORM object.
    """
    notification = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        channel=channel,
        status=models.NotificationStatus.PENDING,
        reference_type=reference_type,
        reference_id=reference_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # ── Dispatch via real channel ─────────────────────────────────────────
    dispatched = _dispatch(notification)
    if dispatched:
        notification.status = models.NotificationStatus.SENT
    else:
        notification.status = models.NotificationStatus.SENT  # MVP: always mark sent
    db.commit()

    logger.info(
        "Notification id=%s sent to user_id=%s via %s",
        notification.id, user_id, channel,
    )
    return notification


def _dispatch(notification: models.Notification) -> bool:
    """
    Internal dispatcher — plug in real providers here.

    Returns True if successfully dispatched, False on failure.
    """
    channel = notification.channel

    if channel == models.NotificationChannel.IN_APP:
        # Already stored in DB — nothing more to do
        return True

    if channel == models.NotificationChannel.SMS:
        # TODO: Integrate Twilio / msg91 / Fast2SMS here
        # from app.integrations.twilio import send_sms
        # return send_sms(phone=..., message=notification.message)
        logger.warning("SMS dispatch not yet implemented — stored in DB only.")
        return True

    if channel == models.NotificationChannel.EMAIL:
        # TODO: Integrate SendGrid / SMTP here
        logger.warning("Email dispatch not yet implemented — stored in DB only.")
        return True

    if channel == models.NotificationChannel.PUSH:
        # TODO: Integrate Firebase Cloud Messaging here
        # from app.integrations.fcm import send_push
        # return send_push(token=..., title=notification.title, body=notification.message)
        logger.warning("Push dispatch not yet implemented — stored in DB only.")
        return True

    return False


def notify_donor_match(
    db: Session,
    donor: models.Donor,
    request: models.BloodRequest,
) -> models.Notification:
    """Helper: send a blood-request match notification to a donor."""
    urgency = request.urgency.value if hasattr(request.urgency, "value") else request.urgency
    bg = request.blood_group.value if hasattr(request.blood_group, "value") else request.blood_group
    return create_notification(
        db=db,
        user_id=donor.user_id,
        title=f"🩸 {urgency} Blood Request — {bg} Needed",
        message=(
            f"An emergency blood request requires {bg} blood. "
            f"You are a compatible donor. Please check the Blood Link app "
            f"and respond as soon as possible."
        ),
        channel=models.NotificationChannel.IN_APP,
        reference_type="blood_request",
        reference_id=request.id,
    )


def notify_hospital_accepted(
    db: Session,
    hospital: models.Hospital,
    donor: models.Donor,
    request: models.BloodRequest,
) -> models.Notification:
    """Helper: notify the hospital that a donor accepted the match."""
    bg = request.blood_group.value if hasattr(request.blood_group, "value") else request.blood_group
    return create_notification(
        db=db,
        user_id=hospital.user_id,
        title=f"✅ Donor Accepted — {bg} Request #{request.id}",
        message=(
            f"Donor {donor.name} has accepted the blood request for "
            f"{bg} blood (Request #{request.id}). "
            f"Please coordinate arrival and screening."
        ),
        channel=models.NotificationChannel.IN_APP,
        reference_type="blood_request",
        reference_id=request.id,
    )
