"""
Blood Link — Geographic Distance Service

Uses the Haversine formula to compute great-circle distance between two
coordinates. No paid Maps API is required for the MVP.
"""

import math
from typing import Optional

EARTH_RADIUS_KM = 6371.0


def calculate_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """
    Calculate the great-circle distance between two points on Earth.

    Args:
        lat1, lon1: Latitude and longitude of point 1 (degrees).
        lat2, lon2: Latitude and longitude of point 2 (degrees).

    Returns:
        Distance in kilometres (float).
    """
    # Convert to radians
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(EARTH_RADIUS_KM * c, 3)


def distance_score(distance_km: float, max_km: float = 50.0) -> float:
    """
    Convert a distance to a 0-1 score for use in match ranking.

    Donors within 5 km score ~1.0; score decays linearly to 0 at max_km.

    Args:
        distance_km: Distance from donor to hospital.
        max_km:      Distance at which score reaches 0 (default 50 km).

    Returns:
        Float in [0.0, 1.0].
    """
    if distance_km <= 0:
        return 1.0
    score = 1.0 - (distance_km / max_km)
    return max(0.0, min(1.0, score))


def safe_distance(
    lat1: Optional[float],
    lon1: Optional[float],
    lat2: Optional[float],
    lon2: Optional[float],
) -> Optional[float]:
    """
    Like calculate_distance but returns None if any coordinate is missing.
    """
    if None in (lat1, lon1, lat2, lon2):
        return None
    return calculate_distance(lat1, lon1, lat2, lon2)
