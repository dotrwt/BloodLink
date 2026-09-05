# BloodLink — Project Memory

This file stores important decisions and lessons that should survive across development sessions.

---

# 1. Project Identity

Project:

**BloodLink**

Purpose:

A blood-donation and emergency blood-request coordination platform.

---

# 2. Technology

Frontend:

```text
React
TypeScript
Vite
```

Backend:

```text
Python
```

Backend is currently outside the primary implementation scope.

---

# 3. Current Development Scope

### Current focus

**Frontend only.**

Do not spend implementation time building the Python backend unless explicitly requested.

The frontend should nevertheless be architected around a clean backend contract.

---

# 4. Core Product Concept

The central user journey is:

```text
Blood needed
     ↓
Create request
     ↓
Find compatible resources
     ↓
Connect
     ↓
Donate
     ↓
Fulfill request
```

---

# 5. Important Decisions

## Decision 001 — Frontend-first

The initial implementation focuses exclusively on the frontend.

---

## Decision 002 — API separation

API communication must be isolated from UI components so the Python backend can be integrated later.

---

## Decision 003 — Mock data

Mock data can be used to make the frontend functional during development.

Mocks must be isolated and replaceable.

---

## Decision 004 — Design philosophy

The application should communicate:

> Calm urgency.

It should feel trustworthy rather than sensational.

---

# 6. Things To Avoid

Do not allow BloodLink to become:

* A generic admin dashboard
* A template clone
* A collection of cards
* An overly red interface
* An AI-generated-looking UI
* An unnecessarily complicated product

---

# 7. Known Future Concerns

Potential future backend requirements:

* Authentication
* User profiles
* Blood requests
* Donor matching
* Location
* Notifications
* Organization verification
* Request status

These should influence frontend architecture but should not be implemented as fake backend behavior.

---

# 8. Decision Log

New architectural/product decisions should be added here.

Format:

```md
## Decision XXX — Title

Date:

Decision:

Reason:

Impact:
```

---

# 9. Lessons Learned

Add important discoveries here as the project evolves.

Examples:

```text
- A particular component caused unnecessary duplication.
- A specific API response structure works better.
- Map interaction needs a list fallback.
- Mobile request creation requires fewer fields.
```

---

# 10. Permanent Rule

> If a decision is important enough that another developer would need to know it six months from now, record it here.
