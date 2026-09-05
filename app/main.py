"""
Blood Link — FastAPI Application Entry Point

Run with:
    uvicorn app.main:app --reload
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import init_db
from app.routers import (
    auth, donors, requesters, hospitals,
    requests, matches, inventory, notifications, dashboard,
)

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("bloodlink")


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🩸 Blood Link backend starting up…")
    init_db()
    logger.info("✅ Database tables verified / created")
    yield
    logger.info("🛑 Blood Link backend shutting down")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## Blood Link — Emergency Blood Response Network

An AI-assisted backend that connects donors, requesters, and blood banks
to coordinate emergency blood supply in real time.

### Roles
- **DONOR** — Register, set availability, accept/reject blood requests, track donation history
- **REQUESTER** — Create emergency blood requests, track request status, view matching donors/banks
- **HOSPITAL / BLOOD BANK** — Manage blood inventory, accept/reject donation requests, track stock

### Key Features
- **JWT Authentication** with role-based access control (DONOR, HOSPITAL, REQUESTER, ADMIN)
- **Combined Signup** — role-specific signup endpoints that create user + profile in one call
- **Emergency Blood Requests** with status lifecycle management
- **AI-Assisted Matching Engine** — transparent weighted scoring (blood compatibility, distance, availability, verification, reliability)
- **Geographic Distance** via Haversine formula (no paid Maps API required)
- **Blood Inventory Management** with low-stock alerts and expiry tracking
- **In-App Notification System** with pluggable SMS/Email/Push hooks
- **Dashboard Stats** — per-role summary endpoints for frontend dashboards
- **Donor Eligibility** — automatic next-eligible-date calculation (90-day interval)

### ⚠️ Medical Disclaimer
This is a hackathon prototype for emergency coordination only.
Match scores are AI-assisted prioritization estimates and are **NOT medically validated**.
All final transfusion and eligibility decisions must be made by qualified medical professionals.

### Authentication
Use `POST /api/auth/login` to get a JWT token, then click **Authorize** and enter:
`Bearer <your_token>`
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(donors.router)
app.include_router(requesters.router)
app.include_router(hospitals.router)
app.include_router(requests.router)
app.include_router(matches.router)
app.include_router(inventory.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)


import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health check")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/api/info", tags=["System"], summary="API Info")
def api_info():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "disclaimer": (
            "This API is a hackathon prototype for emergency coordination. "
            "Not a medical device. All clinical decisions require qualified medical professionals."
        ),
    }


# ── Frontend static files ─────────────────────────────────────────────────────
dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "BloodLink", "MediCare", "dist")
assets_path = os.path.join(dist_path, "assets")

if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

index_file = os.path.join(dist_path, "index.html")

@app.get("/", tags=["Frontend"], summary="Application Entry Point")
def root():
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "disclaimer": (
            "This API is a hackathon prototype for emergency coordination. "
            "Not a medical device. All clinical decisions require qualified medical professionals."
        ),
    }

