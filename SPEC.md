# NEXTRUN — Specification

> **Status:** Final — design-to-constraints adaptation
> **Last updated:** 2026-06-01

This document defines **what** we build before we decide **how**.
The design handoff prototype (`design_handoff_nextrun/` — open `Events Listing.html` in a browser) is the source of structure: SPEC adapts to the 6 screens it implements. Design tokens live in [design_handoff_nextrun/assets/tokens.css](design_handoff_nextrun/assets/tokens.css).

---

## 1. Project Overview

A web application for browsing upcoming running races and registering as a participant via a multi-step flow (browse → details → checkout → ticket).

**Learning goals (this is a learning project, not a real product):**
- Practice end-to-end SPA development with React + Vite + TypeScript.
- Learn AI-assisted workflow: design handoff prototype → Claude Code → reproducible output.
- Produce a spec + design + code package that another developer can use to reproduce the same site.

**Target audience (fictional):** amateur runners looking for upcoming races to register for.

**Locale:** English (single language).
**Currency:** USD (single currency).

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 19 + Vite | Industry standard, fast dev server. Latest stable from `create-vite` scaffold. |
| Language | TypeScript | Compile-time safety. |
| Routing | React Router v6 | Multi-page SPA with deep-linkable routes. |
| Styling | CSS Modules + CSS custom properties | Vanilla CSS scoped per component (zero build-config complexity). Tokens from `design_handoff_nextrun/assets/tokens.css` become global custom properties in `src/styles/tokens.css`. Mentor reproduces without learning extra DSL. |
| Form state | React Hook Form (recommended) | Multi-field form with per-field validation. |
| PDF generation | `jsPDF` | Client-side, no server. Triggered by "Download Ticket" button on Confirmation. Imperative A4 drawing (port `generateTicketPDF` from the prototype's `assets/screens.jsx`). Renders Helvetica only — see §7 Latin-only constraint. |
| Backend | MockAPI.io | Free fake REST API, real HTTP requests. |
| Persistence | None | No favorites, no auth. Theme/brand/density are fixed (charcoal/runner/regular) — no switcher, no `localStorage`. |
| Design source | Runnable HTML/React prototype in `design_handoff_nextrun/` | The prototype IS the reference — open `Events Listing.html` and inspect its CSS/JSX. Reproducible without Figma. |

---

## 3. Domain Model

### 3.1 Schema decision: denormalized

`Participants` are stored as an array inside `Event` — not a separate MockAPI resource.

**Why:**
- MockAPI free tier has ~50 records/resource limit. Realistic events have 50–200 participants each → normalized schema would exhaust the quota fast.
- We never query/edit participants independently of their event.
- One `GET /events/:id` returns everything needed for the details page AND the confirmation ticket (after a re-fetch).

**Trade-off accepted:** real production APIs typically use normalized schemas with foreign keys. We chose denormalized because of tooling constraints, not because it's "the right way". A senior engineer should know the difference.

### 3.2 Types

```ts
type EventStatus =
  | "upcoming"            // date is in the future, registration not yet open
  | "registration-open"   // accepting participants
  | "completed";          // race finished

type Gender = "male" | "female" | "other";

type Distance = {
  id: string;             // unique within event, used in URL (?distance=:id)
  label: string;          // free-form display name, e.g. "Half Marathon Individual"
  kilometers: number;     // used for sorting (3, 5, 10, 21.1, 42.2)
  price: number;          // USD
  description?: string;   // optional, shown when user clicks "More Information" on Details
};

type Event = {
  id: string;             // assigned by MockAPI
  name: string;           // e.g. "Mispo Winter Marathon"
  date: string;           // ISO date, e.g. "2026-11-13"
  city: string;           // e.g. "Athens"
  country: string;        // ISO 3166-1 alpha-2, e.g. "GR"
  venue: string;
  distances: Distance[];
  subtitle?: string;      // optional short tagline shown on Details above the long description
  description: string;    // 2–4 sentences
  bannerImage: string;    // absolute URL
  status: EventStatus;
  participants: Participant[];
};

type Participant = {
  id: string;             // generated client-side at submit (UUID), used in confirmation URL
  email: string;          // required
  firstName: string;      // required
  lastName: string;       // required
  gender: Gender;         // required
  dateOfBirth: string;    // ISO date "YYYY-MM-DD", required
  address: string;        // required, free-form single line
  phone: string;          // required, 8–15 digits, no enforced country format
  distanceId: string;     // references Event.distances[].id; selected on Details, passed via URL to Checkout
  registeredAt: string;   // ISO datetime, generated on client at submit time
};
```

### 3.3 Derived state (NOT stored)

Computed, never stored — to avoid two sources of truth.

**Event-level:**

| Value | Derivation |
|---|---|
| `minPrice` | `Math.min(...event.distances.map(d => d.price))` — used in "Starting at $X" on list cards |

**Page-level (Home):**

| Value | Derivation |
|---|---|
| `listingFoundCount` | `filteredEvents.length` — displayed as "X Listing Found" subheader (matches design) |

Note: capacity / spots-left / sold-out are intentionally NOT in this model. Registration is unbounded — anyone can register for any distance regardless of how many participants already signed up. This is a learning-project simplification; a real event-registration system would enforce capacity transactionally.

---

## 4. Routes

| Path | Screen | Notes |
|---|---|---|
| `/` | Events Listing (Home) | Catalog. No separate landing. |
| `/events/:id` | Events Details | Includes distance selector. |
| `/events/:id/checkout?distance=:distanceId` | Checkout | `distanceId` is a required URL param matching `Event.distances[].id`; missing or invalid → redirect to `/events/:id`. |
| `/events/:id/confirmation/:participantId` | Confirmation Ticket | Deep-linkable. If participantId not found in event.participants → 404. |
| `*` | 404 — Error Page | Catch-all. |

---

## 5. User Stories & Acceptance Criteria

Format: **User Story** + **Acceptance Criteria** in Gherkin (Given/When/Then).
Each story includes happy path, error states, and edge cases.

### Story 1: Browse upcoming events (Home)

> **As a** runner,
> **I want to** see all upcoming races on the home page,
> **so that** I can discover events to participate in.

**Acceptance Criteria:**

```
Given the home page is loaded,
When events are fetched successfully,
Then I see a list of race cards filtered to events with status "registration-open" (upcoming and completed events are not shown — Listing surfaces only events available for registration right now)
And each card shows: banner image, name, city + country, date, "Starting at $X" (minPrice in USD)
And cards are sorted by date ascending (earliest first)
And the page header reads "All Events You've Got"
And below the header a subtitle shows "{listingFoundCount} Listing Found" with the current visible count.

Given viewport width >= 1024px (desktop),
Then cards display in a 3-column grid.

Given viewport width < 1024px (mobile),
Then cards display in a horizontal scroll-snap carousel with dot pagination indicators
And the user can swipe / scroll to navigate between cards (clicking a dot jumps to that card)
And the header and "Listing Found" subtitle remain visible above the carousel.

Given the events fetch fails (network error or 5xx),
Then I see an error message with a "Retry" button.

Given the events list is empty,
Then I see an empty state with message "No races yet — check back soon".

Given events are still loading,
Then I see a loading skeleton (not a blank screen).

Given a card is displayed,
When I click anywhere on the card,
Then I navigate to "/events/:id" for that event.
```

### Story 2: Search events by name

> **As a** runner,
> **I want to** find specific races by name,
> **so that** I can quickly locate the event I'm interested in without scrolling through the full list.

**Acceptance Criteria:**

```
Given the home page is loaded,
When I type "Marathon" in the search field,
Then I see only events whose `name` contains "Marathon" (case-insensitive, substring match).

Given the search field contains "  Marathon  " (with surrounding whitespace),
Then the query is trimmed to "Marathon" before matching
And whitespace inside the query is preserved (e.g. "Half Marathon" matches "Half Marathon" but not "HalfMarathon").

Given the search query is non-empty,
When I clear the search field,
Then the full event list is restored.

Given the search query is non-empty,
When no event name matches the query,
Then I see an empty state with message "No events match your search"
And this is distinct from the "No races yet — check back soon" state in Story 1.

Given I type "Marathon" in the search field,
Then the URL updates to "/?q=Marathon".

Given the URL is "/?q=Marathon",
When I clear the search field,
Then the URL becomes "/" (the `q` parameter is removed entirely, not left as `?q=`).

Given the URL is "/?q=Marathon",
When the page loads (direct visit or browser back/forward),
Then the search field is pre-filled with "Marathon"
And the events list is already filtered by that query.
```

### Story 3: View event details and select distance

> **As a** runner,
> **I want to** view full details of a specific event and choose which distance to register for,
> **so that** I can decide before committing to fill out the checkout form.

**Acceptance Criteria:**

```
Given the URL is "/events/:id" with a valid event ID,
When the page loads successfully,
Then I see:
  - An eyebrow page label "Events Details"
  - A "Back" button (left-arrow icon + "Back", top-right) that returns to "/" (Events Listing — Home). The action is always navigate-to-Home, not browser history.
  - The event title
  - Metadata row: city + country, date, comma-separated distance labels
  - A full-width banner image (≈21:9)
  - Below the banner, a two-column body:
    - Left column (≈60%): optional subtitle (event tagline) above the long description (2–4 paragraphs)
    - Right column (≈40%, sticky on desktop): a "Register" panel — heading "Register", a hint line ("Pick a distance to continue to checkout."), the list of distance options as cards (see below), and a "Register" CTA at the bottom of the panel.

Given the event has available distances,
Then for each distance I see a card containing: a radio selector + distance label + price ("X USD") on the top row, the distance in km below, and a "More information" toggle (shown only when the distance has a `description`)
And cards are ordered by `kilometers` ascending.

Given I click "More Information" on a distance card,
Then the card expands inline to show `distance.description` (if present; otherwise the toggle is hidden for that card)
And clicking again collapses it
And expanding one card does NOT collapse others.

Given the event has registered participants,
Then I do NOT see the participants list on this page (no participants section in the design — registered users are private and visible only on their own confirmation page).

Given the event status is "registration-open",
Then the Register CTA in the panel is visible
And all distance radios are enabled.

Given no distance is selected,
Then the REGISTER button is disabled.

Given a distance is selected,
Then the REGISTER button is enabled
And clicking it navigates to "/events/:id/checkout?distance=:selectedDistanceId".

Given the event status is "upcoming",
Then all distance radios are disabled
And the REGISTER button is disabled with label "Registration not open yet".

Given the event status is "completed",
Then all distance radios are disabled
And the REGISTER button is disabled with label "Event finished".

Given the URL is "/events/:id" with an ID that does not exist,
When the page loads,
Then I am redirected to the 404 page.

Given the event details are still loading,
Then I see a loading skeleton.

Given the event fetch fails (network error or 5xx),
Then I see an error message with a "Retry" button.

Given viewport width < 1024px (mobile),
Then the layout collapses to a single column: the header row stays (title + Back), metadata stacks vertically, the banner spans full width, the description and the Register panel stack vertically (panel no longer sticky), distance cards stack one per row, and the Register CTA spans full width.
```

### Story 4: Register on Checkout

> **As a** runner,
> **I want to** fill out my registration details on a dedicated checkout page,
> **so that** I can complete my registration with all required information.

**Acceptance Criteria:**

```
Given the URL is "/events/:id/checkout?distance=:d",
When the page loads,
Then I see:
  - An eyebrow page label "Checkout"
  - A "Back" button (left-arrow icon + "Back", top-right) that returns to "/" (Events Listing — Home). Same behavior as Details: always Home, not previous step. *Trade-off: a user who wants to change distance has to re-navigate Listing → Details. Accepted because the Back button is uniform across pages.*
  - Below the page header: the event name on the left and the selected distance label on the right (e.g. "Mispo Winter Marathon" + "10 km") — both read-only confirmation of what the user is registering for
  - Subsection label "Your Information"
  - The following required fields (in this order):
    1. Email
    2. First Name (left half) and Last Name (right half) on the same row
    3. Gender (radio: Male / Female / Other)
    4. Date of Birth (Day / Month / Year dropdowns)
    5. Address (single line input)
    6. Phone — required, single input. The field accepts only digit characters: non-digit keystrokes (letters, spaces, `+`, `-`, `(`, `)`) are blocked at input time and paste is sanitized to digits. Length must be 8–15 digits to pass validation.
  - A "REGISTER" button at the bottom.

Given the URL is missing the `distance` query param,
OR `distance` is not one of the event's available distance IDs,
Then I am redirected back to "/events/:id".

Given I attempt to submit with any required field empty,
Then I see a per-field "This field is required" error
And the form does not submit.

Given I enter an email that does not match the format `*@*.*`,
Then I see "Invalid email format" under the email field
And the form does not submit.

Given I enter non-Latin characters (e.g. Cyrillic) in Email, First Name, Last Name, or Address,
Then I see "Latin characters only (a–z)" under that field
And the form does not submit.
(Rationale: the ticket PDF uses jsPDF/Helvetica, which has no Cyrillic glyphs — see §7. Allowed sets: First/Last Name `[a-zA-Z\s\-']`; Address `[a-zA-Z0-9\s\-',./]`; Email must be ASCII `[\x00-\x7F]`.)

Given I enter a Date of Birth in the future,
Then I see "Date of birth must be in the past" under the field
And the form does not submit.

Given my Date of Birth would make me younger than 16 on the event date,
Then I see "You must be at least 16 years old to register" under the field
And the form does not submit.

Given I enter a phone number whose digit-only length is less than 8 or greater than 15,
Then I see "Invalid phone number (8–15 digits)" under the phone field
And the form does not submit.

Given my email is already present in the event's `participants` list (case-insensitive match),
When I submit the form,
Then I see the message "You are already registered for this event"
And no new participant is created.

Given I submit a valid form,
Then the REGISTER button shows a loading state and is disabled until the request completes
(this prevents double-clicks from creating duplicate registrations).

Given I submit a valid form,
When the request succeeds,
Then I am navigated to "/events/:id/confirmation/:participantId"
And the new participant appears in the event's `participants` array on the server.

Given I submit a valid form,
When the request fails (network error or 5xx),
Then I see "Registration failed. Please try again."
And the form stays open with my entered data preserved.

Given I refresh the page mid-form,
Then form data is NOT preserved (no draft persistence — see Out of Scope).

Given viewport width < 1024px (mobile),
Then the layout collapses to a single column: header row stays (Checkout label + Back), event name and distance label stack vertically below the header, First Name and Last Name stack into separate rows (no side-by-side), DOB Day/Month/Year stay in a row (they fit), all other inputs span full width, and the Register button spans full width.
```

### Story 5: View and download confirmation ticket

> **As a** runner who just registered,
> **I want to** see a confirmation page with my ticket and be able to download it as PDF,
> **so that** I have proof of registration to bring to the event.

**Acceptance Criteria:**

```
Given the URL is "/events/:id/confirmation/:participantId" with valid IDs,
When the page loads successfully,
Then I see:
  - An eyebrow page label "Confirmation Ticket"
  - A "Back" button (left-arrow icon + "Back", top-right) that returns to "/" (Events Listing — Home). Uniform with Details and Checkout.
  - Success banner "Your Order successfully done!" (green check)
  - Event name
  - Event venue, date, distance label (the one I registered for)
  - Event banner image
  - "Name of Participant" = firstName + " " + lastName
  - Phone, Email, Address
  - A "Download Ticket" button.

Given the participantId does not exist in event.participants,
Then I am redirected to the 404 page.

Given the event ID does not exist,
Then I am redirected to the 404 page.

Given I click "Download Ticket",
Then a PDF is generated client-side using `jsPDF` (A4, portrait)
And the PDF matches the NEXTRUN ticket layout produced by `generateTicketPDF` in `design_handoff_nextrun/assets/screens.jsx` (brand header "NEXTRUN.", event banner image, participant key/value grid with a "DFR-" participant ID, and a tear-off payment stub reading "Successfully Registered")
And the PDF is saved to the user's downloads with filename "ticket-{slug(event.name)}-{participantId.slice(0,8)}.pdf",
where `slug(s) = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")` — e.g. "Mispo Winter Marathon" becomes "mispo-winter-marathon", and only the first 8 chars of the participant UUID are appended (filenames must not contain raw spaces).

Given I navigate to the confirmation URL on a different device or browser,
Then the page renders correctly using only the data fetched from the API
(no localStorage or session dependency — the URL is the only entry point).

Given viewport width < 1024px (mobile),
Then the layout collapses to a single column: header row stays (Confirmation Ticket + Back), success banner spans full width, event info block stacks vertically with photo below the text (not side-by-side), participant info stacks vertically, and Download Ticket button spans full width.

Given I am on a mobile viewport and click "Download Ticket",
Then the generated PDF still uses the A4 jsPDF layout (the PDF format is fixed regardless of viewport).
```

### Story 6: Not-found page

> **As a** user,
> **I want to** see a clear 404 page if I land on a bad URL,
> **so that** I can return to the home page.

**Acceptance Criteria:**

```
Given I navigate to any path not matched by the defined routes,
OR I navigate to "/events/:id" with a non-existent event,
OR I navigate to "/events/:id/confirmation/:participantId" with a non-existent participantId,
Then I see the 404 page: eyebrow "Error", a large "404", heading "Error Page", and body text "The page you're looking for doesn't exist or has been moved."
And there is a visible button labeled "Back to Home"
And clicking it routes me to "/".

Given viewport width < 1024px (mobile),
Then the layout collapses to a single column with the same elements (logo, message, "Back to Home" button) — button spans full width.
```

---

## 6. Out of Scope (explicitly NOT building)

This list prevents scope creep. If a feature isn't here AND isn't in user stories — we don't build it.

- ❌ User authentication / accounts
- ❌ Favorites / saved events (UI not in the design)
- ❌ Real payment processing (Checkout is a registration form, not a transaction — despite the name)
- ❌ Email notifications (no confirmation email is actually sent — the confirmation lives only at its URL)
- ❌ Admin panel to create/edit events (events are seeded manually in MockAPI)
- ❌ Multi-language (English only)
- ❌ Multi-currency (USD only)
- ❌ Real-device QA on iOS Safari. The handoff prototype is responsive across all screens, so mobile is a real reference (not extrapolated) — verify in browser DevTools device mode (iPhone + Pixel presets) during implementation. A real-device iOS Safari pass is deferred — low risk for the project's learning scope (gaps: touch-scroll inertia on the carousel, iOS PDF `Blob` / `doc.save` download quirks, Retina font rendering).
- ❌ Theme / brand / density switching. The prototype's floating "tweaks panel" is design-exploration tooling only — the shipped app uses a single **fixed** theme (charcoal / yellow), the **runner** logo mark, and **regular** card density. No switcher, no onboarding, no `localStorage`.
- ❌ Server-side PDF generation (we use a client-side library, jsPDF)
- ❌ Form draft persistence (mid-fill data is lost on refresh)
- ❌ Map view with race locations
- ❌ Social features (comments, sharing, following)
- ❌ Real-time updates (no websockets)
- ❌ Mobile native app

---

## 7. Constraints

- **MockAPI free tier:** 1 project, ~4 resources, ~50 records/resource. Verify current limits at registration.
- **No real auth:** any visitor can submit the form; we de-dupe by email at the event level only.
- **No backend validation:** MockAPI accepts any payload. All validation is client-side. *Real production apps validate on both client and server.*
- **No capacity enforcement:** distances have no `capacity` field; anyone can register for any distance regardless of how many participants already exist. This is a learning-project simplification. *In a real registration system, capacity would be enforced server-side with optimistic locking or queueing to handle concurrent submissions.*
- **Phone format:** single field, 8–15 digits (no enforced country code prefix). Validation is digit-count only. *Real apps would use libphonenumber or similar; we keep it simple because the design's phone input is a single field with no country selector.*
- **Latin-only text fields:** Email, First Name, Last Name, and Address accept Latin characters only. *Why:* the ticket PDF is drawn with jsPDF using the built-in Helvetica font, which has no Cyrillic (or other non-Latin) glyphs — non-Latin input would render as garbage in the downloaded ticket. A production app would embed a Unicode font (e.g. Noto Sans) in the PDF instead; here we restrict input to keep the learning-project PDF correct without bundling font files.

---

## 8. Acceptance for Mentor Reproduction

The final deliverable of this project includes:
- This `SPEC.md`
- `design_handoff_nextrun/` — the runnable HTML/React prototype (open `Events Listing.html`) + `assets/` (`tokens.css`, styles, component/screen JSX, images). This is the visual source of truth.
- `INSTRUCTIONS.md` — step-by-step prompts and skill invocations
- `ACCEPTANCE.md` — checklist (verified against the prototype)

A different developer, following `INSTRUCTIONS.md` against the `design_handoff_nextrun/` prototype, should produce a site that passes every item in `ACCEPTANCE.md` (visual + functional). Figma access is **not required** for reproduction — the prototype is the source of truth.

---

## Glossary (terms used in this spec)

| Term | Meaning |
|---|---|
| **Entity** | An object with identity (Event, Participant). |
| **Schema** | The structure of data. |
| **Normalized / denormalized** | Whether related data is split across tables or kept together. |
| **Foreign key** | A field that references another entity's ID. |
| **Derived state** | A value computed from other state, not stored. |
| **Single source of truth** | Each piece of state lives in exactly one place. |
| **Literal type / union type** | TypeScript: a type restricted to a fixed set of values. |
| **Happy path** | The flow where everything works. |
| **Empty state / error state / loading state** | The three other UI states every list/fetch needs. |
| **Gherkin** | Given/When/Then syntax for acceptance criteria. |
| **CRUD** | Create / Read / Update / Delete — the four basic data operations. |
| **Route / deep link** | A URL that loads a specific app state, shareable and refresh-safe. |
| **URL param** | A value passed in the URL (`/path/:id`) or query string (`?key=val`). |
