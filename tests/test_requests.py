"""Tests: Blood requests CRUD and state machine."""

import pytest
from tests.conftest import (
    create_test_user, create_test_hospital, login, auth_headers
)


def _setup_hospital(client, db):
    user = create_test_user(db, "hosp@test.com", "Password1", "HOSPITAL")
    hospital = create_test_hospital(db, user)
    token = login(client, "hosp@test.com", "Password1")
    return user, hospital, token


def test_create_blood_request(client, db):
    user, hospital, token = _setup_hospital(client, db)
    resp = client.post("/api/requests", json={
        "blood_group": "O-",
        "units_required": 2,
        "hospital_id": hospital.id,
        "urgency": "CRITICAL",
        "latitude": 26.22,
        "longitude": 78.18,
    }, headers=auth_headers(token))
    assert resp.status_code == 201
    data = resp.json()
    assert data["blood_group"] == "O-"
    assert data["status"] == "CREATED"
    assert data["units_required"] == 2


def test_create_request_invalid_blood_group(client, db):
    user, hospital, token = _setup_hospital(client, db)
    resp = client.post("/api/requests", json={
        "blood_group": "Z+",
        "units_required": 2,
        "hospital_id": hospital.id,
    }, headers=auth_headers(token))
    assert resp.status_code == 422


def test_create_request_invalid_units(client, db):
    user, hospital, token = _setup_hospital(client, db)
    resp = client.post("/api/requests", json={
        "blood_group": "O-",
        "units_required": 0,
        "hospital_id": hospital.id,
    }, headers=auth_headers(token))
    assert resp.status_code == 422


def test_create_request_hospital_not_found(client, db):
    user = create_test_user(db, "h2@test.com", "Password1", "HOSPITAL")
    token = login(client, "h2@test.com", "Password1")
    resp = client.post("/api/requests", json={
        "blood_group": "A+",
        "units_required": 1,
        "hospital_id": 9999,
    }, headers=auth_headers(token))
    assert resp.status_code == 404


def test_get_blood_request(client, db):
    user, hospital, token = _setup_hospital(client, db)
    create_resp = client.post("/api/requests", json={
        "blood_group": "B+",
        "units_required": 3,
        "hospital_id": hospital.id,
    }, headers=auth_headers(token))
    req_id = create_resp.json()["id"]
    resp = client.get(f"/api/requests/{req_id}", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["id"] == req_id


def test_get_request_not_found(client, db):
    user, hospital, token = _setup_hospital(client, db)
    resp = client.get("/api/requests/99999", headers=auth_headers(token))
    assert resp.status_code == 404


def test_list_blood_requests(client, db):
    user, hospital, token = _setup_hospital(client, db)
    client.post("/api/requests", json={
        "blood_group": "A+", "units_required": 1, "hospital_id": hospital.id,
    }, headers=auth_headers(token))
    resp = client.get("/api/requests", headers=auth_headers(token))
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_update_request_status_valid(client, db):
    user, hospital, token = _setup_hospital(client, db)
    create_resp = client.post("/api/requests", json={
        "blood_group": "O+", "units_required": 1, "hospital_id": hospital.id,
    }, headers=auth_headers(token))
    req_id = create_resp.json()["id"]
    resp = client.patch(f"/api/requests/{req_id}/status",
                        json={"status": "MATCHING"},
                        headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["status"] == "MATCHING"


def test_update_request_status_invalid_transition(client, db):
    user, hospital, token = _setup_hospital(client, db)
    create_resp = client.post("/api/requests", json={
        "blood_group": "O+", "units_required": 1, "hospital_id": hospital.id,
    }, headers=auth_headers(token))
    req_id = create_resp.json()["id"]
    # CREATED → COMPLETED is not a valid direct transition
    resp = client.patch(f"/api/requests/{req_id}/status",
                        json={"status": "COMPLETED"},
                        headers=auth_headers(token))
    assert resp.status_code == 409


def test_request_unauthorized(client, db):
    resp = client.post("/api/requests", json={
        "blood_group": "O-", "units_required": 1, "hospital_id": 1,
    })
    assert resp.status_code == 401
