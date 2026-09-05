# 🩸 BloodLink — Emergency Blood Response Network

> **AI-assisted platform connecting patients, voluntary donors, and blood banks during the critical golden hour.**  
> *Built with React 19, TypeScript, Tailwind CSS, Leaflet, Python FastAPI, SQLAlchemy, and MySQL/SQLite.*

---

## 📌 Table of Contents

- [Vision & Philosophy](#-vision--philosophy)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [Interactive Homepage Tools](#1-interactive-homepage-tools)
  - [Emergency Requester Portal](#2-emergency-requester-portal)
  - [Voluntary Donor Experience](#3-voluntary-donor-experience)
  - [Hospital & Blood Bank Portal](#4-hospital--blood-bank-portal)
  - [AI Matching Engine](#5-ai-matching-engine)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Option A: One-Click Launcher (Recommended)](#option-a-one-click-launcher-recommended)
  - [Option B: Manual Setup](#option-b-manual-setup)
- [Database Configuration](#-database-configuration)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Medical Disclaimer](#-medical-disclaimer)

---

## 🎯 Vision & Philosophy

During critical medical emergencies, families and doctors often scramble across WhatsApp groups, social media posts, and hospital phone calls to locate compatible blood units. This fragmented process wastes precious minutes of the **golden hour**.

**BloodLink** eliminates this friction by unifying patients, eligible donors, and blood bank inventories into a single real-time coordination network:

* **Calm Urgency Design**: High-contrast, clean medical aesthetics (Deep Teal `#0d6b63`, Warm Linen `#fbfaf7`, Crimson accents) designed to keep users focused and calm during stressful moments.
* **Instant Action**: Zero-friction emergency request creation without mandatory multi-step account hurdles.
* **Transparent AI**: Match recommendations are explainable, displaying exact compatibility factors, distance, and donor status.

---

## 🏛 System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)               │
│  - Landing & Availability Checker                     │
│  - Interactive Compatibility Lab                       │
│  - Live Leaflet GPS Tracking Map                       │
│  - Role Portals: Requester, Donor, Hospital            │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST / JSON
                           ▼ (Proxied via Vite dev server)
┌────────────────────────────────────────────────────────┐
│               Backend (FastAPI + Python)               │
│  - JWT Authentication & RBAC Guard                     │
│  - AI-Assisted Matching Engine (Haversine + Weights)  │
│  - Blood Inventory & Unit Allocation Service           │
│  - In-App & Push Notification Handlers                │
└──────────────────────────┬─────────────────────────────┘
                           │ SQLAlchemy ORM
                           ▼
┌────────────────────────────────────────────────────────┐
│               Database Layer (Dual Support)            │
│  - SQLite: Zero-setup plug-and-play local dev          │
│  - MySQL 8.0: High-performance production backend      │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. Interactive Homepage Tools
- **Live Availability Checker**: Search by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-) and city to get instant local stock previews.
- **Compatibility Lab**: Interactive biological compatibility matrix showing who can donate to or receive blood from any selected group (highlighting O- universal donor and AB+ universal recipient rules).
- **Emergency Journey Guide**: Transparent 4-step visual workflow (*Request Created → AI Geo-Matching → Donor Dispatched → Real-Time Tracking*).

### 2. Emergency Requester Portal
- **Rapid Request Creation**: Simple emergency request flow specifying blood group, units required, urgency (CRITICAL, URGENT, NORMAL), hospital address, and emergency contact.
- **Live Leaflet Tracking**: Real-time GPS map tracking donors or dispatched hospital units en route, complete with live coordinates, contact options, and status timeline.

### 3. Voluntary Donor Experience
- **Availability Toggle**: One-tap switch to turn on/off emergency alerts so donors are only notified when ready.
- **Eligibility Engine**: Tracks last donation date and enforces safe donation intervals.
- **Incoming Emergency Cards**: Real-time cards showing patient distance, hospital, and urgency level with instant **Accept** or **Decline** actions and ETA submission.

### 4. Hospital & Blood Bank Portal
- **Stock Matrix**: Real-time inventory grid monitoring all 8 blood groups with unit counts, batch numbers, and expiry alerts.
- **Unit Allocation**: One-click unit reservation and dispatch to matched requests.
- **Emergency Broadcasts**: Send regional emergency shortage notifications to compatible donors.

### 5. AI Matching Engine
The matching engine ranks compatible donors using transparent, weighted criteria:
$$\text{Score} = w_{\text{compat}} \cdot S_{\text{compat}} + w_{\text{dist}} \cdot S_{\text{dist}} + w_{\text{avail}} \cdot S_{\text{avail}} + w_{\text{verif}} \cdot S_{\text{verif}} + w_{\text{rel}} \cdot S_{\text{rel}}$$
- **Medical Compatibility ($S_{\text{compat}}$)**: Strict biological exclusion (incompatible blood groups receive score 0).
- **Geographic Distance ($S_{\text{dist}}$)**: Calculates radial distance in kilometers using the Haversine formula.
- **Availability & Verification ($S_{\text{avail}}, S_{\text{verif}}$)**: Prioritizes active, verified donors.

---

## 💻 Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | High-performance, type-safe single-page application |
| **Styling** | Tailwind CSS v4 | Modern, atomic design with custom medical tokens |
| **Maps & GPS** | Leaflet + React-Leaflet | Open-source interactive maps for live transit tracking |
| **Icons** | Lucide React | Clean, consistent UI iconography |
| **Bundler & Tooling** | Vite 8 + ESLint | Sub-second HMR and optimized production bundling |
| **Backend Framework** | FastAPI (Python 3.10+) | High-speed asynchronous REST API with auto-docs |
| **ORM & Database** | SQLAlchemy 2.0 | Type-safe database queries with dual SQLite/MySQL support |
| **Security & Auth** | Passlib (Bcrypt) + Jose (JWT) | Secure password hashing and token-based RBAC |
| **Data & Scoring** | NumPy, Pandas, Scikit-learn | Data processing and match scoring models |
| **Testing** | Pytest + Asyncio | Automated backend test coverage (56 test cases) |

---

## 📂 Directory Structure

```text
MediCare/
├── app/                         # FastAPI Backend Application
│   ├── main.py                  # API entry point, CORS, lifespan & router setup
│   ├── core/
│   │   ├── config.py            # Pydantic environment settings (.env)
│   │   ├── security.py          # Bcrypt password hashing & JWT generation
│   │   └── dependencies.py      # Auth dependency & Role-Based Access Guards
│   ├── database/
│   │   ├── database.py          # SQLAlchemy engine, session & init_db
│   │   └── models.py            # 8 relational ORM models (Users, Donors, Requests, etc.)
│   ├── routers/                 # Modular API endpoints
│   │   ├── auth.py              # Login, register & current user endpoints
│   │   ├── donors.py            # Donor profile & availability management
│   │   ├── hospitals.py         # Hospital registry & details
│   │   ├── requests.py          # Emergency request lifecycle & status
│   │   ├── matches.py           # AI match scoring & accept/reject actions
│   │   ├── inventory.py         # Blood bank batch inventory & unit tracking
│   │   ├── dashboard.py         # Aggregated stats & overview metrics
│   │   └── notifications.py     # In-app alert logs & notifications
│   ├── schemas/                 # Pydantic validation schemas
│   └── services/                # Business logic (matching, distance, compatibility)
├── Database/
│   └── schema.sql               # MySQL DDL schema and initial tables
├── MediCare/                    # React 19 Frontend Web Application
│   ├── src/
│   │   ├── components/          # Reusable UI widgets, navigation, modals & maps
│   │   ├── pages/               # Page views (Landing, Portals, Tracking, Auth)
│   │   ├── services/            # API client (Axios/Fetch) & state handlers
│   │   ├── types/               # TypeScript interfaces and domain types
│   │   └── App.tsx              # Routing and app shell
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.ts           # Vite config with API proxy to port 8000
├── tests/                       # Backend Automated Pytest Suite (56 tests)
├── seed.py                      # Database demo data seeder script
├── requirements.txt             # Python backend dependencies
├── start-dev.bat                # Windows 1-click batch launcher
├── start-dev.ps1                # PowerShell 1-click script launcher
├── .env.example                 # Environment template
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: Python 3.10+ (available via `py` or `python`)
- **Node.js**: Node.js 18+ and `npm`

---

### Option A: One-Click Launcher (Recommended)

Simply double-click:
```text
start-dev.bat
```
*(Or in PowerShell: `.\start-dev.ps1`)*

This will automatically launch the FastAPI backend on `http://127.0.0.1:8000`, the Vite frontend on `http://localhost:5173`, and open your default browser.

---

### Option B: Manual Setup

#### 1. Setup Backend
Open a terminal in the project root:
```powershell
# Create and activate virtual environment
py -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python packages
pip install -r requirements.txt

# Create your .env file
Copy-Item .env.example .env

# Seed the database with demo accounts & emergency requests
python seed.py

# Start backend server
uvicorn app.main:app --reload --port 8000
```
> Interactive API Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Setup Frontend
Open a second terminal in `MediCare/`:
```powershell
cd MediCare

# Install packages
npm install

# Start Vite development server
npm run dev
```
> Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🗄 Database Configuration

BloodLink supports both **SQLite** and **MySQL**:

### SQLite (Default for Instant Development)
No database server installation or credentials required:
```env
DATABASE_URL=sqlite:///./bloodlink.db
```

### MySQL 8.0 (Production Setup)
1. Ensure your local MySQL server is running (e.g. `MySQL80` service).
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS bloodbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Update `.env`:
   ```env
   DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/bloodbridge
   ```

---

## 🔑 Demo Credentials

After running `python seed.py`, the following demo accounts are available:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@bloodbridge.demo` | `Admin@1234` | Full administrative oversight |
| **Hospital** | `apollo@bloodbridge.demo` | `Hospital@1234` | Manage blood inventory, fulfill requests |
| **Donor 1 (O-)** | `rahul@bloodbridge.demo` | `Donor@1234` | Universal donor, emergency matching |
| **Donor 2 (A+)** | `priya@bloodbridge.demo` | `Donor@1234` | Active donor profile |
| **Donor 3 (B+)** | `amit@bloodbridge.demo` | `Donor@1234` | Active donor profile |

---

## 📡 API Reference

Interactive API documentation with live execution is available at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Primary Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (Donor, Hospital, Requester) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive Bearer JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role |
| `GET` | `/api/requests` | Authenticated | List all active blood requests |
| `POST` | `/api/requests` | Hospital / Requester | Create new emergency blood request |
| `GET` | `/api/requests/{id}` | Authenticated | Fetch specific blood request details |
| `GET` | `/api/matches/{request_id}` | Hospital / Requester | Run AI matching engine and return ranked donors |
| `POST` | `/api/matches/{id}/accept` | Donor | Donor accepts blood match and submits ETA |
| `POST` | `/api/matches/{id}/reject` | Donor | Donor declines match (auto-triggers next match) |
| `GET` | `/api/inventory` | Hospital | View hospital blood stock by group and batch |
| `POST` | `/api/inventory` | Hospital | Add new blood units to inventory |
| `GET` | `/api/donors` | Authenticated | Search active and verified donors by location |

---

## 🧪 Testing & Quality Assurance

### Backend Automated Test Suite
Run the 56 automated tests verifying auth, matching algorithms, distance calculations, and models:
```powershell
.\venv\Scripts\pytest.exe -v
```

### Frontend Typecheck & Build
Validate TypeScript types and build the client application:
```powershell
cd MediCare
npm run build
```

---

## ⚠️ Medical Disclaimer

*BloodLink is a demonstration prototype designed for emergency coordination and triage prioritization. AI match rankings and availability signals are for coordination assistance only and are **not medically certified**. All final compatibility testing, cross-matching, and transfusion approvals must be conducted by qualified medical staff in accredited clinical facilities.*

---

## 📄 License
MIT License. Built for emergency response coordination.
