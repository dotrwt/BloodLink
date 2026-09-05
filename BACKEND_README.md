# 🩸 Blood Link — Backend

> **AI-assisted emergency blood response network**
> Hackathon MVP — Python · FastAPI · SQLAlchemy · MySQL

---

## ⚠️ Medical Disclaimer

This is a **hackathon prototype** for emergency coordination only.
AI match scores are for candidate prioritization **only** and are **NOT medically validated**.
All final transfusion and donor eligibility decisions **must** be made by qualified medical professionals.

---

## 📁 Project Structure

```
blood brige backend/
├── app/
│   ├── main.py                  ← FastAPI app + CORS + router registration
│   ├── __init__.py
│   ├── core/
│   │   ├── config.py            ← Pydantic Settings (reads .env)
│   │   ├── security.py          ← bcrypt hashing + JWT
│   │   └── dependencies.py      ← get_current_user, role guards
│   ├── database/
│   │   ├── database.py          ← SQLAlchemy engine + session + init_db
│   │   └── models.py            ← All ORM models (8 tables)
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── donor.py
│   │   ├── hospital.py
│   │   ├── request.py
│   │   ├── match.py
│   │   ├── inventory.py
│   │   └── notification.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── donors.py
│   │   ├── hospitals.py
│   │   ├── requests.py
│   │   ├── matches.py
│   │   ├── inventory.py
│   │   └── notifications.py
│   ├── services/
│   │   ├── matching_service.py  ← AI-assisted matching engine (core)
│   │   ├── compatibility_service.py ← Blood group compatibility table
│   │   ├── distance_service.py  ← Haversine formula
│   │   └── notification_service.py ← In-app notifications + hooks
│   └── utils/
│       └── helpers.py
├── tests/
│   ├── conftest.py              ← SQLite fixtures + factory helpers
│   ├── test_auth.py
│   ├── test_requests.py
│   ├── test_matching.py
│   ├── test_inventory.py
│   └── test_donors.py
├── seed.py                      ← Demo data seed script
├── requirements.txt
├── pyproject.toml
├── .env.example
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.11+
- MySQL 8+ running locally
- Git

### 2. Clone & Setup Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy the example file
copy .env.example .env   # Windows
cp .env.example .env     # Linux/macOS

# Edit .env with your MySQL credentials
```

Your `.env` must contain:

```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost/bloodbridge
JWT_SECRET_KEY=your_super_secret_key_at_least_32_chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG=True
```

### 5. Create MySQL Database

```sql
-- In MySQL client:
CREATE DATABASE bloodbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Run the Application

```bash
uvicorn app.main:app --reload
```

Tables are **auto-created** on first startup via SQLAlchemy `create_all`.

### 7. Open Swagger UI

```
http://127.0.0.1:8000/docs
```

### 8. Seed Demo Data

```bash
python seed.py
```

### 9. Run Tests

```bash
pytest -v
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | MySQL connection string |
| `JWT_SECRET_KEY` | ✅ | — | JWT signing secret (≥32 chars) |
| `JWT_ALGORITHM` | ❌ | `HS256` | JWT algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `60` | Token TTL |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:3000,...` | CORS origins (comma-separated) |
| `DEBUG` | ❌ | `True` | Enable SQL logging |

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| `DONOR` | Create/update own profile, view requests, accept/reject matches, view own history |
| `HOSPITAL` | Create blood requests, view matches, manage inventory |
| `REQUESTER` | Create blood requests |
| `ADMIN` | Full access |

---

## 📡 Complete API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login → JWT token |
| GET | `/api/auth/me` | 🔒 Bearer | Get current user |

**Register request:**
```json
{
  "email": "donor@example.com",
  "password": "SecurePass1",
  "role": "DONOR",
  "phone": "+911234567890"
}
```

**Login response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "role": "DONOR",
  "user_id": 1
}
```

---

### Donors

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/donors` | 🔒 DONOR | Create donor profile |
| GET | `/api/donors` | 🔒 Any | List donors (public info) |
| GET | `/api/donors/{id}` | 🔒 Owner/HOSPITAL/ADMIN | Full donor details |
| PUT | `/api/donors/{id}` | 🔒 Owner/ADMIN | Update profile |
| PATCH | `/api/donors/{id}/availability` | 🔒 Owner/ADMIN | Toggle availability |
| GET | `/api/donors/{id}/history` | 🔒 Owner/ADMIN | Donation history |

---

### Hospitals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/hospitals` | 🔒 HOSPITAL | Create hospital profile |
| GET | `/api/hospitals` | 🔒 Any | List hospitals |
| GET | `/api/hospitals/{id}` | 🔒 Any | Hospital details |
| PUT | `/api/hospitals/{id}` | 🔒 Owner/ADMIN | Update hospital |

---

### Blood Requests

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/requests` | 🔒 HOSPITAL/REQUESTER | Create emergency request |
| GET | `/api/requests` | 🔒 Any | List requests |
| GET | `/api/requests/{id}` | 🔒 Any | Get single request |
| PATCH | `/api/requests/{id}/status` | 🔒 HOSPITAL/ADMIN | Update status |

**Create request:**
```json
{
  "blood_group": "O-",
  "units_required": 2,
  "hospital_id": 1,
  "urgency": "CRITICAL",
  "latitude": 26.2183,
  "longitude": 78.1828,
  "notes": "RTA victim — urgent"
}
```

**Request status lifecycle:**
```
CREATED → MATCHING → DONOR_NOTIFIED → DONOR_ACCEPTED → EN_ROUTE → BLOOD_RECEIVED → COMPLETED
                                                                  ↑ (any) → CANCELLED
```

---

### AI Matching

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/matches/{request_id}` | 🔒 HOSPITAL/ADMIN | Run AI matching + get ranked candidates |
| POST | `/api/matches/{match_id}/accept` | 🔒 DONOR | Accept match |
| POST | `/api/matches/{match_id}/reject` | 🔒 DONOR | Reject match |

**Match response (ranked):**
```json
[
  {
    "id": 5,
    "donor_id": 2,
    "donor_name": "Rahul Sharma",
    "blood_group": "O-",
    "distance_km": 0.41,
    "match_score": 98.35,
    "is_available": true,
    "is_verified": true,
    "status": "NOTIFIED",
    "score_breakdown": {
      "compatibility_component": 40.0,
      "distance_component": 24.79,
      "availability_component": 15.0,
      "verification_component": 10.0,
      "reliability_component": 6.78,
      "urgency_multiplier": 1.1,
      "disclaimer": "AI-assisted prioritization score only. Not medically validated."
    }
  }
]
```

**Scoring weights:**

| Factor | Weight |
|---|---|
| Blood compatibility | 40% |
| Distance (Haversine) | 25% |
| Availability | 15% |
| Verification | 10% |
| Response reliability | 10% |

---

### Inventory

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/inventory` | 🔒 Any | List inventory |
| POST | `/api/inventory` | 🔒 HOSPITAL/ADMIN | Add inventory record |
| PATCH | `/api/inventory/{id}` | 🔒 HOSPITAL/ADMIN | Update units |

---

### Donations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/donations` | 🔒 DONOR/HOSPITAL/ADMIN | Record donation (updates inventory) |
| GET | `/api/donations` | 🔒 DONOR/HOSPITAL/ADMIN | List donations |

---

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | 🔒 Any | Get own notifications |
| PATCH | `/api/notifications/{id}/read` | 🔒 Any | Mark as read |

---

## 🔗 Frontend Integration Guide

The backend is **fully REST-based** and designed for a React frontend.

### Base URL
```
http://localhost:8000
```

### Authentication Flow
1. `POST /api/auth/register` → create account
2. `POST /api/auth/login` → get `access_token`
3. Store token in `localStorage` or React state
4. Add to every request: `Authorization: Bearer <token>`

### CORS
The following origins are allowed by default (configure via `ALLOWED_ORIGINS`):
- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)

### Emergency Workflow (Frontend Steps)
```
1. Login as hospital → GET /api/auth/login
2. Create request   → POST /api/requests
3. Get matches      → GET /api/matches/{request_id}
4. Display ranked donors to hospital
5. Donor logs in   → POST /api/auth/login
6. Donor accepts   → POST /api/matches/{match_id}/accept
7. Hospital updates → PATCH /api/requests/{id}/status {status: "EN_ROUTE"}
8. Record donation  → POST /api/donations
9. Auto-updates inventory + completes request
```

---

## 🧪 Demo Credentials (after `python seed.py`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@bloodbridge.demo | Admin@1234 |
| Hospital | apollo@bloodbridge.demo | Hospital@1234 |
| Donor (O-) | rahul@bloodbridge.demo | Donor@1234 |
| Donor (O+) | priya@bloodbridge.demo | Donor@1234 |
| Donor (A+) | amit@bloodbridge.demo | Donor@1234 |
| Donor (B+) | kavya@bloodbridge.demo | Donor@1234 |

---

## ⚡ Common Commands

```bash
# Start server
uvicorn app.main:app --reload

# Seed demo data
python seed.py

# Run all tests
pytest -v

# Run specific test file
pytest tests/test_matching.py -v

# Run with coverage
pytest --cov=app --cov-report=term-missing
```

---

## 🔮 Known Limitations & Future Improvements

### Current Limitations (MVP)
- No real-time WebSocket notifications
- No SMS/Email/Push (hooks in place, not connected)
- No file uploads (blood test reports, ID verification)
- Scoring is rule-based, not ML-trained
- No rate limiting / API throttling

### Future Improvements
1. **Real-time**: Add WebSockets for live request/match updates
2. **ML Model**: Replace `_compute_score()` with a trained sklearn/XGBoost model
3. **SMS Notifications**: Connect Twilio/Fast2SMS in `notification_service.py`
4. **Maps**: Add optional Google Maps Distance Matrix API
5. **Admin Dashboard**: User verification, hospital licensing, analytics
6. **Docker**: Add `docker-compose.yml` for one-command setup
7. **Rate Limiting**: `slowapi` for production security
8. **Audit Logging**: Persist all state changes with timestamps
9. **Blood Bank Integration**: Connect to national blood bank APIs
10. **Multi-hospital**: Allow donors to respond to requests from any hospital
