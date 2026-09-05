"""Tests: AI Matching engine — compatibility, distance, scoring, ranking."""

import pytest
from tests.conftest import (
    create_test_user, create_test_donor, create_test_hospital, login, auth_headers,
)
from app.services.compatibility_service import (
    get_compatible_donor_groups, is_compatible, compatibility_score,
)
from app.services.distance_service import calculate_distance, distance_score
from app.services.matching_service import run_matching, _compute_score
from app.database import models


# ── Compatibility tests ───────────────────────────────────────────────────────
class TestCompatibility:
    def test_o_neg_is_universal_donor(self):
        for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]:
            assert is_compatible("O-", bg), f"O- should be compatible with {bg}"

    def test_ab_pos_is_universal_recipient(self):
        for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]:
            assert is_compatible(bg, "AB+"), f"{bg} should be compatible with AB+"

    def test_incompatible_pair(self):
        assert not is_compatible("A+", "B+")
        assert not is_compatible("B+", "A+")
        assert not is_compatible("AB+", "O-")

    def test_exact_match_score(self):
        assert compatibility_score("O-", "O-") == 1.0

    def test_compatible_non_exact_score(self):
        score = compatibility_score("O-", "A+")
        assert score == 0.9  # compatible but not exact

    def test_incompatible_score(self):
        assert compatibility_score("A+", "B+") == 0.0

    def test_invalid_blood_group(self):
        with pytest.raises(ValueError):
            get_compatible_donor_groups("Z+")

    def test_compatible_groups_for_o_neg(self):
        groups = get_compatible_donor_groups("O-")
        assert groups == ["O-"]

    def test_compatible_groups_for_a_pos(self):
        groups = get_compatible_donor_groups("A+")
        assert "A+" in groups and "O-" in groups and "A-" in groups and "O+" in groups


# ── Distance tests ───────────────────────────────────────────────────────────
class TestDistance:
    def test_same_location(self):
        d = calculate_distance(26.22, 78.18, 26.22, 78.18)
        assert d == 0.0

    def test_known_distance(self):
        # Gwalior to Agra ≈ 120 km
        d = calculate_distance(26.22, 78.18, 27.18, 78.01)
        assert 100 < d < 150, f"Expected ~120 km, got {d}"

    def test_distance_is_symmetric(self):
        d1 = calculate_distance(26.22, 78.18, 26.50, 78.50)
        d2 = calculate_distance(26.50, 78.50, 26.22, 78.18)
        assert abs(d1 - d2) < 0.001

    def test_distance_score_zero_km(self):
        assert distance_score(0.0) == 1.0

    def test_distance_score_max_km(self):
        assert distance_score(50.0) == 0.0

    def test_distance_score_midpoint(self):
        score = distance_score(25.0, max_km=50.0)
        assert abs(score - 0.5) < 0.01

    def test_distance_score_beyond_max(self):
        assert distance_score(100.0, max_km=50.0) == 0.0


# ── Match scoring & ranking tests ─────────────────────────────────────────────
class TestMatchScoring:
    def test_run_matching_returns_ranked_list(self, db):
        # Create hospital
        h_user = create_test_user(db, "mh@test.com", "Password1", "HOSPITAL")
        hospital = create_test_hospital(db, h_user, lat=26.22, lon=78.18)

        # Create blood request
        request = models.BloodRequest(
            hospital_id=hospital.id,
            requested_by_user_id=h_user.id,
            blood_group="O-",
            units_required=2,
            urgency="CRITICAL",
            status="CREATED",
            latitude=26.22,
            longitude=78.18,
        )
        db.add(request)
        db.commit()
        db.refresh(request)

        # Create 3 compatible donors
        for i in range(3):
            d_user = create_test_user(db, f"d{i}@test.com", "Password1", "DONOR")
            create_test_donor(
                db, d_user,
                name=f"Donor {i}",
                blood_group="O-",
                lat=26.22 + i * 0.01,
                lon=78.18,
                available=True,
            )

        matches = run_matching(request, db)
        assert len(matches) == 3
        # Verify descending score order
        scores = [m.match_score for m in matches]
        assert scores == sorted(scores, reverse=True)

    def test_run_matching_filters_incompatible(self, db):
        h_user = create_test_user(db, "mh2@test.com", "Password1", "HOSPITAL")
        hospital = create_test_hospital(db, h_user)

        request = models.BloodRequest(
            hospital_id=hospital.id,
            requested_by_user_id=h_user.id,
            blood_group="O-",
            units_required=1,
            urgency="URGENT",
            status="CREATED",
        )
        db.add(request)
        db.commit()
        db.refresh(request)

        # Create an incompatible donor (A+ cannot donate to O-)
        d_user = create_test_user(db, "incompat@test.com", "Password1", "DONOR")
        create_test_donor(db, d_user, blood_group="A+", available=True)

        matches = run_matching(request, db)
        assert matches == []

    def test_run_matching_excludes_unavailable_donors(self, db):
        h_user = create_test_user(db, "mh3@test.com", "Password1", "HOSPITAL")
        hospital = create_test_hospital(db, h_user)

        request = models.BloodRequest(
            hospital_id=hospital.id,
            requested_by_user_id=h_user.id,
            blood_group="O-",
            units_required=1,
            urgency="URGENT",
            status="CREATED",
        )
        db.add(request)
        db.commit()
        db.refresh(request)

        d_user = create_test_user(db, "unavail@test.com", "Password1", "DONOR")
        create_test_donor(db, d_user, blood_group="O-", available=False)

        matches = run_matching(request, db)
        assert matches == []

    def test_score_range(self, db):
        h_user = create_test_user(db, "score@test.com", "Password1", "HOSPITAL")
        hospital = create_test_hospital(db, h_user, lat=26.22, lon=78.18)

        request = models.BloodRequest(
            hospital_id=hospital.id,
            requested_by_user_id=h_user.id,
            blood_group="O-",
            units_required=1,
            urgency="CRITICAL",
            status="CREATED",
            latitude=26.22,
            longitude=78.18,
        )
        db.add(request)
        db.commit()
        db.refresh(request)

        d_user = create_test_user(db, "scorer@test.com", "Password1", "DONOR")
        donor = create_test_donor(db, d_user, blood_group="O-", lat=26.22, lon=78.18)

        score, breakdown = _compute_score(donor, request, 0.0)
        assert 0 <= score <= 100
        assert "compatibility_component" in breakdown
        assert "distance_component" in breakdown
        assert "disclaimer" in breakdown


# ── Accept / Reject via API ─────────────────────────────────────────────────
class TestMatchActions:
    def _setup(self, client, db):
        # Hospital
        h_user = create_test_user(db, "ah@test.com", "Password1", "HOSPITAL")
        hospital = create_test_hospital(db, h_user)
        h_token = login(client, "ah@test.com", "Password1")

        # Donor
        d_user = create_test_user(db, "ad@test.com", "Password1", "DONOR")
        donor = create_test_donor(db, d_user, blood_group="O-")
        d_token = login(client, "ad@test.com", "Password1")

        # Create request
        req_resp = client.post("/api/requests", json={
            "blood_group": "O-",
            "units_required": 1,
            "hospital_id": hospital.id,
            "urgency": "CRITICAL",
        }, headers=auth_headers(h_token))
        req_id = req_resp.json()["id"]

        # Trigger matching
        client.get(f"/api/matches/{req_id}", headers=auth_headers(h_token))

        return d_token, h_token, req_id, donor

    def test_donor_accept_match(self, client, db):
        d_token, h_token, req_id, donor = self._setup(client, db)
        # Get match id
        matches = client.get(f"/api/matches/{req_id}", headers=auth_headers(h_token)).json()
        assert len(matches) > 0
        match_id = matches[0]["id"]

        resp = client.post(f"/api/matches/{match_id}/accept", headers=auth_headers(d_token))
        assert resp.status_code == 200
        assert resp.json()["new_status"] == "ACCEPTED"

    def test_donor_reject_match(self, client, db):
        d_token, h_token, req_id, donor = self._setup(client, db)
        matches = client.get(f"/api/matches/{req_id}", headers=auth_headers(h_token)).json()
        match_id = matches[0]["id"]

        resp = client.post(f"/api/matches/{match_id}/reject", headers=auth_headers(d_token))
        assert resp.status_code == 200
        assert resp.json()["new_status"] == "REJECTED"

    def test_cannot_accept_already_rejected_match(self, client, db):
        d_token, h_token, req_id, donor = self._setup(client, db)
        matches = client.get(f"/api/matches/{req_id}", headers=auth_headers(h_token)).json()
        match_id = matches[0]["id"]

        client.post(f"/api/matches/{match_id}/reject", headers=auth_headers(d_token))
        # Now try to accept — should fail
        resp = client.post(f"/api/matches/{match_id}/accept", headers=auth_headers(d_token))
        assert resp.status_code in (409, 403, 400)
