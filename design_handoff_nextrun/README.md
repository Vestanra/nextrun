# NEXTRUN — Design Handoff

## What This Is

High-fidelity HTML/React prototype of NEXTRUN — a running-event registration platform. Every screen, state, and interaction is implemented here. Your job is to **recreate this in your target stack** (React, Next.js, Vue, etc.) matching the design exactly.

Open `Events Listing.html` in a browser to explore the full prototype before building.

---

## Design Decisions (Fixed)

These are baked into the design. Implement them as-is:

| Setting | Value |
|---|---|
| **Theme** | `charcoal` — warm near-black background, yellow `#f5d90a` accent |
| **Logo mark** | `runner` — running figure silhouette (`assets/runner.png`) |
| **Card density** | `regular` — ~28px gap between event cards |

---

## Screens

### 1. Home — Events Listing (`/`)
- Top bar: brand wordmark (left) + search pill (right)
- Page heading: large display title + event count
- Event grid: 3 columns, gap driven by density token
- Footer at bottom
- **Search:** filters `registration-open` events by name (live, case-insensitive substring)
- **No results:** empty state + "Clear search" CTA
- **Mobile (< 1024px):** grid → horizontal scroll carousel with dot indicator

**Event Card:**
- Thumbnail (16:11 ratio), date badge overlay top-left, status flag top-right (hidden when open)
- Title, location + date + distances meta
- Price range (from X USD) + circular arrow button
- Hover: card lifts, image zooms, title → accent color, arrow → accent

---

### 2. Event Details (`/events/:id`)
- Eyebrow label + Back button
- Event title + meta
- Full-width banner image (21:9)
- Two-column: description (60%) + sticky Register panel (40%)
- Register panel: distance cards (radio), CTA enables on selection

**Distance card states:** default / selected (yellow border + filled dot) / disabled

---

### 3. Checkout (`/events/:id/checkout?distance=:d`)
- Form with validation (all fields required)
- On submit: 900ms simulated delay → spinner → navigate to Confirmation

**Fields and validation:**

| Field | Type | Rule |
|---|---|---|
| Email | email | valid format; Latin only |
| First Name | text | Latin only `[a-zA-Z\s\-']` |
| Last Name | text | Latin only `[a-zA-Z\s\-']` |
| Gender | radio pills | male / female / other |
| Date of Birth | 3 selects (DD/MM/YYYY) | past date; age ≥ 16 at event date |
| Address | text | Latin + digits + `, . - ' /` |
| Phone | numeric | digits only, 8–15 chars |

> **Why Latin-only on text fields:** jsPDF (used for ticket PDF) does not render Cyrillic — Latin validation prevents garbled output.

**Duplicate email:** if email already registered for this event → inline error banner, block submit.

---

### 4. Confirmation Ticket (`/events/:id/confirmation/:pid`)
- Success banner (green check)
- Participant details (key/value list) + event photo
- Download Ticket button → generates A4 PDF via jsPDF

**PDF:** event banner image, participant details, payment stub. Filename: `ticket-{event-slug}-{pid-prefix}.pdf`.

---

### 5. 404 Not Found
Shown for unmatched routes or missing IDs.

---

## Interactions

| Trigger | Action |
|---|---|
| Card click | Navigate to `/events/:id` |
| Back button | Navigate to `/`, scroll top |
| Distance card click | Select distance; enable Register CTA |
| Register CTA | Navigate to checkout |
| Form submit | Validate → delay → navigate to confirmation |
| Download Ticket | jsPDF generation + save |
| Search input | Live filter, no debounce |

**Page transitions:** `opacity 0→1` + `translateY(10px→0)`, `0.34s`, `cubic-bezier(0.22, 0.61, 0.36, 1)`.

**Focus:** Do NOT define form-field wrapper components inside render functions — define at module scope, otherwise inputs lose focus on keystroke.

---

## State

```
App
├── theme: "charcoal"    → data-theme on <html>
├── density: "regular"   → data-density on <html>
├── logo: "runner"       → brand mark asset
└── route: { name, id?, distance?, pid? }

HomeScreen:         query (search string)
DetailScreen:       selectedDistanceId
CheckoutScreen:     formFields, errors, loading, bannerError
ConfirmationScreen: downloading (bool)
```

Persist `theme`, `density`, `logo` in `localStorage`.

---

## Design Tokens

All tokens are in `assets/tokens.css`. Reference via `var(--token-name)`.

### Charcoal theme (active)

| Token | Value |
|---|---|
| `--bg` | `#100f0d` |
| `--surface` | `#1a1916` |
| `--surface-2` | `#232118` |
| `--surface-3` | `#2d2a20` |
| `--accent` | `#f5d90a` |
| `--accent-ink` | `#15140f` |
| `--text` | `#f4f1e8` |
| `--text-muted` | `#a8a293` |
| `--text-faint` | `#6f6a5d` |
| `--err` | `#ff6b6b` |
| `--border` | `rgba(255,255,255,0.08)` |
| `--border-strong` | `rgba(255,255,255,0.16)` |

`--accent-strong` = `color-mix(in oklch, var(--accent) 78%, white)`

### Typography
- **Font:** `Hanken Grotesk` (Google Fonts), fallback `Helvetica Neue, Helvetica, Arial, sans-serif`
- Display heading: `clamp(2.6rem, 4.4vw, 4rem)` / weight 800
- H2: `clamp(1.5rem, 2.2vw, 2rem)` / weight 700
- H3: `1.1875rem` / weight 700–800
- Body: `1rem` / weight 400
- Small: `0.875rem`
- Eyebrow: `0.75rem` / weight 700 / `letter-spacing: 0.28em` / UPPERCASE

### Spacing (4px base)
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px`

### Radii
`8px` (sm) · `14px` (md, cards) · `22px` (lg) · `999px` (pill) · `50%` (circle)

### Grid gap by density
| compact | regular | comfy |
|---|---|---|
| `16px` | `clamp(20px, 2.2vw, 32px)` | `40px` |

---

## Data Shape

```ts
Event {
  id: string
  name: string
  date: string              // "YYYY-MM-DD"
  city: string
  country: string           // ISO 2-letter
  venue: string
  status: "registration-open" | "upcoming" | "completed"
  bannerImage: string       // URL
  subtitle?: string
  description: string       // "\n\n"-separated paragraphs
  distances: Distance[]
  participants: Participant[]
}

Distance {
  id: string
  label: string
  kilometers: number
  price: number             // USD
  description?: string
}

Participant {
  id: string                // uuid
  email: string
  firstName: string
  lastName: string
  gender: "male" | "female" | "other"
  dateOfBirth: string       // "YYYY-MM-DD"
  address: string
  phone: string             // digits only
  distanceId: string
  registeredAt: string      // ISO timestamp
}
```

Mock data is in `assets/data.js` — replace with real API calls.

---

## Files

| File | Description |
|---|---|
| `Events Listing.html` | Entry point — loads all scripts; open this to explore |
| `assets/tokens.css` | Design tokens (themes, spacing, type, radii) |
| `assets/styles.css` | Home screen styles |
| `assets/screens.css` | Inner-screen styles |
| `assets/components.jsx` | Shared components (Brand, EventCard, Footer…) |
| `assets/screens.jsx` | Screen components (Detail, Checkout, Confirmation, 404) |
| `assets/app.jsx` | Router + App shell |
| `assets/data.js` | Mock event data |
| `assets/runner.png` | Brand mark — runner (active) |
| `assets/rabbit.png` | Brand mark — rabbit (alternate, not used) |
| `assets/runner-yellow.svg` | Logo for PDF ticket header |
