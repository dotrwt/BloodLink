"""Tests: Donor profile, availability, and history."""

import pytest
from tests.conftest import (
    create_test_user, create_test_donor, login, auth_headers,
)


def test_create_donor_profile(client, db):
    user = create_test_user(db, "dp@test.com", "Password1", "DONOR")
    token = login(client, "dp@test.com", "Password1")
    resp = client.post("/api/donors", json={
        "name": "Test Donor",
        "blood_group": "O-",
        "age": 25,
        "latitude": 26.22,
        "longitude": 78.18,
        "city": "Gwalior",
    }, headers=auth_headers(token))
    assert resp.status_code == 201
    assert resp.json()["blood_group"] == "O-"
    assert resp.json()["name"] == "Test Donor"


def test_cannot_create_duplicate_donor_profile(client, db):
    user = create_test_user(db, "dup_dp@test.com", "Password1", "DONOR")
    create_test_donor(db, user)
    token = login(client, "dup_dp@test.com", "Password1")
    resp = client.post("/api/donors", json={
        "name": "Duplicate", "blood_group": "A+",
    }, headers=auth_headers(token))
    assert resp.status_code == 409


def test_list_donors(client, db):
    user = create_test_user(db, "ld@test.com", "Password1", "DONOR")
    create_test_donor(db, user)
    token = login(client, "ld@test.com", "Password1")
    resp = client.get("/api/donors", headers=auth_headers(token))
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_get_donor(client, db):
    user = create_test_user(db, "gd@test.com", "Password1", "DONOR")
    donor = create_test_donor(db, user, name="Geeta Das")
    token = login(client, "gd@test.com", "Password1")
    resp = client.get(f"/api/donors/{donor.id}", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["name"] == "Geeta Das"


def test_get_donor_not_found(client, db):
    user = create_test_user(db, "nfd@test.com", "Password1", "DONOR")
    token = login(client, "nfd@test.com", "Password1")
    resp = client.get("/api/donors/99999", headers=auth_headers(token))
    assert resp.status_code in (404, 403)


def test_update_availability(client, db):
    user = create_test_user(db, "av@test.com", "Password1", "DONOR")
    donor = create_test_donor(db, user, available=True)
    token = login(client, "av@test.com", "Password1")

    resp = client.patch(f"/api/donors/{donor.id}/availability",
                        json={"is_available": False},
                        headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["is_available"] == False


def test_donor_history_empty(client, db):
    user = create_test_user(db, "hist@test.com", "Password1", "DONOR")
    donor = create_test_donor(db, user)
    token = login(client, "hist@test.com", "Password1")
    resp = client.get(f"/api/donors/{donor.id}/history", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json() == []


def test_donor_access_denied_for_other_donor(client, db):
    user1 = create_test_user(db, "d1@test.com", "Password1", "DONOR")
    user2 = create_test_user(db, "d2@test.com", "Password1", "DONOR")
    donor2 = create_test_donor(db, user2, name="Private Donor")
    token1 = login(client, "d1@test.com", "Password1")
    # d1 trying to access d2's full profile
    resp = client.get(f"/api/donors/{donor2.id}", headers=auth_headers(token1))
    assert resp.status_code == 403
