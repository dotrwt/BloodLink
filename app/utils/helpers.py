"""
Blood Link — General Utilities
"""

from datetime import datetime, timezone
from typing import Any, Dict


def utc_now() -> datetime:
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def success_response(data: Any = None, message: str = "Success") -> Dict:
    """Standardised success envelope."""
    return {"success": True, "message": message, "data": data}


def error_response(message: str, detail: Any = None) -> Dict:
    """Standardised error envelope (used outside HTTPException contexts)."""
    return {"success": False, "message": message, "detail": detail}


def paginate(query, page: int = 1, page_size: int = 20):
    """
    Apply limit/offset pagination to a SQLAlchemy query.

    Returns:
        (items, total_count)
    """
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total
