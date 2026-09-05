# BloodLink — Product Requirements Document

> Product requirements for the BloodLink web application.
>
> Frontend: React + TypeScript
> Backend: Python (planned / external)
> Current development scope: Frontend only

---

## 1. Product Overview

### Product Name

**BloodLink**

### Product Vision

BloodLink is a digital blood-donation and emergency coordination platform designed to reduce the time required to connect patients, hospitals, blood banks, and eligible donors.

The core idea is simple:

> **When blood is needed, find the right donor faster.**

The application should transform a traditionally fragmented process into a single, clear, trustworthy interface.

---

## 2. Problem

During emergency blood requirements, people commonly depend on:

* WhatsApp groups
* Social media posts
* Personal contacts
* Hospital networks
* Blood bank phone calls
* Informal donor databases

This creates several problems:

1. Finding a compatible donor takes time.
2. Donor information may be outdated.
3. There is no unified emergency request flow.
4. People cannot easily determine which requests are nearby.
5. Hospitals, blood banks, and donors operate in disconnected systems.
6. Emergency situations require information to be understood immediately.

BloodLink aims to reduce this friction.

---

## 3. Target Users

### 3.1 Donors

People willing to donate blood.

Primary needs:

* Discover nearby requests.
* Maintain blood-group information.
* Manage availability.
* View donation history.
* Respond to requests.
* Receive urgent notifications.

---

### 3.2 Patients / Requesters

People requesting blood for themselves or someone else.

Primary needs:

* Create a blood request quickly.
* Specify blood group and required units.
* Specify hospital/location.
* Indicate urgency.
* Find compatible nearby donors.
* Track responses.

---

### 3.3 Hospitals / Blood Banks

Organizations coordinating blood requirements.

Primary needs:

* Create verified requests.
* Manage active requirements.
* View donor responses.
* Update request status.
* Maintain organization information.

---

### 3.4 Administrators

System operators responsible for maintaining platform integrity.

Primary needs:

* Manage users.
* Verify organizations.
* Monitor requests.
* Handle reports.
* Manage platform-level data.

---

# 4. Core Product Principles

BloodLink must prioritize:

### Speed

Emergency information should be accessible immediately.

### Clarity

Users should never wonder:

> "What am I supposed to do next?"

### Trust

Medical/emergency information must feel reliable and legitimate.

### Location Awareness

Nearby donors and requests are central to the product.

### Accessibility

Important information must remain understandable under stress.

### Minimal Friction

Creating or responding to a request should require as few steps as reasonably possible.

---

# 5. Core Features

## 5.1 Authentication

Users should be able to:

* Sign up
* Log in
* Log out
* Recover account
* Manage profile

Authentication UI should be implemented independently from backend authentication logic.

The frontend should consume authentication APIs once the backend is available.

---

## 5.2 User Profile

Profile information may include:

* Name
* Profile image
* Blood group
* Location
* Contact preferences
* Donor availability
* Last donation date
* Donation count
* Verification status

Sensitive information should not be exposed unnecessarily.

---

# 6. Blood Request System

The blood request system is the core product feature.

A requester should be able to create a request containing:

* Blood group
* Number of units
* Hospital
* Location
* Required date/time
* Urgency
* Patient information where appropriate
* Additional notes
* Contact preference

---

## 6.1 Request Priority

Requests may have different urgency levels.

Example:

```text
CRITICAL
URGENT
NORMAL
```

Critical requests should have stronger visual hierarchy.

However:

> Do not rely exclusively on color to communicate urgency.

---

## 6.2 Request Status

Possible states:

```text
OPEN
PARTIALLY_FULFILLED
FULFILLED
EXPIRED
CANCELLED
```

The UI must visually distinguish these states.

---

# 7. Donor Discovery

Users should be able to discover compatible donors based on:

* Blood group
* Location
* Availability
* Verification
* Donation eligibility
* Distance

The frontend should support:

### List View

Display donor/request cards.

### Map View

Display relevant locations geographically.

### Filters

Potential filters:

* Blood group
* Distance
* Availability
* Verification
* Urgency

---

# 8. Emergency Dashboard

The dashboard should immediately communicate:

* Active emergency requests
* Nearby requests
* Compatible requests
* Current donation status
* Important notifications

Example information hierarchy:

```text
Good morning, Harsh

Your blood group
B+

────────────────────

URGENT NEAR YOU
2 active requests

[ Request Card ]

────────────────────

YOUR ACTIVITY
Last donation
42 days ago

────────────────────

NEARBY
12 donors
```

The actual UI should evolve through the design phase.

---

# 9. Request Details

A request details screen should provide:

* Blood group
* Units required
* Urgency
* Hospital
* Approximate location
* Time requirement
* Request status
* Verification status
* Donor response count
* Primary action

Primary CTA examples:

```text
I CAN DONATE
CONTACT REQUESTER
VIEW DIRECTIONS
```

Actions must depend on user role and request state.

---

# 10. Notifications

Notifications may include:

* Nearby emergency requests
* Donation response
* Request updates
* Verification updates
* Account notifications

Notifications should have:

```text
Unread
Read
Actionable
Informational
Critical
```

---

# 11. Map Experience

The map should support:

* Current location
* Blood requests
* Donor locations where appropriate
* Hospitals
* Blood banks
* Filtering
* Request selection
* Navigation into request details

Exact map provider will be determined during implementation.

The map must not become the only way to access information.

---

# 12. Search

Global/search functionality may support:

* Hospitals
* Blood banks
* Requests
* Users/donors where permitted
* Locations

Search should provide useful empty, loading, and error states.

---

# 13. UI States

Every major feature must account for:

```text
Default
Loading
Empty
Error
Success
Disabled
Unauthorized
Offline / unavailable
```

Never design only the happy path.

---

# 14. Responsive Requirements

The application must work across:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Mobile should be treated as a first-class experience, not merely a compressed desktop layout.

---

# 15. Accessibility

The frontend should target strong accessibility practices:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible labels
* Sufficient contrast
* Reduced-motion support
* Screen-reader-friendly controls
* No information communicated by color alone

---

# 16. MVP Scope

The first usable frontend should prioritize:

1. Landing page
2. Authentication
3. User onboarding
4. Dashboard
5. Create blood request
6. Request discovery
7. Request details
8. Donor profile
9. Notifications
10. Responsive navigation

Advanced features should not block the MVP.

---

# 17. Future Features

Potential future capabilities:

* AI-assisted request interpretation
* Smart donor matching
* Emergency broadcast
* Hospital verification
* Blood-bank inventory integration
* Predictive demand analysis
* Donation reminders
* Gamification
* Donation certificates
* Community organizations
* Advanced analytics
* Real-time request updates

These are NOT part of the initial frontend implementation unless explicitly promoted into a phase.

---

# 18. Success Criteria

The application should make the following journey extremely clear:

```text
Need blood
     ↓
Create request
     ↓
Find compatible donors
     ↓
Connect
     ↓
Donation
     ↓
Request fulfilled
```

A user should be able to understand the product within seconds.

---

# 19. Non-Goals

The frontend must not:

* Invent medical eligibility rules.
* Provide medical diagnosis.
* Make unsupported medical claims.
* Expose unnecessary donor information.
* Pretend backend functionality exists.
* Hardcode production user data.
* Implement fake "real-time" functionality without clearly treating it as mock/demo behavior.

---

# 20. Product North Star

Every product decision should answer:

> **Does this make it faster, safer, or clearer for the right person to connect with the right blood resource?**

If not, question whether the feature belongs in the core experience.
