"""
Blood Link — Blood Compatibility Service

IMPORTANT DISCLAIMER:
This module provides PRELIMINARY compatibility filtering for candidate
prioritization only. Final medical eligibility and transfusion decisions
MUST be verified by qualified medical professionals.

This is NOT a medical device and does NOT certify clinical suitability.
"""

from typing import List, Dict

# ---------------------------------------------------------------------------
# Standard ABO/Rh compatibility table
# Key   = recipient blood group
# Value = list of blood groups that can donate TO the recipient
# ---------------------------------------------------------------------------
COMPATIBILITY_TABLE: Dict[str, List[str]] = {
    "A+":  ["A+", "A-", "O+", "O-"],
    "A-":  ["A-", "O-"],
    "B+":  ["B+", "B-", "O+", "O-"],
    "B-":  ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],  # universal recipient
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+":  ["O+", "O-"],
    "O-":  ["O-"],  # universal donor (red cells)
}

# Reverse map: donor → list of blood groups they can donate to
DONOR_CAN_DONATE_TO: Dict[str, List[str]] = {}
for _recipient, _donors in COMPATIBILITY_TABLE.items():
    for _donor in _donors:
        DONOR_CAN_DONATE_TO.setdefault(_donor, []).append(_recipient)


def get_compatible_donor_groups(recipient_blood_group: str) -> List[str]:
    """
    Return the list of donor blood groups compatible with the given recipient.

    Args:
        recipient_blood_group: Blood group of the recipient (e.g. "O-").

    Returns:
        List of compatible donor blood groups.

    Raises:
        ValueError: If the blood group is unrecognised.
    """
    if recipient_blood_group not in COMPATIBILITY_TABLE:
        raise ValueError(
            f"Unrecognised blood group '{recipient_blood_group}'. "
            f"Valid values: {list(COMPATIBILITY_TABLE.keys())}"
        )
    return COMPATIBILITY_TABLE[recipient_blood_group]


def is_compatible(donor_blood_group: str, recipient_blood_group: str) -> bool:
    """
    Return True if donor_blood_group can donate to recipient_blood_group.

    DISCLAIMER: Preliminary check only. Subject to medical verification.
    """
    compatible = get_compatible_donor_groups(recipient_blood_group)
    return donor_blood_group in compatible


def compatibility_score(donor_blood_group: str, recipient_blood_group: str) -> float:
    """
    Return a compatibility fraction (0.0 or 1.0) for use in match scoring.

    A donor that is an EXACT match scores higher in practical triage;
    a universal donor scores slightly lower to favour exact matches.
    This is a simplistic heuristic — adjust as needed.

    Returns:
        1.0  — exact ABO/Rh match
        0.9  — compatible but not exact (e.g. O- donor for A+ recipient)
        0.0  — incompatible
    """
    if not is_compatible(donor_blood_group, recipient_blood_group):
        return 0.0
    if donor_blood_group == recipient_blood_group:
        return 1.0
    return 0.9
