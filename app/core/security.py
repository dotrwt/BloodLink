"""
Blood Link — Security Utilities
Handles password hashing and JWT token operations.

Uses bcrypt directly (v5.x API) instead of passlib, which is incompatible
with bcrypt >= 4.1 on Python 3.13+.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


# ── Password hashing ─────────────────────────────────────────────────────────
def hash_password(plain_password: str) -> str:
    """Return bcrypt hash of the plain-text password."""
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


# ── JWT ──────────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload dict (must include 'sub' — the user identifier).
        expires_delta: Optional custom TTL; defaults to config value.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT token.

    Returns:
        The payload dict, or None if the token is invalid / expired.
    """
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
