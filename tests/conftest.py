"""
Blood Link — Pytest Configuration & Shared Fixtures

Uses an in-memory SQLite database so no MySQL is required for testing.
"""

import os

# Set test environment variables BEFORE importing app modules
# (Settings() is instantiated at import time from app.core.config)
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("JWT_SECRET_KEY", "test_secret_key_for_pytest_at_least_32_characters_long")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("DEBUG", "False")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.database import Base, get_db
from app.core.security import hash_password
from app.database import models

# ── In-memory SQLite test database ───────────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///./test.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client():
    return TestClient(app)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


# ── Helper factories ──────────────────────────────────────────────────────────
def create_test_user(db, email, password, role, phone=None):
    user = models.User(
        email=email,
        phone=phone,
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_donor(db, user, name="Test Donor", blood_group="O-",
                       lat=26.22, lon=78.18, city="Gwalior", available=True):
    donor = models.Donor(
        user_id=user.id,
        name=name,
        blood_group=blood_group,
        is_available=available,
        is_verified=True,
        latitude=lat,
        longitude=lon,
        city=city,
        total_donations=3,
    )
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor


def create_test_hospital(db, user, name="Test Hospital", lat=26.22, lon=78.18):
    hospital = models.Hospital(
        user_id=user.id,
        name=name,
        is_verified=True,
        latitude=lat,
        longitude=lon,
        city="Gwalior",
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


def login(client, email, password):
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}
