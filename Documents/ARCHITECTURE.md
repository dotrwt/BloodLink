# BloodLink — Frontend Architecture

## 1. Architecture Overview

BloodLink will use:

```text
React
   +
TypeScript
   +
Vite
   +
Component-based UI
   +
API-driven architecture
   +
Python Backend (future)
```

The frontend must be designed so that backend implementation can be integrated later without restructuring the entire application.

---

# 2. Frontend Architecture

```text
Browser
   │
   ▼
React Application
   │
   ├── Pages
   ├── Components
   ├── Features
   ├── State
   ├── Services
   ├── Types
   └── Utilities
   │
   ▼
API Layer
   │
   ▼
Python Backend
   │
   ├── Authentication
   ├── Business Logic
   ├── Database
   ├── Matching
   └── Notifications
```

---

# 3. Recommended Folder Structure

```text
src/
│
├── assets/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── cards/
│   ├── forms/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── requests/
│   ├── donors/
│   ├── hospitals/
│   ├── notifications/
│   ├── map/
│   └── profile/
│
├── pages/
│
├── layouts/
│
├── hooks/
│
├── services/
│   ├── api/
│   ├── auth/
│   └── storage/
│
├── types/
│
├── utils/
│
├── constants/
│
├── config/
│
├── routes/
│
├── styles/
│
├── App.tsx
└── main.tsx
```

---

# 4. Component Architecture

Components should follow:

```text
Page
 ↓
Feature
 ↓
Section
 ↓
Component
 ↓
Primitive
```

Example:

```text
DashboardPage
 ├── DashboardHeader
 ├── EmergencyRequests
 │    └── BloodRequestCard
 │         ├── BloodGroupBadge
 │         ├── UrgencyIndicator
 │         └── ActionButton
 └── NearbySection
```

---

# 5. Component Rules

Components should:

* Have one clear responsibility.
* Be reusable where repetition exists.
* Avoid unnecessary abstraction.
* Avoid massive components.
* Avoid business logic inside presentational components.
* Receive data through props where appropriate.

Avoid:

```tsx
Dashboard.tsx
```

containing the entire dashboard implementation.

Prefer:

```text
Dashboard
 ├── Header
 ├── Stats
 ├── Requests
 ├── Activity
 └── Nearby
```

---

# 6. State Management

Use the simplest state mechanism appropriate for the problem.

### Local state

Use React state for:

* Modal visibility
* Form state
* Tabs
* Temporary UI state
* Local filters

### Global state

Use global state only when multiple distant parts of the application genuinely require shared state.

Potential global state:

* Authenticated user
* Session
* Application preferences
* Global notifications

Do not introduce a state-management library solely because it is popular.

---

# 7. API Layer

Frontend API requests must be isolated.

Example:

```text
services/
└── api/
    ├── client.ts
    ├── auth.ts
    ├── requests.ts
    ├── donors.ts
    └── notifications.ts
```

Components should not directly construct API URLs.

Bad:

```tsx
fetch("http://localhost:8000/api/requests")
```

inside a component.

Preferred:

```tsx
requestService.getRequests()
```

---

# 8. Backend Contract

The frontend should assume a REST-style Python backend.

Potential structure:

```text
/api
 ├── /auth
 ├── /users
 ├── /requests
 ├── /donors
 ├── /hospitals
 ├── /notifications
 └── /locations
```

Exact endpoints are not finalized until backend integration.

---

# 9. Types

Types should be centralized or feature-owned logically.

Example:

```ts
interface BloodRequest {
  id: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency: Urgency;
  status: RequestStatus;
  hospital: Hospital;
  createdAt: string;
}
```

Use strict TypeScript.

Avoid:

```ts
any
```

unless there is a documented reason.

---

# 10. Routing

Routes should reflect product structure.

Example:

```text
/
 /login
 /register
 /onboarding

 /dashboard
 /requests
 /requests/:id
 /requests/create

 /donors
 /donors/:id

 /notifications
 /profile
 /settings

 /hospital
 /admin
```

Protected routes must require authentication.

Role-specific routes must enforce role-based access at the UI layer while treating the backend as the final authority.

---

# 11. Data Flow

Preferred:

```text
User Action
    ↓
Component
    ↓
Feature Hook
    ↓
Service
    ↓
API
    ↓
Backend
    ↓
Response
    ↓
State
    ↓
UI
```

Avoid direct API manipulation from deeply nested components.

---

# 12. Mock Data

During frontend development, mock data may be used.

Mock data must be clearly isolated:

```text
src/
└── mocks/
    ├── users.ts
    ├── requests.ts
    └── hospitals.ts
```

Mock data must never silently become production data.

---

# 13. Environment Variables

Environment-specific values must not be hardcoded.

Example:

```text
VITE_API_URL
VITE_MAP_API_KEY
```

Never commit secrets.

---

# 14. Performance

Prioritize:

* Code splitting
* Lazy loading
* Optimized images
* Avoiding unnecessary renders
* Efficient lists
* Minimal bundle size
* Proper caching

Performance optimization should be evidence-driven rather than premature.

---

# 15. Error Handling

API failures must produce useful UI.

Example:

```text
Request failed
We couldn't load nearby blood requests.

[Try again]
```

Never leave users staring at a blank screen.

---

# 16. Architecture Principle

The architecture should make it easy to replace:

```text
Mock API
     ↓
Python API
```

without rewriting:

```text
UI
Components
Pages
User flows
```

This is a core architectural requirement.
