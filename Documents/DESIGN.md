# BloodLink — Design System

## 1. Design Direction

BloodLink should feel:

```text
Trustworthy
Human
Calm
Modern
Fast
Precise
Professional
```

It should NOT feel like:

```text
Generic SaaS
AI dashboard
Medical stock template
Overly futuristic
Overly corporate
```

The interface must feel appropriate for a serious emergency coordination product.

---

# 2. Design Principle

## Calm urgency

BloodLink deals with emergencies.

The interface should communicate urgency without creating panic.

Use:

```text
Strong hierarchy
Clear typography
Controlled contrast
Focused CTAs
Meaningful status indicators
```

Avoid:

```text
Flashing UI
Excessive red
Visual noise
Aggressive animations
```

---

# 3. Color System

The final palette should be defined as design tokens rather than scattered hex values.

Example semantic tokens:

```css
--color-primary
--color-primary-hover

--color-background
--color-surface
--color-surface-elevated

--color-text-primary
--color-text-secondary
--color-text-muted

--color-border

--color-success
--color-warning
--color-danger
--color-info
```

### Important

Red should represent BloodLink's identity and emergency context, but should NOT dominate every screen.

---

# 4. Typography

Typography should prioritize readability.

Use a modern sans-serif typeface.

Hierarchy:

```text
Display
H1
H2
H3
Body
Body Small
Caption
Label
```

Avoid using too many font weights.

Recommended hierarchy should be established as tokens.

---

# 5. Spacing

Use a consistent spacing scale.

Example:

```text
4
8
12
16
20
24
32
40
48
64
80
```

Do not randomly use:

```text
13px
17px
27px
39px
```

unless a deliberate design requirement exists.

---

# 6. Border Radius

Use a restrained radius system.

```text
Small
Medium
Large
Pill
```

Not every element needs maximum rounding.

Cards should feel structured rather than floating blobs.

---

# 7. Shadows

Use shadows sparingly.

Prefer:

```text
Borders
Surface contrast
Elevation
Spacing
```

over excessive shadows.

---

# 8. Cards

Cards should exist to group related information.

A card should generally contain:

```text
Context
Information
Action
```

Avoid cards inside cards inside cards.

---

# 9. Buttons

Primary button:

> One obvious main action.

Secondary button:

> Supporting action.

Destructive button:

> Irreversible/dangerous action.

Buttons should have:

```text
Default
Hover
Focus
Active
Disabled
Loading
```

states.

---

# 10. Forms

Forms must be:

* Clear
* Short
* Grouped logically
* Easy to scan

For emergency flows:

> Ask only for information that is actually necessary.

---

# 11. Blood Group Display

Blood groups are important visual information.

Examples:

```text
A+
A-
B+
B-
AB+
AB-
O+
O-
```

They should have a consistent visual component.

Example:

```text
┌──────┐
│  B+  │
└──────┘
```

Do not redesign the blood group badge differently on every page.

---

# 12. Urgency

Urgency should use:

```text
Label
Icon where appropriate
Typography
Color
Position
```

rather than color alone.

Example:

```text
CRITICAL
URGENT
NORMAL
```

---

# 13. Navigation

Desktop:

```text
Logo
Navigation
Search
Notifications
Profile
```

Mobile:

```text
Header
Content
Bottom navigation / contextual navigation
```

Navigation should always make the current location clear.

---

# 14. Maps

Maps should support the interface rather than dominate it.

Provide:

```text
Map
+
List
+
Details
```

when practical.

Never make users depend exclusively on map interaction.

---

# 15. Animation

Animation should communicate:

* State changes
* Navigation
* Feedback
* Hierarchy

Recommended characteristics:

```text
Fast
Subtle
Purposeful
```

Avoid:

```text
Constant movement
Excessive page transitions
Decorative animation everywhere
```

Respect:

```css
prefers-reduced-motion
```

---

# 16. Responsive Design

Breakpoints should be based on content requirements rather than device names.

Design for:

```text
Small mobile
Large mobile
Tablet
Desktop
Large desktop
```

---

# 17. Accessibility

Target WCAG-aligned practices.

Important:

* Contrast
* Keyboard support
* Focus visibility
* Semantic markup
* Labels
* Screen readers
* Motion preferences
* Touch target sizing

---

# 18. Visual Hierarchy

Every screen should answer:

### 1. Where am I?

### 2. What matters?

### 3. What can I do?

### 4. What happens next?

If those answers are not obvious, redesign the screen.

---

# 19. Empty States

Empty states should feel intentional.

Example:

```text
No active requests nearby

There aren't any matching blood requests
in your area right now.

[Explore all requests]
```

---

# 20. Loading

Prefer skeletons for:

* Cards
* Lists
* Dashboard sections
* Profile sections

Use spinners for:

* Button actions
* Short operations
* Small isolated states

---

# 21. Design Quality Rule

Before accepting any screen, ask:

> Would this look intentionally designed if the BloodLink logo were removed?

If the answer is no, refine the hierarchy, spacing, typography, or composition.

---

# 22. Design North Star

BloodLink should look like a product people can **trust during an important moment**.
