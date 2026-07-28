# NEXTRUN — Acceptance Checklist

> **Purpose:** verify that a reproduction of this project from [SPEC.md](SPEC.md) + [design_handoff_nextrun/](design_handoff_nextrun/) + [INSTRUCTIONS.md](INSTRUCTIONS.md) passes the same acceptance bar the original was built to.
> **Audience:** developer reproducing the site (mentor pass). Figma access is NOT required — the `design_handoff_nextrun/` prototype is the source of truth.
> **Use:** tick `[x]` only after observing the outcome in the running app. Compare each screen side-by-side with the prototype (open `design_handoff_nextrun/Events Listing.html` in a browser).
> **Last updated:** 2026-06-01

Visual tolerance: **token-level**, not pixel-perfect. Colors / type / spacing per [design_handoff_nextrun/assets/tokens.css](design_handoff_nextrun/assets/tokens.css), within ~4px of the prototype. The prototype is responsive across all screens — use it as the mobile reference too.

---

## 0. Pre-flight (Setup)

Run all of these before testing anything else. A failure here will produce silent false positives downstream.

- [ ] `npm install` completes without errors
- [ ] `.env` exists with `VITE_API_BASE_URL` set (copy template from `.env.example`)
- [ ] MockAPI `/events` resource is reachable and returns seeded events: **5** under Mode B, **7** under Mode A (per INSTRUCTIONS Step 3 banner)
- [ ] Seed status mix is present: Mode B → 3× `registration-open`, 1× `upcoming`, 1× `completed`. Mode A → 5× `registration-open`, 1× `upcoming`, 1× `completed`. In both modes the `upcoming` and `completed` rows MUST be filtered out of Listing per [SPEC Story 1](SPEC.md)
- [ ] **At least one event has `anna.kowalski@example.com` in `participants[]`.** Per INSTRUCTIONS Step 3, Event 1 ships with `p1 = anna.kowalski` as the de-dup test fixture. Without this, Story 4's email-de-dup AC silently passes (form just submits) — see §2 Story 4 note.
- [ ] `npm run dev` boots on `http://localhost:5173` with no console errors
- [ ] `npm run build` exits 0
- [ ] `tsc --noEmit` clean
- [ ] `eslint` clean

> **MockAPI free-tier landmine:** the "+ Add" UI in MockAPI's dashboard serializes empty arrays as `{}` instead of `[]`. If you re-seed via that UI and `participants` or `distances` come back as objects, the boundary guard `isValidEvent` in [src/lib/api.ts](src/lib/api.ts) filters those rows out — Listing will show fewer events than you expect. Always re-seed via raw JSON paste, not the "+ Add" form. (Captured during this project's build.)

---

## 1. Visual fidelity (per screen)

For each screen below: render in the running app, open the prototype side-by-side, verify visual elements. Tokens referenced (`--accent`, `--surface`, `--fs-display`, `--radius-pill`, etc.) are defined in [tokens.css](design_handoff_nextrun/assets/tokens.css).

### 1.1 Listing — desktop (≥1024px)

- [ ] Warm near-black background (`--bg` `#100f0d`), warm-white text
- [ ] Top bar: `Brand` (runner mark + `NEXTRUN` with a yellow `.`) on the left, the search pill on the right
- [ ] Display heading "All Events You've Got" — `--fs-display`, weight 800, with "You've Got" in `--accent` (yellow)
- [ ] Count "{n} Listing Found" — small/muted, count matches visible cards
- [ ] SearchBar pill on `--surface-2`, hairline border, accent focus ring
- [ ] 3-column grid, gap from the density token (regular ≈ `clamp(20px,2.2vw,32px)`)
- [ ] Card: 16:11 banner with a date badge (top-left) → title → location row (pin + "City, Country") → meta row (flag icon + "N distances · date") → "Starting at $X USD" + circular arrow button
- [ ] Cards have a subtle shadow (`--shadow-1`); registration-open cards show NO status flag
- [ ] Hover: card lifts, image brightens/zooms, title + arrow turn yellow
- [ ] Footer on the dark surface: Brand + blurb (left), Contact column (right), the `footer-bottom` line

### 1.2 Listing — mobile (<1024px)

- [ ] Grid becomes a horizontal scroll-snap carousel (same `.event-grid`, CSS-only)
- [ ] The next card peeks at the right edge (≈85% slide width); cards stay equal height
- [ ] Dot pagination indicators visible below the carousel; the active dot follows scroll position
- [ ] Swipe / drag-scroll advances cards; clicking a dot scrolls to that card (DevTools touch emulation, iPhone 14 / Pixel 7 presets)
- [ ] Top bar (Brand + search) and "Listing Found" count remain above the carousel
- [ ] Footer spans full width

### 1.3 Details

- [ ] Page header: "Events Details" label (left) + a subtle "← Back" control (right)
- [ ] Event title (large display)
- [ ] Metadata row: pin + "City, Country", calendar + date, route + comma-separated distance labels
- [ ] Full-width banner image (≈21:9)
- [ ] Two-column body: description on the left (~60%), a sticky Register panel on the right (~40%)
- [ ] Left: optional subtitle (event tagline) above the description paragraphs
- [ ] Register panel: "Register" heading + a hint line, then the distance cards, then the CTA
- [ ] DistanceCard: radio + label + price "X USD" (in `--accent`) on the top row, "{km} Km" below, a "More information" toggle (only when a description exists); the selected card has a yellow border + filled dot
- [ ] Cards ordered by `kilometers` ascending
- [ ] CTA at the bottom of the panel, full-panel width, `--radius-pill`
- [ ] Mobile (<1024px): one column (description, then the Register panel — no longer sticky); banner full width; cards stack 1-per-row; CTA full width

### 1.4 Checkout

- [ ] Page header: "Checkout" label (left) + "← Back" control (right)
- [ ] `checkout-bar`: event name (left) + selected distance label (right), read-only confirmation
- [ ] "Your Information" subsection label
- [ ] Form sits on a `--surface` card
- [ ] Field order: Email → [First Name | Last Name] → Gender (radio pills) → DOB (Day/Month/Year selects) → Address → Phone
- [ ] First / Last side-by-side on desktop, stack on mobile
- [ ] DOB stays in a 3-up row on mobile (placeholders `DD`/`MM`/`YYYY`)
- [ ] Register button at bottom, full-width on mobile; shows a spinner + "Registering…" while submitting
- [ ] Field errors render directly below the field, in `--err`

### 1.5 Confirmation

- [ ] Page header: "Confirmation Ticket" label + "← Back" control
- [ ] Success banner: green check + "Your Order successfully done!"
- [ ] Event name (large display)
- [ ] Meta: venue + date + distance label
- [ ] Two-column grid: ticket info (left) + event photo (right)
- [ ] Participant block: "Name of Participant" = `firstName + " " + lastName`, then Phone, Email, Address
- [ ] "Download Ticket" button (accent)
- [ ] Mobile: photo BELOW text (vertical stack — not side-by-side), Download Ticket full-width

### 1.6 404

- [ ] Page header: "Error" label + "← Back" control (also → `/`)
- [ ] Large "404" in `--accent`; "Error Page" heading (with "Page" in accent); body "The page you're looking for doesn't exist or has been moved."
- [ ] "Back to Home" button routes to `/`
- [ ] Mobile: centered single column, button full-width

### 1.7 Ticket PDF (jsPDF)

- [ ] A4 portrait, single page (matches the prototype's Download Ticket output)
- [ ] Header "NEXTRUN." + yellow rule; banner photo top-right (or grey placeholder if CORS-blocked)
- [ ] Event title + meta (venue / date / distance); participant name; `DFR-…` participant ID / phone / email / address grid
- [ ] Payment row: distance — event name, `{price}.00 USD`, and "Successfully Registered" (never "Paid"); dashed tear-off stub below
- [ ] Text renders in Helvetica (Latin only) — Cyrillic is blocked at Checkout input, so it never reaches the PDF
- [ ] Filename pattern: `ticket-{event-name-slug}-{participantId.slice(0,8)}.pdf`
  - slug rule: `event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")`
  - e.g. "Mispo Winter Marathon", participantId `a1b2c3d4-…` → `ticket-mispo-winter-marathon-a1b2c3d4.pdf`

---

## 2. Functional checklist (per Story)

Items are observable outcomes derived from [SPEC §5](SPEC.md) Given/When/Then. Refer to SPEC §5 for the full clauses.

### Story 1 — Browse upcoming events

- [ ] `/` renders ≥1 event card from MockAPI seed
- [ ] Only events with `status === "registration-open"` appear; `upcoming` and `completed` are filtered out
- [ ] Cards sorted by `date` ascending (earliest first)
- [ ] Subtitle "{n} Listing Found" — `n` equals the visible card count and updates on filter
- [ ] Click anywhere on a card → navigates to `/events/:id` for that event
- [ ] Throttled network (DevTools → Slow 3G) → loading skeleton appears, not blank screen
- [ ] Empty state "No races yet — check back soon" appears when no events are returned. Mode B → temporarily delete all fixtures in MockAPI, refresh, then re-seed. Mode A → do NOT delete shared fixtures; instead verify by code review of the `status === "success" && events.length === 0 && !q.trim()` branch in `Listing.tsx`, or by pointing `.env` to an empty MockAPI project temporarily.
- [ ] Fetch failure (DevTools → block API host) → error message + Retry button

### Story 2 — Search by name

- [ ] Typing in SearchBar filters cards immediately (case-insensitive substring match on `event.name`)
- [ ] URL syncs to `/?q=...` while typing
- [ ] Clearing the field removes the `q` param entirely (`/`, not `/?q=`)
- [ ] Subtitle count updates as filter changes — no stale numbers
- [ ] Deep-link `/?q=marathon` (cold load) → input pre-filled, list pre-filtered
- [ ] No matches → empty state "No events match your search" (distinct from Story 1 empty state)
- [ ] Surrounding whitespace trimmed (`"  Marathon  "` matches `"Marathon"`); whitespace inside the query is preserved (`"Half Marathon"` matches `"Half Marathon"` but not `"HalfMarathon"`)

### Story 3 — Event Details

- [ ] `/events/:id` renders all visual elements from §1.3
- [ ] Distances sorted by `kilometers` ascending
- [ ] DistanceCard radio group: clicking selects; exactly one selected at a time
- [ ] "More information" toggles are per-card and independent — expanding one does NOT collapse others
- [ ] If `distance.description` is absent → "More information" toggle hidden for that card
- [ ] Register CTA disabled until a distance is selected
- [ ] Register label adapts to status:
  - `registration-open` → enabled "Register" (after a distance is picked)
  - `upcoming` → disabled "Registration not open yet", cards disabled
  - `completed` → disabled "Event finished", cards disabled
- [ ] `/events/9999` (non-existent id) → redirect to `/not-found` in `replace` mode (browser Back skips it)
- [ ] Back control → `/` (Home), NOT browser history

### Story 4 — Checkout

- [ ] `/events/:id/checkout?distance=X` renders form per §1.4
- [ ] All 7 fields required; empty submit shows per-field "This field is required"; form does not submit
- [ ] Email format check: missing `@` or missing `.` → "Invalid email format"
- [ ] Latin-only: Cyrillic (or other non-Latin) in Email / First Name / Last Name / Address → "Latin characters only (a–z)" on that field; form does not submit (SPEC §7 — jsPDF can't render Cyrillic)
- [ ] **Email de-dup canary:** submit with `anna.kowalski@example.com` on the event where she's seeded → "You are already registered for this event", form does not submit, MockAPI not called. Case-insensitive match — also try `ANNA.KOWALSKI@example.com`.
  > If this AC appears to pass even though you never seeded Anna into participants[], the test is a false positive — the de-dup branch was never triggered. Re-verify Pre-flight §0.
- [ ] Phone field blocks non-digit keystrokes at input time (letters, spaces, `+`, `-`, parentheses)
- [ ] Pasting `+1 (212) 555-0100abc` into phone → sanitized to `12125550100`
- [ ] Phone validation: <8 or >15 digits after sanitization → "Invalid phone number (8–15 digits)"
- [ ] DOB in the future → "Date of birth must be in the past"
- [ ] DOB making age <16 on the **event date** (not today) → "You must be at least 16 years old to register". Test with a DOB that puts age at exactly 15 on `event.date`.
- [ ] Valid submit → button shows loading state and is disabled until request completes (prevents double-click duplicates)
- [ ] On success → redirect to `/events/:id/confirmation/:participantId`; MockAPI Event row's `participants` length is +1
- [ ] Network failure on submit (DevTools → block API host) → "Registration failed. Please try again."; form data preserved in fields
- [ ] `/events/:id/checkout` (no `distance` param) → redirect to `/events/:id`
- [ ] `/events/:id/checkout?distance=invalid` → redirect to `/events/:id`
- [ ] `/events/9999/checkout?distance=X` → redirect to `/not-found`
- [ ] Refresh mid-form → form data NOT preserved (no draft persistence — out of scope per SPEC §6)

### Story 5 — Confirmation + Ticket PDF

- [ ] `/events/:id/confirmation/:participantId` renders all elements from §1.5
- [ ] Deep-link works on cold reload (no localStorage / no session dependency)
- [ ] Cross-device test: open the same URL in an incognito window or a different browser → page renders identically
- [ ] "Download Ticket" → PDF downloads to disk
- [ ] **Open the downloaded file from disk** (not just the in-browser preview) → layout matches the prototype's Download Ticket output (see §1.7)
- [ ] Filename slug correct: see §1.7 for the rule
- [ ] `/events/:id/confirmation/garbage-uuid` → redirect to `/not-found`
- [ ] `/events/9999/confirmation/anything` → redirect to `/not-found`

### Story 6 — 404

- [ ] `/garbage-route` (any unmatched path) → NotFound renders
- [ ] `/not-found` (direct visit) → NotFound renders
- [ ] "Back to Home" button → `/`
- [ ] Mobile: single-column centered layout, button full-width

---

## 3. Cross-cutting

### 3.1 Routing & redirects

- [ ] All redirect rules in §2 (Stories 3–6) verified by direct URL paste in the address bar, not only by in-app clicks
- [ ] All redirects to `/not-found` use `replace` history mode (browser Back skips them)
- [ ] Home-return control returns to `/` (not browser history) on all four screens: a **Back** control in the page header on Details / Checkout / Confirmation / 404, plus a **Back to Home** button in the 404 body. Verified by entering each page via direct URL paste, then clicking the control.

### 3.2 Deep-link refresh (F5)

- [ ] F5 on `/?q=marathon` → search input pre-filled, list filtered
- [ ] F5 on `/events/:id` → renders without errors
- [ ] F5 on `/events/:id/checkout?distance=X` → renders without errors
- [ ] F5 on `/events/:id/confirmation/:participantId` → renders without errors (no localStorage dep)

### 3.3 Mobile (Chrome DevTools device mode)

Walk through all 6 routes at iPhone 14 preset, Pixel 7 preset, and Responsive 360px width. Add Fast 3G throttling for at least one pass.

- [ ] No horizontal scroll at 360px on any of the 6 routes
- [ ] Listing: scroll-snap carousel with equal-height cards + dot pagination + swipe/scroll works
- [ ] Details: one column (description then Register panel), banner full-width, distance cards stack 1-per-row
- [ ] Checkout: First/Last stack vertically; DOB stays in a 3-up row; all other inputs full-width; Register full-width
- [ ] Confirmation: photo below text (vertical stack), Download Ticket full-width
- [ ] 404: centered single column, button full-width
- [ ] DOB selects show `DD`/`MM`/`YYYY` placeholders at 360px without text being clipped by the chevron padding
- [ ] All form inputs use `font-size ≥16px` (anything smaller triggers iOS Safari zoom-on-focus)
- [ ] Fast 3G pass: loading skeletons visible, no cumulative layout shift on data arrival

### 3.4 Accessibility

- [ ] All decorative icons carry `aria-hidden="true"` (Icon.pin / Icon.flag / Icon.arrow on cards, meta icons on inner screens, footer/contact icons)
- [ ] All meaningful `<img>` tags have a descriptive `alt={...}` (event banners alt-text on Listing card, Details, Confirmation; mentor reproduction can grep `<img` in `src/` and audit each occurrence)
- [ ] Tab order is logical on every page: header → main content → footer
- [ ] Focus ring visible on every interactive element (accent `--accent` ring)
- [ ] The Register panel carries `role="radiogroup"` (`aria-label="Choose a distance"`); each distance card has `role="radio"` + `aria-checked` (+ `aria-disabled` when closed)
- [ ] Disabled Register CTA announces the reason via its visible label text ("Registration not open yet" / "Event finished"), not via `title` alone
- [ ] `prefers-reduced-motion: reduce` honored — skeleton shimmer pauses (toggle in DevTools → Rendering → Emulate CSS media feature)

### 3.5 Console health

- [ ] No errors and no warnings in DevTools Console across: cold load of every route → primary interaction on each → navigation away from each

### 3.6 Design tokens

- [ ] `src/styles/tokens.css` `:root` matches the charcoal token set in [tokens.css](design_handoff_nextrun/assets/tokens.css): accent (`--accent` / `--accent-strong` / `--accent-ink`), `--err`, the surface ladder (`--bg` / `--surface` / `--surface-2` / `--surface-3`), borders, text levels, type scale (`--fs-*` / `--lh-*` / `--ls-*` over `--font-sans`), spacing `--space-1..9`, radii (`sm`/`md`/`lg`/`pill`/`circle`), shadows `--shadow-1` / `--shadow-2`, layout (`--container` / `--gutter`), motion (`--ease` / `--dur`)
- [ ] `<html>` carries `data-theme="charcoal"` and `data-density="regular"`; no theme switcher / `localStorage` ships
- [ ] No hardcoded hex colors outside `tokens.css` (grep `src/` for `#[0-9a-fA-F]{3,8}` — should match only `tokens.css` and documented exceptions, e.g. the RGB tuples + green check inside `generateTicketPdf.ts`)

---

## 4. Sign-off

- [ ] All Pre-flight items (§0) ticked
- [ ] All Visual fidelity items (§1.1–§1.7) ticked
- [ ] All Functional items per Story (§2) ticked
- [ ] All Cross-cutting items (§3.1–§3.6) ticked
- [ ] One real PDF downloaded and opened **from disk** (not browser preview)
- [ ] Reproducer's screens placed side-by-side with the prototype (`design_handoff_nextrun/Events Listing.html`) are visually equivalent at token level (colors, typography, spacing within ~4px)

When every box above is ticked, the reproduction is complete.
