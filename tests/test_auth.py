"""Tests: Authentication endpoints."""

import pytest
from tests.conftest import create_test_user, login, auth_headers


def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "email": "newuser@test.com",
        "password": "Password1",
        "full_name": "New User",
        "role": "DONOR",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "DONOR"
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "email": "dup@test.com", "password": "Password1",
        "full_name": "Dup User", "role": "DONOR",
    })
    resp = client.post("/api/auth/register", json={
        "email": "dup@test.com", "password": "Password1",
        "full_name": "Dup User", "role": "DONOR",
    })
    assert resp.status_code == 409


def test_register_weak_password(client):
    resp = client.post("/api/auth/register", json={
        "email": "weak@test.com", "password": "123",
        "full_name": "Weak User", "role": "DONOR",
    })
    assert resp.status_code == 422


def test_login_success(client, db):
    create_test_user(db, "login@test.com", "Password1", "DONOR")
    resp = client.post("/api/auth/login", json={
        "email": "login@test.com", "password": "Password1"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "DONOR"


def test_login_wrong_password(client, db):
    create_test_user(db, "wrong@test.com", "Password1", "DONOR")
    resp = client.post("/api/auth/login", json={
        "email": "wrong@test.com", "password": "WrongPass1"
    })
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/auth/login", json={
        "email": "ghost@test.com", "password": "Password1"
    })
    assert resp.status_code == 401


def test_get_me(client, db):
    create_test_user(db, "me@test.com", "Password1", "DONOR")
    token = login(client, "me@test.com", "Password1")
    resp = client.get("/api/auth/me", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@test.com"


def test_protected_endpoint_no_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_protected_endpoint_invalid_token(client):
    resp = client.get("/api/auth/me", headers={"Authorization": "Bearer not_a_real_token"})
    assert resp.status_code == 401
