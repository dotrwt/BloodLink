# BloodLink — Development Rules

These rules apply to every implementation decision.

---

# 1. General Rule

**Do not code before understanding the requirement.**

Before implementing a feature:

1. Understand the user flow.
2. Check PRD.
3. Check architecture.
4. Check design system.
5. Check existing components.
6. Implement.
7. Test.
8. Refine.

---

# 2. Frontend Stack

Use:

```text
React
TypeScript
Vite
```

Do not introduce another framework without explicit approval.

---

# 3. TypeScript

Strict typing is mandatory.

Avoid:

```ts
any
```

Prefer:

```ts
unknown
```

when the type is genuinely unknown.

Define interfaces/types for:

* API responses
* Forms
* Domain entities
* Component props
* Application state

---

# 4. React

Prefer functional components.

Use hooks appropriately.

Avoid:

* Massive components
* Deep prop drilling
* Unnecessary `useEffect`
* Unnecessary memoization
* Side effects during render

---

# 5. Component Reuse

Before creating a component:

> Check whether an existing component already solves the problem.

Do not create five different buttons for five pages.

Create consistent primitives:

```text
Button
Input
Badge
Card
Modal
Dropdown
Tabs
Avatar
Skeleton
```

---

# 6. Design Consistency

Never randomly introduce:

* Colors
* Border radii
* Shadows
* Font sizes
* Spacing
* Icons

Use the design system.

If a new value is necessary, update `DESIGN.md`.

---

# 7. UI Quality

The UI must not feel like a default AI-generated dashboard.

Avoid:

* Excessive rounded cards
* Random gradients
* Generic glassmorphism
* Excessive shadows
* Huge headings everywhere
* Too many badges
* Unnecessary decorative elements
* Template-like layouts

Every visual element must have a purpose.

---

# 8. User Experience

Always ask:

> What does the user need to know or do next?

Primary actions must be obvious.

Secondary actions must not compete with primary actions.

---

# 9. Emergency UX

Emergency states require stronger hierarchy.

Critical information must appear:

* Early
* Clearly
* Concisely

Do not overload emergency screens with decorative UI.

---

# 10. Accessibility

Every interactive element must be keyboard accessible.

Images require meaningful alt text where appropriate.

Inputs require labels.

Focus states must remain visible.

Never communicate important information using color alone.

---

# 11. Responsive Design

Never build desktop first and "fix mobile later."

Check:

```text
Mobile
Tablet
Desktop
```

for every major page.

---

# 12. Loading States

Every async screen needs a loading state.

Prefer skeletons when content structure is known.

Avoid arbitrary spinners everywhere.

---

# 13. Empty States

Empty states must explain:

1. What happened.
2. Why it matters.
3. What the user can do next.

---

# 14. Error States

Errors must be:

* Understandable
* Actionable
* Non-technical

Never expose raw backend errors directly to users.

---

# 15. API Rules

Never call APIs directly inside reusable UI primitives.

API logic belongs in services/hooks.

Never hardcode API URLs.

---

# 16. Mock Data Rules

Mock data is acceptable during development.

But:

```text
Mock
≠
Production
```

Clearly label and isolate mocks.

---

# 17. Security

Never put:

* API secrets
* Private keys
* Passwords
* Tokens

inside source code.

Frontend validation improves UX but does NOT replace backend validation.

---

# 18. Medical Safety

BloodLink is a coordination platform.

It must not present itself as a medical diagnosis system.

Do not invent medical claims.

Do not invent eligibility requirements.

Medical rules must eventually come from validated backend/domain logic.

---

# 19. Naming

Use descriptive names.

Bad:

```text
data2
thing
temp
foo
card1
```

Good:

```text
bloodRequests
nearbyDonors
requestStatus
selectedBloodGroup
```

---

# 20. File Naming

Use consistent naming.

Components:

```text
BloodRequestCard.tsx
```

Hooks:

```text
useBloodRequests.ts
```

Services:

```text
requestService.ts
```

Types:

```text
bloodRequest.ts
```

---

# 21. Dependencies

Before installing a package ask:

1. Do we actually need it?
2. Can React/browser APIs solve it?
3. Will it increase complexity?
4. Is it maintained?
5. Does it improve the product meaningfully?

Do not install libraries for trivial functionality.

---

# 22. Git

Commits should describe intent.

Good:

```text
feat: add blood request creation flow
fix: correct request status rendering
refactor: extract request card component
style: refine dashboard spacing
```

Bad:

```text
changes
final
updated
working
new
```

---

# 23. AI Coding Rule

AI-generated code must be treated as a draft.

Never blindly accept generated code.

Before keeping generated code:

* Understand it.
* Check consistency.
* Check duplication.
* Check types.
* Check accessibility.
* Check responsiveness.
* Check edge cases.

---

# 24. No Random Refactoring

Do not rewrite working architecture just because another pattern looks cleaner.

Refactor when:

* Complexity is increasing.
* Duplication is meaningful.
* Performance requires it.
* Requirements changed.

---

# 25. Definition of Done

A feature is not complete until:

```text
✓ Functionality works
✓ TypeScript passes
✓ Responsive behavior works
✓ Loading state exists
✓ Error state exists
✓ Empty state exists where relevant
✓ Accessibility considered
✓ Existing design system followed
✓ No unnecessary duplication
✓ Code is understandable
```

---

# 26. Golden Rule

> **Build less, but build it properly.**

A smaller polished product is better than a massive unfinished dashboard.
