"""
Blood Link — FastAPI Dependencies
Provides reusable dependency functions injected into route handlers.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.database import get_db
from app.database import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_optional_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ── Current user ─────────────────────────────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """Extract the authenticated user from the JWT bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    return user


def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_optional_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    """Optionally extract the authenticated user from the JWT bearer token, or return None."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload or not payload.get("sub"):
            return None
        user = db.query(models.User).filter(models.User.id == int(payload.get("sub"))).first()
        return user if (user and user.is_active) else None
    except Exception:
        return None


# ── Role guards ──────────────────────────────────────────────────────────────
def require_role(*roles: str):
    """Factory: return a dependency that enforces one of the given roles."""

    def _guard(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(roles)}",
            )
        return current_user

    return _guard


# ── Convenient role shorthands ───────────────────────────────────────────────
def require_admin(current_user: models.User = Depends(require_role("ADMIN"))) -> models.User:
    return current_user


def require_hospital(
    current_user: models.User = Depends(require_role("HOSPITAL", "ADMIN"))
) -> models.User:
    return current_user


def require_donor(
    current_user: models.User = Depends(require_role("DONOR", "ADMIN"))
) -> models.User:
    return current_user
