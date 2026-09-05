# BloodLink — UI Build Plan

## Context
The repo is a clean, empty Figma Make scaffold (React 19 + Vite 8 + Tailwind v4, no router, no icons, no components — `src/App.tsx` renders an empty div). BloodLink is an emergency blood-donation and matching platform for three roles (Donor, Requester, Blood Bank). This first build delivers a **cohesive design system + public landing + the flagship Requester flow end-to-end**, with the other two roles present as navigable but lighter dashboards so the app reads as one product, not three mini-apps. All data is mock/local (UI prototype, no backend).

Scope confirmed with user:
- **Breadth:** Landing + design system + one flagship flow.
- **Flagship:** Requester (create request → ranked matching → live tracking → fulfilled).

## Aesthetic stance
"Clinical precision meets human warmth." The brief's explicit tone (professional, trustworthy, calm, human; clear urgency when it matters) overrides the theme tool's playful suggestions.
- **Fonts** (Google Fonts via `@import` at top of `src/index.css`): **Hanken Grotesk** (headings/UI — humanist, trustworthy, non-default), **Inter** (body/dense text), **JetBrains Mono** (data: blood groups, unit counts, ETA, distance, timestamps).
- **Palette:** warm near-white ground, ink foreground, calm **deep teal primary** (care/health, deliberately NOT red). Reserved semantic colors: **emergency red** (urgency ONLY — never decorative), **amber** (low-stock/expiry warnings), **green** (success/confirmed). Hairline borders, generous whitespace, cards on white.
- **Urgency is never color alone** — always color + icon + label (Critical / Urgent / Routine).

## Dependencies to add
- `react-router-dom` (client-side routing across screens)
- `lucide-react` (icon set)

## Design tokens & fonts — `src/index.css`
Per AGENTS.md, theme lives in `src/index.css` (not a separate theme.css). Keep `@import 'tailwindcss'` and full-height rules. Add:
- Google Font `@import`s **first** (before `@import 'tailwindcss'` is not allowed — Tailwind import must follow; put font imports at very top, then tailwind import).
- `@theme` block mapping tokens → Tailwind utilities: `--color-background`, `--color-foreground`, `--color-card`, `--color-primary`/`-foreground`, `--color-muted`/`-foreground`, `--color-border`, `--color-ring`, semantic `--color-critical`, `--color-urgent`, `--color-success` (+ foreground/soft tints), `--font-sans`, `--font-display`, `--font-mono`, `--radius`.
- Base layer: body font, selection color, hidden-until-scroll scrollbars, focus-visible ring.

## File structure
- `src/main.tsx` — wrap `<App/>` in `<BrowserRouter>`.
- `src/App.tsx` — route table (see Routes).
- `src/lib/`
  - `cn.ts` — className merge helper.
  - `types.ts` — Role, Urgency, BloodGroup, Request, Donor, BloodBank, MatchCandidate, RequestStatus.
  - `blood.ts` — compatibility utility (donor↔recipient ABO/Rh matrix) + helpers reused by the compatibility explainer and match ranking.
  - `mock.ts` — realistic seed data (hospitals, donors, banks, requests, notifications). Real names/numbers/dates, no lorem.
- `src/components/ui/` (the design system — build once, reuse everywhere):
  - `Button.tsx` (variants: primary, secondary, ghost, danger; sizes), `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Field.tsx` (label + hint + error), `Avatar.tsx`, `Spinner.tsx`, `EmptyState.tsx`, `Skeleton.tsx`.
  - Domain primitives: `UrgencyBadge.tsx` (color+icon+label), `BloodGroupChip.tsx` (mono), `StatusStepper.tsx` (step-based tracking), `CompatibilityBadge.tsx`.
- `src/components/layout/`
  - `AppShell.tsx` — authenticated shell: desktop left sidebar + top bar; **mobile bottom tab bar**. Nav items vary by role.
  - `PublicNav.tsx` / `Footer.tsx` — landing chrome.
- `src/components/domain/`
  - `CompatibilityExplainer.tsx` — visual ABO/Rh compatibility (matrix/diagram, not just text).
  - `MatchCandidateCard.tsx` — donor & blood-bank result cards with distance, ETA, compatibility, eligibility.
  - `RankingRationale.tsx` — shows WHY a candidate ranks where it does (compatibility, distance, eligibility, urgency-fit factor chips/score bars).
- `src/pages/`
  - Shared: `Landing.tsx`, `Login.tsx`, `RoleSelect.tsx`, `Notifications.tsx`, `Profile.tsx`.
  - `requester/`: `Dashboard.tsx`, `CreateRequest.tsx`, `MatchingResults.tsx`, `TrackRequest.tsx`, `Fulfilled.tsx`, `RequestHistory.tsx`.
  - `donor/Dashboard.tsx`, `bloodbank/Dashboard.tsx` — lighter but real (nav targets so product feels whole).

## Routes (`src/App.tsx`)
- `/` Landing · `/login` · `/select-role`
- `/app/requester` Dashboard · `/app/requester/new` Create · `/app/requester/matches/:id` Matching · `/app/requester/track/:id` Track · `/app/requester/fulfilled/:id` · `/app/requester/history`
- `/app/donor`, `/app/bank` dashboards · `/app/notifications` · `/app/profile`
- Requester screens wrapped in `AppShell` (role="requester").

## Flagship flow behavior (Requester)
1. **Create request** — form: blood group, units, hospital/location, urgency level, required-by time. Live compatibility preview + validation states.
2. **Matching results** — ranked list of compatible donors + blood banks; each card shows compatibility, distance, ETA, eligibility; sort/filter; `RankingRationale` explains ordering. Includes **loading (skeletons)** and **empty (no matches)** states.
3. **Track request** — `StatusStepper`: contacted → accepted → en route → confirmed, with a simulated advance (setInterval/button) to demo live progression.
4. **Fulfilled** — success confirmation summary. History list with past requests.

## Required states (every flagship screen)
Empty, loading (Skeleton/Spinner), error, and success — not just happy path.

## Responsiveness
Mobile-first for donor/requester actions; `AppShell` collapses to bottom tab bar under ~1000px; dense grids reflow. Blood-bank/inventory views optimized wider.

## Verification
- `pnpm install` picks up new deps (react-router-dom, lucide-react).
- Dev server already running on `$PORT` (Vite hot reload) — confirm no compile errors via preview / `figma logs` only if a failure appears.
- Manually walk the flagship route chain: Landing → Login → Role select → Requester dashboard → Create → Matches → Track (advance stepper) → Fulfilled → History; check mobile (<1000px) bottom nav and each empty/loading/error/success state.
- Confirm emergency red appears ONLY on urgency elements; verify AA text contrast.

## Out of scope (this pass)
Full Donor and Blood Bank flows beyond their dashboards; real backend/auth; maps SDK (distance shown numerically, map as styled placeholder).
