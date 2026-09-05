"""Tests: Blood inventory management."""

import pytest
from tests.conftest import (
    create_test_user, create_test_donor, create_test_hospital,
    login, auth_headers,
)
from app.database import models


def _setup(client, db):
    h_user = create_test_user(db, "inv_h@test.com", "Password1", "HOSPITAL")
    hospital = create_test_hospital(db, h_user)
    token = login(client, "inv_h@test.com", "Password1")
    return h_user, hospital, token


def test_create_inventory(client, db):
    _, hospital, token = _setup(client, db)
    resp = client.post("/api/inventory", json={
        "hospital_id": hospital.id,
        "blood_group": "O-",
        "units_available": 10,
    }, headers=auth_headers(token))
    assert resp.status_code == 201
    assert resp.json()["units_available"] == 10


def test_create_inventory_duplicate(client, db):
    _, hospital, token = _setup(client, db)
    client.post("/api/inventory", json={
        "hospital_id": hospital.id, "blood_group": "A+", "units_available": 5,
    }, headers=auth_headers(token))
    resp = client.post("/api/inventory", json={
        "hospital_id": hospital.id, "blood_group": "A+", "units_available": 3,
    }, headers=auth_headers(token))
    assert resp.status_code == 409


def test_update_inventory(client, db):
    _, hospital, token = _setup(client, db)
    create_resp = client.post("/api/inventory", json={
        "hospital_id": hospital.id, "blood_group": "B+", "units_available": 8,
    }, headers=auth_headers(token))
    inv_id = create_resp.json()["id"]
    resp = client.patch(f"/api/inventory/{inv_id}", json={"units_available": 15},
                        headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["units_available"] == 15


def test_list_inventory(client, db):
    _, hospital, token = _setup(client, db)
    client.post("/api/inventory", json={
        "hospital_id": hospital.id, "blood_group": "AB+", "units_available": 3,
    }, headers=auth_headers(token))
    resp = client.get(f"/api/inventory?hospital_id={hospital.id}", headers=auth_headers(token))
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_inventory_negative_units_rejected(client, db):
    _, hospital, token = _setup(client, db)
    resp = client.post("/api/inventory", json={
        "hospital_id": hospital.id, "blood_group": "O+", "units_available": -1,
    }, headers=auth_headers(token))
    assert resp.status_code == 422


def test_record_donation_updates_inventory(client, db):
    h_user, hospital, h_token = _setup(client, db)

    # Create donor
    d_user = create_test_user(db, "don_d@test.com", "Password1", "DONOR")
    donor = create_test_donor(db, d_user, blood_group="O-")
    d_token = login(client, "don_d@test.com", "Password1")

    # Create blood request
    req_resp = client.post("/api/requests", json={
        "blood_group": "O-", "units_required": 2,
        "hospital_id": hospital.id, "urgency": "CRITICAL",
    }, headers=auth_headers(h_token))
    req_id = req_resp.json()["id"]

    # Trigger matching and get match
    client.get(f"/api/matches/{req_id}", headers=auth_headers(h_token))
    matches = client.get(f"/api/matches/{req_id}", headers=auth_headers(h_token)).json()
    assert len(matches) > 0
    match_id = matches[0]["id"]

    # Donor accepts
    client.post(f"/api/matches/{match_id}/accept", headers=auth_headers(d_token))

    # Record donation (as donor)
    don_resp = client.post("/api/donations", json={
        "blood_request_id": req_id,
        "match_id": match_id,
        "units_donated": 2,
    }, headers=auth_headers(d_token))
    assert don_resp.status_code == 201
    assert don_resp.json()["units_donated"] == 2

    # Inventory should have increased
    inv_resp = client.get(f"/api/inventory?hospital_id={hospital.id}&blood_group=O-",
                          headers=auth_headers(h_token))
    assert inv_resp.status_code == 200
    total = sum(i["units_available"] for i in inv_resp.json())
    assert total >= 2
