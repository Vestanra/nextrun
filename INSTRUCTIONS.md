# NEXTRUN — Implementation Instructions

> **Status:** Ready for execution (2026-06-01)
> **Audience:** Claude Code (operator) and the mentor (reproducer).
> **Inputs:** [SPEC.md](SPEC.md), [design_handoff_nextrun/](design_handoff_nextrun/) (runnable HTML/React prototype + [`assets/tokens.css`](design_handoff_nextrun/assets/tokens.css)).
> **Output:** Working SPA matching every acceptance criterion in SPEC, ready for ACCEPTANCE.md verification.

---

## How to use this document

1. Open this file at the top, work top-to-bottom. Each step is independent of later steps but **depends on all earlier ones**.
2. Each step contains one or more **prompt blocks** (format defined below). Paste each block as-is into Claude Code, in order.
3. After each block, run the **Verify** step before moving on. If verify fails, fix before continuing — do not stack broken steps.
4. SPEC is the source of truth for behavior. The `design_handoff_nextrun/` prototype is the source of truth for visuals — open `Events Listing.html`, inspect its CSS/JSX, and port from `assets/` rather than re-deriving values. If a prompt and SPEC disagree, SPEC wins — flag the contradiction and update the prompt.

---

## Prerequisites

- Node **20.11+** (or 22+) and npm (or pnpm / yarn — substitute commands accordingly). `vite.config.ts` uses `import.meta.dirname`, which Node added in 20.11; older 20.x will silently pass `undefined` to `path.resolve` and crash at build/dev start.
- Claude Code CLI installed and authenticated.
- A free MockAPI.io account.
- Project root: the directory containing this file (already has SPEC + `design_handoff_nextrun/` + this file).

---

## Prompt format

Every step uses one or more **prompt blocks** in this format:

```
> Context: <SPEC sections + design assets + token references that are relevant>
> Goal: <one-sentence task statement>
> Build: <detailed implementation directives: files, logic, behavior, libraries>
> Acceptance: <which SPEC acceptance criteria this should satisfy, by §/Story>
> Verify: <how to check it manually after Claude finishes>
```

**Convention:** prompts reference SPEC by section number (§3.2, Story 4 AC) rather than restating rules — keeps SPEC as single source of truth, avoids drift when SPEC changes.

---

## Step 1 — Project scaffold

**Decisions baked in this step:**
- Vite + React 19 + TypeScript (SPEC §2). `create-vite` latest scaffold gives React 19; no app code in our scope depends on React-18-specific behavior.
- React Router v6 (SPEC §2)
- React Hook Form (SPEC §2)
- `jspdf` installed but used only in Story 5 (the ticket PDF is drawn imperatively — see Step 9). **Use `^2`** (matches the `jspdf@2.5.1` the prototype loads via CDN).
- **Styling: CSS Modules + CSS custom properties** (SPEC §2). No extra build config needed — Vite supports `*.module.css` natively.
- Folder layout: `src/{pages,components,hooks,lib,styles,types}`

### Prompt 1.1 — Scaffold the project

```
> Context: SPEC §2 Tech Stack. Project root contains SPEC.md, INSTRUCTIONS.md, ACCEPTANCE.md, design_handoff_nextrun/, .env.example. No package.json yet.
> Goal: Set up a Vite + React 19 + TypeScript project at the repo root, ready to `npm run dev`.
> Build:
>   1. Initialize Vite with the `react-ts` template. Repo root is non-empty (SPEC, INSTRUCTIONS, design_handoff_nextrun/, etc.), so scaffold into a temp subdir and move files up, preserving existing markdown + design_handoff_nextrun/ + .env.example + the existing .gitignore. **Windows PowerShell caveat:** the documented `npm create vite@latest <name> -- --template react-ts` form silently drops `--template` under PowerShell (you get the default vanilla-TS template — `main.ts`, no React deps). Use `npx --yes create-vite@latest <name> --template react-ts` instead (bypasses the broken `--` forwarding). Confirm the scaffolded `package.json` lists `react` + `react-dom` and `src/` has `main.tsx`/`App.tsx` before moving on.
>   2. Install runtime deps: `react-router-dom@^6`, `react-hook-form@^7`, `jspdf@^2` (used for the ticket PDF in Story 5). Note: **no** `@react-pdf/renderer`, **no** `embla-carousel`, **no** `react-icons` — this build uses jsPDF, a CSS scroll-snap carousel, and inline-SVG icons (all per the prototype).
>   3. CSS Modules need no extra dep — Vite handles `*.module.css` natively.
>   4. Create folder structure under `src/`: `pages/`, `components/`, `hooks/`, `lib/`, `styles/`, `types/`. Add a `.gitkeep` in each empty folder.
>   5. Replace the Vite default `App.tsx` with a stub that renders `<div>NEXTRUN — setup OK</div>`. Delete the now-unused `src/App.css` (the demo styles ship with the scaffold and are no longer imported). Leave `src/index.css` and `src/main.tsx` as-is — Step 2 rewires both.
>   6. Set `index.html` `<title>` to "NEXTRUN". Also rename `package.json` `"name"` from the scaffold default to `"nextrun"`.
>   7. Add path alias `"@/*": ["./src/*"]` to `tsconfig.app.json` under `compilerOptions.paths` (NOT `tsconfig.json`, which only holds project references in the latest scaffold). Do NOT add `baseUrl` — deprecated in TS 6.0; with `moduleResolution: "bundler"` paths resolve relative to the tsconfig. In `vite.config.ts` add matching `resolve.alias`: `"@": path.resolve(import.meta.dirname, "./src")` (Vite scaffolds config as ESM, so use `import.meta.dirname` — Node ≥20.11 — rather than `__dirname`, which does not exist in ESM).
>   8. Add to `.gitignore`: `node_modules`, `dist`, `.env`, `.env.local`. Do not overwrite existing `.gitignore` — append missing lines only.
>   9. Do NOT init git here — this project ships without a git repo. Leave that decision to the user.
> Acceptance: pure infrastructure, not a Story.
> Verify:
>   - `npm run dev` boots, browser shows the stub text at the printed localhost URL.
>   - `npm run build` passes (catches TS config issues early).
>   - `src/styles/tokens.css` does NOT exist yet — that comes in Step 2.
```

---

## Step 2 — Design tokens → CSS custom properties

**Decisions baked in this step:**
- All tokens live in `src/styles/tokens.css` as `:root` CSS custom properties. **Source of truth = [design_handoff_nextrun/assets/tokens.css](design_handoff_nextrun/assets/tokens.css)** — port it, don't re-invent values.
- **The theme is fixed: charcoal.** Copy only the `charcoal` token values into a flat `:root`; **drop** the prototype's `[data-theme="light"]` / `[data-theme="dusk"]` blocks and the runtime `--accent` override in `app.jsx` (those exist only for the prototype's design-exploration "tweaks panel", which we do NOT ship — see SPEC §6).
- Keep `data-theme="charcoal" data-density="regular"` on `<html>` so any ported component CSS that selects `[data-density="regular"]` (the event-grid gap) still resolves. There is no UI to change them.
- Typography is a **single family** — `Hanken Grotesk` (Google Fonts), weights 400/500/600/700/800. The type scale is a set of `--fs-*` / `--lh-*` / `--ls-*` vars (clamp-based display heading). No per-heading family/weight token explosion — one grotesk across the whole UI.
- Spacing (`--space-1..9`), radii (`--radius-sm/md/lg/pill/circle`), two shadows (`--shadow-1/2`), layout (`--container`, `--gutter`), and motion (`--ease`, `--dur`) all come straight from the prototype's `tokens.css`.

### Prompt 2.1 — Add font link + create tokens.css

```
> Context: design_handoff_nextrun/assets/tokens.css is the source of truth for every color/type/spacing/radius/shadow value. SPEC §2 commits styling to CSS Modules + CSS custom properties. Theme is FIXED to charcoal (SPEC §6) — no switcher.
> Goal: Reproduce the prototype's charcoal token set as `:root` custom properties and load Hanken Grotesk.
> Build:
>   1. In `index.html`: set the root element to `<html lang="en" data-theme="charcoal" data-density="regular">`. In `<head>`, immediately before `<title>`, add in this order:
>      - `<link rel="preconnect" href="https://fonts.googleapis.com" />`
>      - `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
>      - `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap" />`
>   2. Create `src/styles/tokens.css`. Copy the charcoal + shared blocks from `design_handoff_nextrun/assets/tokens.css` into a single `:root { ... }`. Required vars (exact values):
>      - Accent: `--accent: #f5d90a;` `--accent-strong: #ffe24d;` `--accent-ink: #15140f;` `--err: #ff6b6b;`
>      - Surfaces: `--bg: #100f0d;` `--surface: #1a1916;` `--surface-2: #232118;` `--surface-3: #2d2a20;`
>      - Lines: `--border: rgba(245,240,222,0.10);` `--border-strong: rgba(245,240,222,0.18);`
>      - Text: `--text: #f4f1e8;` `--text-muted: #a8a293;` `--text-faint: #6f6a5d;`
>      - Image treatment: `--img-filter`, `--img-filter-hover`, `--img-overlay` (copy verbatim — used by EventCard / banners).
>      - Type: `--font-sans: "Hanken Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif;` plus `--fs-display: clamp(2.6rem,4.4vw,4rem);` `--fs-h2: clamp(1.5rem,2.2vw,2rem);` `--fs-h3: 1.1875rem;` `--fs-body: 1rem;` `--fs-sm: 0.875rem;` `--fs-xs: 0.75rem;` and `--lh-tight: 1.05;` `--lh-snug: 1.2;` `--lh-body: 1.55;` `--ls-eyebrow: 0.28em;` `--ls-tight: -0.02em;`
>      - Spacing: `--space-1..9` = `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px`.
>      - Radii: `--radius-sm: 8px;` `--radius-md: 14px;` `--radius-lg: 22px;` `--radius-pill: 999px;` `--radius-circle: 50%;`
>      - Shadows: `--shadow-1`, `--shadow-2` (copy verbatim — two levels only).
>      - Layout: `--container: 1240px;` `--gutter: clamp(20px, 4vw, 56px);`
>      - Motion: `--ease: cubic-bezier(0.22, 0.61, 0.36, 1);` `--dur: 0.28s;`
>   3. Create `src/styles/global.css`: a tiny reset (box-sizing border-box; margin 0 on body/h1-h6/p; `line-height: var(--lh-body)` on body), set `body { background: var(--bg); color: var(--text); font-family: var(--font-sans); }`, and a base page-enter transition helper (`.view` / route wrapper): `opacity 0→1` + `translateY(10px→0)` over `0.34s var(--ease)` (SPEC / prototype page transition). Respect `@media (prefers-reduced-motion: reduce)` by disabling the transform.
>   4. In `src/main.tsx` replace the default `import "./index.css"` with `import "@/styles/tokens.css"; import "@/styles/global.css";` and delete `src/index.css`.
>   5. Do NOT port the `light`/`dusk` themes or any `localStorage`/tweaks logic — theme is fixed (SPEC §6).
> Acceptance: pure infrastructure.
> Verify:
>   - DevTools → Elements → `<html>` → Computed: `--bg` = `#100f0d`, `--accent` = `#f5d90a`.
>   - `<html>` carries `data-theme="charcoal"` and `data-density="regular"`.
>   - Network tab shows the Hanken Grotesk woff2 files loaded with HTTP 200.
>   - Page background is the warm near-black, text is warm white, after reload.
```

### Prompt 2.2 — Sanity-check swatch page (temporary)

```
> Context: tokens.css is in place after Prompt 2.1. Before building real pages, verify all tokens visually. NOTE: react-router is not installed yet (router comes in Step 5), so this debug page renders as the ENTIRE App.tsx content, not as a route.
> Goal: Render a temporary swatch page showing every token with its label and visual sample. Deleted in Step 11 (final cleanup).
> Build:
>   1. Create `src/pages/TokensDebug/TokensDebug.tsx` + `TokensDebug.module.css` (folder convention matches other pages).
>   2. Render four sections inside a single root `<div>` (on the charcoal `--bg`):
>      - **Surfaces & accent:** swatches for `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--accent`, `--accent-strong`, `--err` — each a colored square + hex + token name.
>      - **Text levels:** three lines `--text` / `--text-muted` / `--text-faint` on the surface color.
>      - **Typography:** one line per type role (display / h2 / h3 / body / small / eyebrow) in Hanken Grotesk, using the `--fs-*`, `--lh-*`, `--ls-*` vars. Eyebrow is UPPERCASE with `letter-spacing: var(--ls-eyebrow)`.
>      - **Radii & shadows:** four squares showing `--radius-sm/md/lg/pill`; two cards showing `--shadow-1` / `--shadow-2`.
>   3. Replace the Step 1 stub in `src/App.tsx`: `import TokensDebug from "@/pages/TokensDebug/TokensDebug"; export default function App() { return <TokensDebug />; }`. Step 4 replaces App.tsx again to add layout; Step 5 once more to add the router.
>   4. Mark `TokensDebug.tsx` with a top comment: `// DEBUG ONLY — deleted in Step 11.1 cleanup.`
> Acceptance: visual reference page only.
> Verify:
>   - Open the dev server root URL — the swatch page is what you see, on the warm near-black background.
>   - Accent swatch is warm yellow (`#f5d90a`).
>   - Display heading renders in Hanken Grotesk (heavier/rounder than the system fallback) and scales with viewport width (clamp).
>   - Pill radius on a 50px-tall element looks fully rounded; `--shadow-1` and `--shadow-2` are visibly distinct.
```

---

## Step 3 — MockAPI seed + env config

> **This step has two modes — pick one before continuing:**
>
> - **Mode A — Use the provisioned MockAPI (default for mentor reproduction).** The project author maintains a MockAPI project already populated with 7 seed events (5× `registration-open`, 1× `upcoming`, 1× `completed`). **Skip Prompts 3.1 and 3.2**; jump to Prompt 3.3 and use your own MockAPI projectId. (The project author's original projectId is intentionally **not** published here — see the *projectId exposure* note under *Notes for the operator*.) Event 1 (Mispo Winter Marathon) carries `anna.kowalski@example.com` as the de-dup test fixture for Story 4 — do NOT delete it.
> - **Mode B — Build from scratch (no shared infra).** Run Prompts 3.1, 3.2, 3.3 in sequence. You create your own MockAPI and seed the canonical 5 events below. Use this if the Mode A projectId is unreachable, or if you specifically want to exercise the seeding flow.
>
> Both modes converge at Prompt 3.3. Mode A is a strict superset of Mode B's seed data (same Event 1–5 structure + two extra `registration-open` events: Lisbon, Oslo), so downstream verify steps that name specific events (Mispo, Lviv, Berlin, Reykjavik, Tokyo) apply unchanged to both.

**Decisions baked in this step:**
- One MockAPI project, one resource `/events`. Schema matches `Event` from [SPEC §3.2](SPEC.md#L56-L100) — denormalized: `participants` array nested inside each event.
- 5 seed events: 3 `registration-open` + 1 `upcoming` + 1 `completed`. Mix of distances/prices/dates. 2 of them carry `subtitle`, others omit it (tests optional-field rendering).
- 1 event has 1 pre-existing participant with a known email — enables email de-dup testing in Story 4 without manual setup.
- `VITE_API_BASE_URL` lives in `.env` (gitignored). `.env.example` is committed with placeholder.
- **No `lib/api.ts` in this step** — lazy approach. The API client gets typed and added in Story 1 when the first `fetchEvents()` call actually happens. This step ends with raw MockAPI accessible via browser/curl.

### Prompt 3.1 — MockAPI project + schema *(Mode B only — skip if using the provisioned MockAPI from Mode A)*

This prompt is **operator-driven**, not code-driven — Claude cannot create the MockAPI project for the user. The user does it through MockAPI.io UI. Claude's role is the checklist + JSON template.

```
> Context: Project needs a backing REST API. SPEC §3.2 defines the Event schema (denormalized: participants nested). Free MockAPI.io account required.
> Goal: Create one MockAPI project with one /events resource, schema configured to accept the Event shape.
> Build (operator steps, not code):
>   1. Sign up at mockapi.io (free tier).
>   2. Create a new project. Note its project ID — it becomes part of the URL: `https://{projectId}.mockapi.io/api/v1`.
>   3. In the project, add a resource named `events`.
>   4. Configure resource fields to match SPEC §3.2 `Event` type. MockAPI types: id (Object ID, auto — **MUST be present; the first field in the schema editor**), name (string), date (string — store ISO date), city (string), country (string), venue (string), subtitle (string, optional), description (string), bannerImage (string), status (string — values: upcoming|registration-open|completed), distances (Object, free-form JSON), participants (Object, free-form JSON).
>   5. Save the resource. MockAPI now exposes GET/POST/PUT/DELETE at `https://{projectId}.mockapi.io/api/v1/events`.
> Acceptance: pure infrastructure.
> Verify:
>   - `curl https://{projectId}.mockapi.io/api/v1/events` returns `[]` (empty array, HTTP 200).
>   - **id-field sanity probe:** POST a minimal test body (`{"name":"_probe","date":"x","city":"x","country":"x","venue":"x","description":"x","bannerImage":"x","status":"upcoming","distances":[],"participants":[]}`) and confirm the response JSON includes `"id": "<number>"`. If `id` is missing, the resource schema is broken — recreate it (Reset on MockAPI dashboard) before seeding. Delete the probe record after verifying.
>   - The project ID is noted and ready to be pasted into `.env` in Prompt 3.3.

> **Free-tier caveat — auto-generated string defaults.** MockAPI free tier auto-fills omitted string fields on POST with placeholder values like `"subtitle 1"` (no UI to disable — "Object template" is a paid feature). For genuinely-optional fields like `subtitle`, always send the field explicitly in the POST body: an empty string `""` for "no subtitle". The frontend treats falsy values (empty string, undefined, null) as absent. Never POST without the field — you'll get the placeholder stored in the DB and have to wipe + re-seed.
```

### Prompt 3.2 — Seed the 5 events *(Mode B only — skip if using the provisioned MockAPI from Mode A)*

```
> Context: MockAPI /events resource exists and is empty (verified in Prompt 3.1).
> Goal: Populate the resource with 5 seed events covering all status values, edge cases for optional fields, and pre-existing participants for de-dup testing.
> Build (operator steps + provided JSON):
>   1. For each event below, POST to `https://{projectId}.mockapi.io/api/v1/events` with the JSON body. Either via MockAPI's UI "Add" button (paste JSON), or via curl/Postman. MockAPI assigns `id` automatically — do NOT include it in POST bodies.
>   2. Distance IDs inside `distances[]` and Participant IDs inside `participants[]` MUST be set explicitly — use short stable strings like `"d1"`, `"p1"`. These get referenced in URLs (`?distance=:id`) and acceptance criteria.
>   3. Seed bodies:

EVENT 1 — registration-open, with subtitle, with 1 pre-existing participant
{
  "name": "Mispo Winter Marathon",
  "date": "2026-11-13",
  "city": "Athens",
  "country": "GR",
  "venue": "Panathenaic Stadium",
  "subtitle": "The classic seaside marathon — Athens to Marathon, in reverse.",
  "description": "A historic marathon following the original 490 BC route. Coastal scenery, late-autumn climate, established since 1972.",
  "bannerImage": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800",
  "status": "registration-open",
  "distances": [
    { "id": "d1", "label": "10 km",            "kilometers": 10,   "price": 35 },
    { "id": "d2", "label": "Half Marathon",    "kilometers": 21.1, "price": 55, "description": "Coastal route, certified by AIMS. Hydration every 3 km." },
    { "id": "d3", "label": "Full Marathon",    "kilometers": 42.2, "price": 80, "description": "Original 1896 Olympic route. Strict 6-hour cutoff." }
  ],
  "participants": [
    { "id": "p1", "email": "anna.kowalski@example.com", "firstName": "Anna",  "lastName": "Kowalski", "gender": "female", "dateOfBirth": "1992-03-14", "address": "ul. Słowackiego 12, Warsaw", "phone": "48501234567", "distanceId": "d2", "registeredAt": "2026-05-10T08:32:00Z" }
  ]
}

EVENT 2 — registration-open, no subtitle, no participants
{
  "name": "Lviv Half",
  "date": "2026-09-21",
  "city": "Lviv",
  "country": "UA",
  "venue": "Rynok Square",
  "subtitle": "",
  "description": "City-centre half marathon through the cobbled Old Town. Flat profile, autumn weather, festival atmosphere.",
  "bannerImage": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
  "status": "registration-open",
  "distances": [
    { "id": "d1", "label": "5 km",          "kilometers": 5,    "price": 15 },
    { "id": "d2", "label": "Half Marathon", "kilometers": 21.1, "price": 30 }
  ],
  "participants": []
}

EVENT 3 — registration-open, with subtitle, no participants
{
  "name": "Reykjavik Midnight Run",
  "date": "2026-06-21",
  "city": "Reykjavik",
  "country": "IS",
  "venue": "Laugardalur Park",
  "subtitle": "Solstice run under the midnight sun.",
  "description": "Annual solstice race starting at 22:00. Daylight through the entire course. Volcanic landscape backdrop.",
  "bannerImage": "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800",
  "status": "registration-open",
  "distances": [
    { "id": "d1", "label": "10 km",         "kilometers": 10,   "price": 45,  "description": "Out-and-back along the harbour." },
    { "id": "d2", "label": "Half Marathon", "kilometers": 21.1, "price": 70 }
  ],
  "participants": []
}

EVENT 4 — upcoming (registration not yet open)
{
  "name": "Tokyo Spring Marathon",
  "date": "2027-03-07",
  "city": "Tokyo",
  "country": "JP",
  "venue": "Tokyo Metropolitan Government Building",
  "subtitle": "",
  "description": "World Marathon Major candidate course. Registration opens Q3 2026.",
  "bannerImage": "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800",
  "status": "upcoming",
  "distances": [
    { "id": "d1", "label": "Full Marathon", "kilometers": 42.2, "price": 120 }
  ],
  "participants": []
}

EVENT 5 — completed (past race, for status-disabled UI testing)
{
  "name": "Berlin Autumn Run",
  "date": "2025-10-05",
  "city": "Berlin",
  "country": "DE",
  "venue": "Brandenburg Gate",
  "subtitle": "",
  "description": "Annual flat-and-fast certified course. World-record attempts welcome.",
  "bannerImage": "https://images.unsplash.com/photo-1452960962994-acf4fd70b632?w=800",
  "status": "completed",
  "distances": [
    { "id": "d1", "label": "Half Marathon", "kilometers": 21.1, "price": 50 },
    { "id": "d2", "label": "Full Marathon", "kilometers": 42.2, "price": 90 }
  ],
  "participants": []
}

> Acceptance: pure infrastructure.
> Verify:
>   - `curl https://{projectId}.mockapi.io/api/v1/events` returns array of 5 events, **every one carrying a non-empty `id`** (sanity-check of the schema fix from Prompt 3.1).
>   - `curl https://{projectId}.mockapi.io/api/v1/events/1` returns Event 1 (Mispo Winter Marathon) with its participant nested inside.
>   - Subtitle distribution: 2 events have non-empty `subtitle` (Mispo, Reykjavik); 3 have `"subtitle": ""` (Lviv, Tokyo, Berlin). All 5 carry the field — never omit it (see Prompt 3.1 caveat).
>   - Statuses present: 3× registration-open, 1× upcoming, 1× completed.
```

### Prompt 3.3 — `.env` + `.env.example`

```
> Context: MockAPI project ID is known. SPEC §2 commits to Vite — env vars must be prefixed `VITE_` to reach the browser.
> Goal: Wire the API base URL into the project via env files, without committing the real URL.
> Build:
>   1. Create `.env` at project root with:
>      VITE_API_BASE_URL=https://{projectId}.mockapi.io/api/v1
>      - **Mode A:** substitute the project author's provisioned projectId (not published — see *projectId exposure* note).
>      - **Mode B:** substitute the projectId you created in Prompt 3.1.
>   2. Create `.env.example` at project root with the same key, but placeholder value:
>      VITE_API_BASE_URL=https://YOUR_PROJECT_ID.mockapi.io/api/v1
>   3. Verify `.gitignore` (created in Step 1) already includes `.env`, `.env.local`, `.env.*.local`. If not — append them.
>   4. Add a TypeScript declaration so `import.meta.env.VITE_API_BASE_URL` is typed: create `src/types/env.d.ts` with:
>      interface ImportMetaEnv { readonly VITE_API_BASE_URL: string; }
>      interface ImportMeta { readonly env: ImportMetaEnv; }
>   5. Do NOT create `lib/api.ts` yet — that comes in Step 5 (Story 1) when the first fetch is actually needed (lazy approach).
> Acceptance: pure infrastructure.
> Verify:
>   - `.env` exists in project root with the real projectId and is matched by an entry in `.gitignore` (the project ships without a git repo, but if you later run `git init`, `git status` must NOT show `.env`).
>   - `.env.example` exists at project root with the placeholder (and is the file mentor checks into version control if they git-init).
>   - In any `.tsx` file, typing `import.meta.env.VITE_` autocompletes with `VITE_API_BASE_URL` — confirms `env.d.ts` is picked up.
>   - Smoke check: add `console.log(import.meta.env.VITE_API_BASE_URL)` temporarily in `App.tsx`, run dev server, confirm the correct URL appears in the browser console. Remove the console.log after.
```

### Notes for the operator

- MockAPI free tier limits: 1 project, ~4 resources, ~50 records per resource. Mode B uses 1 resource × 5 records; Mode A uses 1 resource × 7 records. Both well within limits.
- The pre-existing participant in Event 1 (`anna.kowalski@example.com`) is the de-dup test fixture for [SPEC Story 4 AC](SPEC.md#L334-L337) — submitting Checkout with that email must trigger "You are already registered for this event". **Mode A operators:** do not delete Anna from Event 1, or Story 4's de-dup AC will silently pass (see ACCEPTANCE §0 warning).
- **Mode A side effect:** any Story 4 walkthrough (Checkout submit) writes a real participant to the shared MockAPI. Across multiple mentor reproductions this accumulates — the project author should periodically prune unknown participants from `/events/*/participants`, keeping `p1` (Anna) on Event 1.
- **Mode A projectId exposure:** MockAPI free tier has no auth — anyone with the projectId can POST/DELETE on `/events`. Because this repo is **public**, no live projectId is published here: the deployed GitHub Pages demo runs against bundled static seed data (`src/lib/demoEvents.ts`, `VITE_STATIC_DEMO=true`) instead of a live backend. To reproduce Mode A against a real MockAPI, create your own project (Prompt 3.1) and keep its projectId in your local `.env` only (gitignored).
- **MockAPI URL prefix variation:** Some MockAPI projects default to `https://{projectId}.mockapi.io/:endpoint` (no `/api/v1/` prefix). Our prompts assume `/api/v1/` everywhere. If your MockAPI dashboard shows `:endpoint`, go to project settings and add `/api/v1` as the prefix — otherwise substitute the base URL globally in `.env`. The seed JSON and code work either way; just keep `.env` and your MockAPI dashboard consistent.

---

## Step 4 — Global layout (PageHeader + Footer)

**Decisions baked in this step:**
- **No global Header chrome.** There is no app-level navigation bar. `<AppLayout>` is just `<main>{children}</main><AppFooter />`, with an inner `.container` (max-width `var(--container)` = 1240px, padding-inline `var(--gutter)`).
- **Two top-row patterns** (see the prototype):
  - **Home** uses a `topbar` = `<Brand />` (left) + `<SearchBar />` (right). No "Events Details"-style label. (SearchBar is built in Step 6; Brand here.)
  - **Details / Checkout / Confirmation / 404** use a reusable `<PageHeader label="…" />` = an eyebrow-style label on the left + a `Back` button on the right.
- **Back button** = the prototype's `.back-btn` pill: left-arrow icon + the word "Back", UPPERCASE (`text-transform: uppercase`, `letter-spacing: 0.08em`). At rest it sits on `var(--surface-2)` with a `var(--border-strong)` hairline; on hover it fills accent (`background: var(--accent); color: var(--accent-ink)`) and the arrow nudges left. Port verbatim from `assets/screens.css` — do not re-derive. Per [SPEC Stories 3/4/5](SPEC.md#L217-L402), always navigates to `/` (Home), never browser history.
- **Footer** is identical on all pages and both viewports, on the dark surface (NOT a colored band). Two columns on desktop: left = `<Brand />` + a one-line blurb; right = a "Contact" column with phone / email / address rows. Below, a `footer-bottom` row: `© 2026 NEXTRUN. A learning project.` + `Built from SPEC.md · charcoal / yellow`. Port copy verbatim from the prototype's `Footer` in `assets/components.jsx`.
- **Brand mark asset:** the runner silhouette is a raster image (`runner.png`) shown via CSS on `.brand__mark`. Copy it from the handoff — no Figma/SVG extraction needed.
- **Icons** are inline SVG (no icon library). Port the `Icon` set from the prototype once (Prompt 4.1) and reuse everywhere.

### Prompt 4.1 — Brand mark asset + inline-SVG Icon set

```
> Context: The NEXTRUN brand mark (runner silhouette) appears in the Home top bar and the Footer. Icons throughout are inline SVG — the prototype defines an `Icon` map in assets/components.jsx and extends it in assets/screens.jsx. No icon library is used.
> Goal: Have the runner image and a shared `Icon` component ready for every later step.
> Build:
>   1. Copy `design_handoff_nextrun/assets/runner.png` to `src/assets/runner.png`. (The `rabbit.png` alternate mark is NOT used — skip it. `runner-yellow.svg` is only referenced by the prototype's browser-print path; jsPDF in Step 9 draws a text wordmark, so it is not needed.)
>   2. Create `src/components/Icon/Icon.tsx` exporting a single `Icon` object whose keys are function components, ported VERBATIM from the prototype — merge both maps: from `assets/components.jsx` (`search, pin, flag, arrow, close, phone, mail`) and from `assets/screens.jsx` (`back, chevron, cal, route, alert, check, download`). Each spreads `{...props}` onto its `<svg>` so callers can pass `className` / `style` / `aria-hidden`. Strokes already use `currentColor` — color comes from the parent.
>   3. Typing: props `React.SVGProps<SVGSVGElement>`. Keep each `viewBox` and path `d` exactly as in the prototype (do not re-draw).
> Acceptance: pure asset prep.
> Verify:
>   - `src/assets/runner.png` exists.
>   - Rendering `<Icon.arrow />` inside colored text shows the prototype's right-arrow glyph, inheriting the surrounding `color`.
>   - `<Icon.back />`, `<Icon.search />`, `<Icon.check />` render without console warnings.
```

### Prompt 4.2 — `AppLayout` + `AppFooter`

```
> Context: Steps 1-3 complete. CSS Modules + CSS custom properties available. Runner image + Icon set from Prompt 4.1. Source of truth for footer markup/copy/CSS: the `Footer` component + `.site-footer` rules in the prototype (assets/components.jsx, assets/styles.css).
> Goal: Create the page wrapper (`AppLayout`) and the global `AppFooter` component, used on every route.
> Build:
>   1. Create `src/components/AppLayout/AppLayout.tsx` + `AppLayout.module.css`.
>      - Layout: vertical flex column, min-height 100vh. `<main className={s.main}>{children}</main>` grows to fill (`flex: 1`), `<AppFooter />` sits at the bottom of the document flow.
>      - Provide a shared `.container` (max-width `var(--container)` = 1240px, `margin-inline: auto`, `padding-inline: var(--gutter)`) — pages use it for their content width. Expose it as a small `Container` component or a reusable class, mirroring the prototype's `.container`.
>   2. Create `src/components/AppFooter/AppFooter.tsx` + `AppFooter.module.css`. Port from the prototype's `Footer` (do NOT invent copy):
>      - **Build `Brand` from Prompt 4.3 first** — the footer's left column renders `<Brand />`. Explicit forward dependency: do Prompt 4.3 step 1 before finishing here.
>      - Background: the dark surface (NOT a colored band). Inside a `.container`, a two-column inner row on desktop that stacks on mobile:
>        - Left: `<Brand />` + a one-line blurb, verbatim: "Find your next race. Browse marathons, trail runs and city classics — then register in a couple of taps."
>        - Right: a "Contact" column (`<h4>Contact</h4>`) with three rows, each = an `Icon` + text: `<Icon.phone/> +1 (405) 732-5617`, `<Icon.mail/> hello@nextrun.run`, `<Icon.pin/> 98 Winn St, Woburn, MA 01801`.
>      - A `footer-bottom` row (full container width, color `var(--text-faint)`, top border `var(--border)`): left `© 2026 NEXTRUN. A learning project.`, right `Built from SPEC.md · charcoal / yellow`.
>      - All footer text uses the warm text tokens (`var(--text)` / `var(--text-muted)` / `var(--text-faint)`). No Lorem Ipsum.
>   3. Install BrowserRouter context now (needed for the Back button's `useNavigate` in Prompt 4.3). Replace `src/App.tsx`:
>      ```
>      import { BrowserRouter } from "react-router-dom";
>      import { AppLayout } from "@/components/AppLayout/AppLayout";
>      import TokensDebug from "@/pages/TokensDebug/TokensDebug"; // still here from Step 2; replaced in Step 5
>      export default function App() {
>        return (
>          <BrowserRouter>
>            <AppLayout>
>              <TokensDebug />
>            </AppLayout>
>          </BrowserRouter>
>        );
>      }
>      ```
>      Step 5 will replace `<TokensDebug />` with the real `<Routes>` block — but BrowserRouter stays.
> Acceptance: pure infrastructure.
> Verify:
>   - Dev server root URL still shows the TokensDebug page (from Step 2), now with the NEXTRUN footer below it on the dark surface.
>   - Footer matches the prototype: Brand + blurb on the left, "Contact" column on the right, the `footer-bottom` line at the very bottom.
>   - On mobile width (DevTools responsive 428px), the two columns stack and the footer stays full-width on the dark surface.
>   - Footer does NOT scroll independently — it sits at the bottom of the document flow.
>   - DevTools React tab → `<BrowserRouter>` visible as an ancestor of TokensDebug.
```

### Prompt 4.3 — `Brand` + `PageHeader` + back button

```
> Context: AppLayout + AppFooter exist. Source of truth: the prototype's `Brand` (assets/components.jsx) and `PageHeader` + `.back-btn` (assets/screens.jsx). Inner screens render a label + Back row; Home renders Brand + SearchBar instead.
> Goal: Build `Brand`, the reusable `PageHeader`, and the back button used by Details / Checkout / Confirmation / 404.
> Build:
>   1. Create `src/components/Brand/Brand.tsx` + module CSS. Port the prototype's `Brand`:
>      - Markup: a `<Link to="/">` containing `<span className={s.mark} />` (the runner mark) + the wordmark `NEXTRUN` followed by a bold accent dot — `NEXTRUN<b>.</b>` where the `.` is `color: var(--accent)`.
>      - The mark renders `@/assets/runner.png` via CSS (`background-image` or `mask` + `background: currentColor`) sized as in the prototype's `.brand__mark--runner` (styles.css). One size; the Footer may render it slightly larger via a prop/consumer override.
>   2. Create the back control (`src/components/BackButton/BackButton.tsx`, or inline it in PageHeader — it has one consumer). Port `.back-btn` VERBATIM from `assets/screens.css`: an `<Icon.back />` + the word "Back". Styling — `color: var(--text)`, `background: var(--surface-2)`, `border: 1px solid var(--border-strong)`, `border-radius: var(--radius-pill)`, UPPERCASE with `letter-spacing: 0.08em`, `font-weight: 700`. Hover fills accent (`background: var(--accent); color: var(--accent-ink); border-color: var(--accent)`) and the arrow shifts `translateX(-3px)`; `:active` scales to `0.97`. Behavior: `useNavigate()` → `navigate("/")`.
>   3. Create `src/components/PageHeader/PageHeader.tsx` + module CSS. Port `.page-head`:
>      - Props: `label: string`, `showBack?: boolean` (default true). Back always goes Home, so the component owns the `useNavigate()` call.
>      - Layout: flex row, space-between — `label` on the left (eyebrow style per `.page-head__label`: small, `--text-muted`, can be UPPERCASE with `letter-spacing: var(--ls-eyebrow)`), the back control on the right.
>      - Used by the INNER screens only. Home does NOT use it (it has the Brand + SearchBar topbar from Steps 5–6).
>   4. Each inner page (Steps 7–10) renders `<PageHeader label="…" />` at the top of its content. Labels: "Events Details", "Checkout", "Confirmation Ticket", "Error".
> Acceptance: pure infrastructure. Verified visually in each subsequent Step.
> Verify:
>   - In `App.tsx`, temporarily replace `<TokensDebug />` with `<><PageHeader label="Events Details" /><div style={{padding:24}}>Layout test placeholder</div></>` (no router needed yet — just an App content swap).
>   - "Events Details" label on the left, a "← Back" pill on the right (uppercase, on `--surface-2`; fills accent yellow on hover).
>   - Click Back → URL bar changes to `/` (page doesn't change yet — no routes; `useNavigate` works inside BrowserRouter from Prompt 4.2).
>   - Render `<Brand />` somewhere: shows the runner mark + `NEXTRUN` with a yellow `.`.
>   - Restore App.tsx to `<TokensDebug />` after verification (Step 5 replaces it with the real router).
```

### Notes for Step 4

- The footer copy is real NEXTRUN copy (blurb + contact rows) ported verbatim from the prototype — no Lorem Ipsum, no placeholder emails to "fix".
- The 404 page (Step 10) uses `<PageHeader label="Error" />` AND renders an in-content "Back to Home" button — matching the prototype's `NotFoundScreen` (the header keeps its Back control; the big CTA lives in the body).
- We deliberately do NOT add a hamburger menu / mobile nav drawer — there are no nav links to put in it (no About / Contact pages, per SPEC §6). On mobile the Home topbar simply wraps (Brand above, SearchBar below).

---

## Step 5 — Story 1: Browse upcoming events (Listing, `/`)

**References:** [SPEC §5 Story 1](SPEC.md#L139-L176), the prototype's `HomeScreen` (`assets/app.jsx`), `EventCard` + `CarouselDots` (`assets/components.jsx`) and `.event-grid` / `.event-card*` rules (`assets/styles.css`).

**Decisions baked in this step:**
- First real route + first real API call. `lib/api.ts` is created here (lazy commitment from Step 3).
- TypeScript types for `Event`, `Distance`, `Participant`, `EventStatus`, `Gender` move from SPEC into `src/types/event.ts` (single source for the codebase).
- `EventCard` extracted as a component now — 12 instances on the Listing page, clear need.
- Mobile carousel uses **CSS scroll-snap** (no library), exactly like the prototype: the same `.event-grid` becomes a horizontal scroll-snap row under 1024px, and a `CarouselDots` component (ported from `assets/components.jsx`) reads `scrollLeft` to track the active dot and `scrollTo`s on click. No Embla, no react-slick.
- Loading state = custom CSS skeleton (no library). Empty/error states = plain text + retry button.
- No CSS-in-JS for skeleton animation — plain `@keyframes` in module CSS.
- Routing: Step 4 already wired `<BrowserRouter><AppLayout><TokensDebug /></AppLayout></BrowserRouter>`. This Step replaces `<TokensDebug />` with `<Routes>...</Routes>` — only `/` route active (real Listing component), others are placeholder elements until their respective Steps build them.
- Type tokens are `--fs-*` (size), `--lh-*` (line-height), `--ls-*` (letter-spacing) over the single `--font-sans` family — there are **no** per-heading `--font-h1-*` family/weight vars (that was the old design). Grep `tokens.css` when authoring module CSS so you reference vars that actually exist.

### Prompt 5.1 — Routing skeleton + types + `lib/api.ts`

```
> Context: Step 4 added <AppLayout> wrapping a stub. Now we set up the real router and create the typed API client that all Stories will share. SPEC §3.2 defines the Event schema; §4 defines all routes.
> Goal: Wire react-router-dom properly, declare all 5 routes (with placeholders for non-Listing routes), and create a typed `fetchEvents()` function.
> Build:
>   1. Create `src/types/event.ts` exporting the types from SPEC §3.2 verbatim:
>      - `EventStatus = "upcoming" | "registration-open" | "completed"`
>      - `Gender = "male" | "female" | "other"`
>      - `Distance = { id: string; label: string; kilometers: number; price: number; description?: string; }`
>      - `Participant = { id: string; email: string; firstName: string; lastName: string; gender: Gender; dateOfBirth: string; address: string; phone: string; distanceId: string; registeredAt: string; }`
>      - `Event = { id: string; name: string; date: string; city: string; country: string; venue: string; subtitle?: string; description: string; bannerImage: string; status: EventStatus; distances: Distance[]; participants: Participant[]; }`
>   2. Create `src/lib/api.ts`:
>      - Read base URL from `import.meta.env.VITE_API_BASE_URL`. Guard at module load: if the value is falsy, `throw new Error("VITE_API_BASE_URL is not set. Copy .env.example to .env and fill in your MockAPI project ID.")`. Without this, a missing `.env` produces a cryptic `fetch undefined/events` failure deep in the call stack — the explicit throw fails fast with a fix instruction (helps the mentor reproduce without debugging env loading).
>      - Export `async function fetchEvents(): Promise<Event[]>` — GET `{base}/events`, throws on non-2xx.
>      - Do NOT add `fetchEvent(id)`, `registerParticipant(...)`, etc. yet — added when their Steps need them (lazy).
>      - Keep dependency-free: native `fetch`, no axios. The whole client is 15-20 lines.
>      - Wrap network errors in a typed `class ApiError extends Error { status?: number; }` so callers can distinguish network vs HTTP errors.
>      - **Add a boundary guard `isValidEvent(e: unknown): e is Event`** that returns `true` only when `Array.isArray(e.distances) && Array.isArray(e.participants)`. In `fetchEvents`, filter the response through it; `console.warn` if any rows were dropped. In `fetchEvent` (added in Step 7), throw `new ApiError("Event has malformed data", 404)` on a failed guard. **Why:** MockAPI's "+ Add" UI auto-fills array fields as `{}` not `[]` when the operator clicks the convenience button — this crashes any `.map`/`.find` downstream and produces a blank page. The guard prevents that landmine without spreading defensive checks across components. (Added after the operator hit this exact issue during the build.)
>   3. Update `src/App.tsx` — keep BrowserRouter + AppLayout from Step 4, replace `<TokensDebug />` with the real Routes block:
>      - Import `Routes, Route` from react-router-dom.
>      - Import `Listing` from `@/pages/Listing/Listing` (created in Prompt 5.3, two prompts below — for now use a temp stub so TS compiles, or write all of 5.1→5.3 in the same session before testing).
>      - Render inside AppLayout:
>        ```
>        <Routes>
>          <Route path="/" element={<Listing />} />
>          <Route path="/events/:id" element={<div>Details — TBD Step 7</div>} />
>          <Route path="/events/:id/checkout" element={<div>Checkout — TBD Step 8</div>} />
>          <Route path="/events/:id/confirmation/:participantId" element={<div>Confirmation — TBD Step 9</div>} />
>          <Route path="*" element={<div>404 — TBD Step 10</div>} />
>        </Routes>
>        ```
>      - Delete the `<TokensDebug />` import. The TokensDebug page file itself is kept in `src/pages/TokensDebug/` until Step 11.1 cleanup — useful as a quick sanity reference if a token regression shows up.
>   4. Verify `npm run build` and `npm run dev` still pass (placeholders are intentionally not real components yet — TS just needs them to type-check).
> Acceptance: pure infrastructure.
> Verify:
>   - `npm run dev` boots without TS errors.
>   - Visiting `/events/anything` shows "Details — TBD Step 7" (placeholder works).
>   - Visiting `/garbage-path` shows "404 — TBD Step 10".
>   - Footer still renders on every route (AppLayout wrapping is intact).
```

### Prompt 5.2 — `EventCard` component

```
> Context: Listing renders one EventCard per registration-open event in a grid. Source of truth: the prototype's `EventCard` (assets/components.jsx) + `.event-card*` rules (assets/styles.css). Helpers `minPrice`, `fmtDate`, `COUNTRY` are defined there too.
> Goal: Build a self-contained `<EventCard event={...} />` matching the prototype.
> Build:
>   1. Create `src/components/EventCard/EventCard.tsx` + `EventCard.module.css`.
>   2. Props: `{ event: Event }`. The whole card navigates to `/events/${event.id}` — wrap it in `<Link>` (or a button + `useNavigate`); `text-decoration: none; color: inherit`.
>   3. Structure (port from the prototype):
>      - `.event-card__media` — the banner `<img loading="lazy">` at **16:11** aspect ratio, with the charcoal image treatment (`filter: var(--img-filter)`), plus two overlays:
>        - `.event-card__date` (top-left): a date badge — bold day number over the short month, e.g. `14` / `JUN`. Derive from `fmtDate(event.date)` → `{ day, mon }`.
>        - `.event-card__flag` (top-right): the status flag — render ONLY when `event.status !== "registration-open"`; text `Finished` (completed) or `Soon` (upcoming). Hidden for open events.
>        - On image error, swap to a `.event-card__ph` placeholder (the prototype tracks an `imgOk` state).
>      - `.event-card__body`:
>        - `.event-card__title` — event name (h3 role, `--fs-h3`).
>        - Two meta rows: `<Icon.pin/> {city}, {COUNTRY[country] ?? country}` and `<Icon.flag/> {distances.length} distances · {fmtDate(date).full}`.
>        - `.event-card__foot`: `.event-card__price` = "Starting at" + a bold `$` + `minPrice(event)` + " USD"; and `.event-card__go` = a circular button holding `<Icon.arrow/>`.
>   4. Helpers — extract a shared `src/lib/formatDate.ts` exporting `fmtDate(iso)` → `{ day, mon, full }` exactly as the prototype's `fmtDate` (full = e.g. `14 Jun 2026 (Sun)`, built from `new Date(iso + "T00:00:00")`). `minPrice(event)` = `Math.min(...event.distances.map(d => d.price))` (SPEC §3.3). Port the `COUNTRY` ISO-2→name map to `src/lib/country.ts` (Details / Confirmation / PDF reuse it), and **extend it with the ISO codes the seed data actually uses** — the prototype's map only covers its own demo countries and omits ours. Add at minimum `GR`/`UA`/`JP` (Mode B seed) plus `PT`/`NO` (Mode A's Lisbon + Oslo); otherwise those cards render the raw code (e.g. "Athens, GR") instead of "Athens, Greece". Consumers keep the `?? country` fallback so any remaining miss still degrades gracefully.
>   5. Hover (desktop, `@media (hover: hover)`): card lifts (`translateY`), image un-greys/zooms (`filter: var(--img-filter-hover)` + slight `scale`), title → `var(--accent)`, the `.event-card__go` arrow → accent. Transitions use `var(--dur)` / `var(--ease)`.
>   6. Equal heights: `display: flex; flex-direction: column; height: 100%`, and push `.event-card__foot` to the bottom with `margin-top: auto` so price rows align across the grid row (and across carousel cards on mobile).
>   7. Icons are decorative → `aria-hidden="true"`.
> Acceptance: foundation for SPEC §5 Story 1 AC "each card shows: banner image, name, city + country, date, Starting at $X (minPrice in USD)".
> Verify (after 5.3 wires it up):
>   - Cards in a row have equal height even if one name wraps to 2 lines; the price row stays bottom-aligned.
>   - Date badge shows day + short month; the meta date reads like `14 Jun 2026 (Sun)`.
>   - "Starting at $X USD" uses the event's cheapest distance.
>   - registration-open cards show NO status flag.
>   - Hover: card lifts, image brightens/zooms, title + arrow turn yellow.
>   - Clicking anywhere on the card navigates to `/events/{id}` (TBD placeholder until Step 7).
```

### Prompt 5.3 — Listing page (desktop grid, fetch, all states)

```
> Context: EventCard + lib/api.ts + routing exist. Now build the Listing page that orchestrates them.
> Goal: Implement `/` route per SPEC §5 Story 1 — desktop 3-column grid with header, subtitle, filter+sort, all four states (loading/empty/error/success).
> Build:
>   1. Create `src/pages/Listing/Listing.tsx` + `Listing.module.css`.
>   2. Top of page: a `topbar` row inside `.container` — `<Brand />` on the left, `<SearchBar />` on the right (SearchBar is wired in Step 6; leave a placeholder slot until then). Home does NOT use `<PageHeader />`.
>   3. Below the topbar, an `events-head` block: the display heading `<h1 className={s.title}>All Events <em>You've Got</em></h1>` — `--fs-display`, weight 800; the `<em>You've Got</em>` is set in `var(--accent)` (yellow), non-italic.
>   4. Next to / under the heading: the count `<p><b>{count}</b> Listing Found</p>` where count = filtered events length (`--fs-sm`, muted; the number in `--text`). Show only when `status === "success"` (during loading/error the count is misleading).
>   5. State machine using `useState`:
>      - `status: "loading" | "error" | "success"` (initial: `"loading"`)
>      - `events: Event[]` (filtered + sorted result, default `[]`)
>      - **Do NOT** add an `error: ApiError | null` state. We don't render `error.message` anywhere (only the static "Couldn't load events." line), so the variable would be unused — `tsconfig.app.json` has `noUnusedLocals: true`, build fails. If a future Story needs to surface the message, add the state then.
>   6. Data loading — split into two paths to avoid the `react-hooks/set-state-in-effect` lint error (enabled by `eslint-plugin-react-hooks` v7+; bans synchronous `setState` inside `useEffect` body):
>      - Helper (module-level or above the component): `function load(setEvents, setStatus) { fetchEvents().then(/* filter + sort, setEvents, setStatus("success") */).catch(/* setStatus("error") */); }`. Important: the helper itself does NOT call `setStatus("loading")` — all its setState calls live inside async `.then`/`.catch` callbacks, which the lint rule allows.
>      - On mount: `useEffect(() => { load(setEvents, setStatus); }, []);` — body invokes the helper but never directly calls setState.
>      - Retry handler (event-driven, so synchronous setState is allowed): `const retry = () => { setStatus("loading"); load(setEvents, setStatus); };`.
>      - Filter: `(e) => e.status === "registration-open"`. Sort: `(a, b) => a.date.localeCompare(b.date)` (ISO strings sort lexicographically = chronologically).
>   7. Render based on status:
>      - **loading:** render `<ListingSkeleton />` (Prompt 5.4).
>      - **error:** render `<div role="alert">` with text "Couldn't load events." + `<button onClick={retry}>Retry</button>`. Retry resets to loading and re-fetches.
>      - **success + empty:** render `<p>No races yet — check back soon</p>` (exact wording from SPEC §5 Story 1 AC).
>      - **success + non-empty:** render the grid (desktop) or carousel (mobile, Prompt 5.5).
>   8. Desktop grid (≥1024px): `.event-grid` = CSS Grid, `grid-template-columns: repeat(3, 1fr)`, gap driven by the density token — `[data-density="regular"]` → `gap: clamp(20px, 2.2vw, 32px)` (compact `16px`, comfy `40px`); copy the density rules from the prototype's styles.css.
>   9. Mobile (<1024px): the SAME `.event-grid` becomes a horizontal scroll-snap carousel via a media query (Prompt 5.5) — no separate component swap. A `<CarouselDots />` (Prompt 5.5) is rendered below it and is visible only on mobile (CSS).
>  10. Page width comes from the shared `.container` (max-width `var(--container)`, padding-inline `var(--gutter)`) — no extra page-level horizontal padding needed.
> Acceptance: SPEC §5 Story 1 AC for desktop grid + all four states + sort + filter + count subtitle.
> Verify:
>   - Hard-refresh `/` — see skeleton for ~0.5-1s, then registration-open cards only. Mode B → 3 cards (Mispo, Lviv, Reykjavik). Mode A → 5 cards (adds Lisbon, Oslo). In both modes, Tokyo (upcoming) and Berlin (completed) do NOT appear.
>   - Cards sorted by date ascending. Mode B → Reykjavik (Jun 21) → Lviv (Sep 21) → Mispo (Nov 13). Mode A → Reykjavik (Jun 21) → Lisbon (Aug 14) → Oslo (Sep 5) → Lviv (Sep 21) → Mispo (Nov 13).
>   - Subtitle: "3 Listing Found" (Mode B) or "5 Listing Found" (Mode A).
>   - Disable network in DevTools → click Retry button → error state shows. Re-enable → Retry → loads.
>   - **Mode B only:** In MockAPI delete all events temporarily → empty state shows "No races yet — check back soon" → re-seed. (Mode A operators: skip — would wipe the shared seed. Empty-state branch is covered by code review of the `success && length===0` path in `Listing.tsx`.)
```

### Prompt 5.4 — Loading skeleton component

```
> Context: Listing's loading state needs a skeleton, not a blank screen, per SPEC §5 Story 1 AC.
> Goal: Build a CSS-only skeleton that mimics the grid layout — gray rounded boxes where banner/text/price will go.
> Build:
>   1. Create `src/components/ListingSkeleton/ListingSkeleton.tsx` + module CSS.
>   2. Render 6 skeleton cards (matches what the user sees above-the-fold on desktop, prevents layout shift on success).
>   3. Each skeleton card mirrors EventCard structure:
>      - Banner-shaped box (same 16:11 aspect ratio), `border-radius: var(--radius-md)`.
>      - 2-3 bars under it (title, metadata lines).
>      - 1 wider bar for the price row.
>   4. Skeleton color: base `var(--surface)` with a `linear-gradient` shimmer sweeping through `var(--surface-2)` (charcoal — the skeleton must read on the dark `--bg`, not as light-gray boxes). `@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }`, ~1.2s infinite. Respect `prefers-reduced-motion`.
>   5. Cards use the same `.event-grid` layout as the real Listing (`repeat(3, 1fr)` desktop, density gap) so the success state slides in without layout jump.
> Acceptance: visual loading affordance, SPEC §5 Story 1 AC "loading skeleton (not a blank screen)".
> Verify:
>   - Throttle network to Slow 3G in DevTools → reload `/` → see shimmering skeleton for several seconds before real cards appear.
>   - Skeleton grid positions match real grid (no jump on success).
```

### Prompt 5.5 — Mobile carousel (CSS scroll-snap + dots)

```
> Context: SPEC §5 Story 1 AC: under 1024px, cards become a horizontal scroll-snap carousel with dot indicators. Source of truth: the prototype's `.event-grid` mobile rules (assets/styles.css) + `CarouselDots` (assets/components.jsx). No carousel library.
> Goal: Make the same `.event-grid` scroll horizontally with snap under 1024px, and add a `CarouselDots` indicator below it.
> Build:
>   1. **No new dependency.** Port the prototype's mobile `.event-grid` rules into `Listing.module.css`: under `@media (max-width: 1023px)`, turn the grid into a single-row horizontal scroller — `display: flex` (or `grid-auto-flow: column`), `overflow-x: auto`, `scroll-snap-type: x mandatory`; each card gets `scroll-snap-align: start` at ~85% width so the next card peeks. Hide the scrollbar. On desktop it stays the 3-column grid from Prompt 5.3.
>   2. Create `src/components/EventCarousel/CarouselDots.tsx` + module CSS — port the prototype's `CarouselDots`:
>      - Props: `{ count: number; gridRef: React.RefObject<HTMLElement> }`.
>      - One `<button>` per card. Active index derived from the grid's `scroll` event: `active = Math.round(scrollLeft / step)`, `step = card.offsetWidth + columnGap`. Clicking a dot does `scrollTo({ left: step*i, behavior: "smooth" })`.
>      - a11y: each dot `aria-label={`Go to card ${i+1}`}` and `aria-current={i === active}`.
>      - **Avoid `react-hooks/set-state-in-effect`**: the `useEffect` only *subscribes* to the scroll listener (passive) and cleans up — it never calls `setState` synchronously in its body. Initialise `useState(0)` for the active index.
>   3. In `Listing.tsx`: put one `gridRef` on the `.event-grid` (`<div className={s.grid} ref={gridRef}>…cards…</div>`), then render `<CarouselDots count={filtered.length} gridRef={gridRef} />` below it. Dots are styled to show only under 1024px (`display:none` on desktop) — no JS branch needed. (No `useMediaQuery` / JS viewport check — the grid↔carousel switch is pure CSS.)
> Acceptance: SPEC §5 Story 1 AC for the mobile carousel + dot pagination.
> Verify:
>   - At DevTools 428px: cards are a horizontal scroll-snap row, the next card peeks, dots sit below.
>   - Swipe / drag-scroll advances cards and the active dot follows; clicking a dot scrolls to that card.
>   - At ≥1024px: 3-column grid, dots hidden.
>   - Resize through 1024px — layout swaps cleanly (pure CSS).
>   - Card heights stay equal across the row (EventCard `height: 100%` + `margin-top:auto` on the foot).
```

### Notes for Step 5

- `lib/api.ts` stays intentionally minimal. We resist adding `fetchEvent(id)` here even though we know Step 7 will need it — adding it before its consumer means inventing return-shape decisions without context. Locality > forecasting.
- Date format `14 Jun 2026 (Sun)` comes straight from the prototype's `fmtDate` (`assets/components.jsx`). Port it verbatim — don't re-derive the Intl options.
- Home has **no eyebrow / PageHeader**: the top of the page is the Brand + SearchBar topbar, then the `All Events You've Got` display heading (with `You've Got` in accent) and the `{n} Listing Found` count.
- Why no carousel / skeleton library: the carousel is CSS scroll-snap + a ~30-line dots component, and the skeleton is ~30 lines of CSS. `embla-carousel`, `react-slick`, `react-loading-skeleton` are all unnecessary weight here. YAGNI.

---

## Step 6 — Story 2: Search by name

**References:** [SPEC §5 Story 2](SPEC.md#L178-L215), the prototype's `SearchBar` (`assets/components.jsx`) + `.search*` rules (`assets/styles.css`).

**Decisions baked in this step:**
- Search bar is **Home-only**, placed in the Home topbar to the right of `<Brand />` (Step 5.3). There is no global Header.
- Filter logic: substring match, case-insensitive, `.trim()` outer whitespace, preserve inner whitespace. Exact behavior per SPEC §5 Story 2 AC.
- URL sync via `useSearchParams()` from react-router-dom. Empty query → `q` param removed entirely from URL (not left as `?q=`). *(The static prototype keeps the query in local state only; in the real router-based app we sync to `?q=` so the search is deep-linkable / refresh-safe per SPEC Story 2.)*
- Pre-fill from URL on mount → controlled input bound to URL state.
- Distinct empty state: when query non-empty AND zero matches → "No events match your search" + a "Clear search" CTA (distinct from Listing's "No races yet" empty state).
- No debounce. Filter runs synchronously on every keystroke. Justified: data is already in memory (5–20 events, post-fetch), filter cost is negligible. Adding debounce would delay the URL update, which would feel sluggish.
- A11y: `role="search"` on the form, `aria-label="Search races by name"` on the input, `aria-label="Clear search"` on the clear (×) button, `aria-label="Search"` on the decorative submit button, `aria-hidden="true"` on icons.

### Prompt 6.1 — `SearchBar` component

```
> Context: The Home topbar needs a search pill to the right of the Brand. Source of truth: the prototype's `SearchBar` + `.search*` rules.
> Goal: Build a pill-shaped controlled search input with a clear (×) button and a decorative search button.
> Build:
>   1. Create `src/components/SearchBar/SearchBar.tsx` + module CSS.
>   2. Props: `{ value: string; onChange: (next: string) => void; placeholder?: string }`. Controlled, no internal state.
>   3. Layout: a `<form className={s.search} role="search" onSubmit={e => e.preventDefault()}>` pill on `var(--surface-2)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-pill)`, with an accent focus ring (`var(--accent)` / `--border-strong`). **Note:** the prototype's `.search` CSS uses `var(--surface)`, but ACCEPTANCE §1.1 ("SearchBar pill on `--surface-2`") is the bar — use `var(--surface-2)` and do NOT port the prototype's `--surface` here. Inside:
>      - `.search__input` — text input, transparent background, `color: var(--text)`, placeholder `var(--text-faint)`, `--fs-body`. Placeholder "Search races by name…".
>      - `.search__clear` — a `<button type="button">` with `<Icon.close/>`, rendered ONLY when `value` is non-empty; clicking it calls `onChange("")`. `aria-label="Clear search"`.
>      - `.search__btn` — a decorative `<button type="submit">` with `<Icon.search/>` (`aria-label="Search"`, `tabIndex={-1}`). No behavior — filtering is live via onChange; the form `preventDefault`s Enter.
>   4. Icons `aria-hidden="true"`.
> Acceptance: visual + controlled input. Filtering logic lives in the parent (Listing/Home).
> Verify (after 6.2 wires it):
>   - Pill on the dark surface; focus shows an accent ring.
>   - Typing fires onChange; the × clear button appears once there's text and clears on click.
>   - Pressing Enter does nothing visible (no reload, no console error).
```

### Prompt 6.2 — Wire SearchBar to Listing (URL sync + filter)

```
> Context: SearchBar exists. Listing page (Prompt 5.3) currently shows all registration-open events sorted by date. Now we filter by `?q=...` URL param.
> Goal: Make the Listing page filter events by name substring per SPEC §5 Story 2 AC, with full URL ↔ input sync.
> Build:
>   1. In `Listing.tsx`, import `useSearchParams` from react-router-dom.
>   2. `const [searchParams, setSearchParams] = useSearchParams();` — `q = searchParams.get("q") ?? ""`.
>   3. Wire SearchBar:
>      - `<SearchBar value={q} onChange={(next) => updateQuery(next)} />`
>      - `updateQuery(next)`: trim outer whitespace; if result empty → call `setSearchParams({})` (REMOVE q entirely, not set to ""); else → `setSearchParams({ q: next })`. Preserve inner whitespace, do NOT trim it.
>      - Critical detail: setSearchParams with an empty object actually clears all params. If you write `setSearchParams({ q: "" })`, URL becomes `?q=` which violates SPEC §5 Story 2 AC. Test this.
>   4. Filter chain in the render body (between fetch result and display):
>      - Start from `events` (the fetched + status-filtered list from Step 5).
>      - If `q.trim()` is non-empty: filter `e.name.toLowerCase().includes(q.trim().toLowerCase())`.
>      - Sort by date as before.
>   5. Place SearchBar in the Home topbar:
>      - Edit `Listing.tsx`: render it to the right of `<Brand />` in the topbar row — `<SearchBar value={q} onChange={updateQuery} />`.
>   6. The count "{count} Listing Found" now reflects the FILTERED count, not the total. Match SPEC §5 Story 1 AC + Story 2 implicit behavior.
> Acceptance: SPEC §5 Story 2 full AC.
> Verify:
>   - Type "Marathon" → only `registration-open` events with "Marathon" in name appear. Mode B → Mispo only (Tokyo and Berlin both match the substring but are filtered by status). Mode A → Mispo + Oslo (Oslo Fjord Marathon is also registration-open).
>   - Type "Half" → matches Event 2 "Lviv Half" (substring on the event *name*, not distance labels). NOTE: do NOT expect zero results here — "Lviv Half" contains "Half". To exercise the no-results empty state from Prompt 6.3, use a query that matches no event name, e.g. "Trail" or "zzz".
>   - Type "  Marathon  " (whitespace padding) → still matches Event 1 (outer trimmed).
>   - Type "Mispo Winter" → matches Event 1 (inner whitespace preserved).
>   - URL updates live: typing "Marathon" → `/?q=Marathon`. Clearing field → `/` (no `?q=`).
>   - Reload `/?q=Marathon` → SearchBar pre-filled with "Marathon", events pre-filtered.
>   - Browser back button works through the search history.
```

### Prompt 6.3 — Distinct empty state for "no search matches"

```
> Context: Listing has TWO empty states now: "no events at all" (Story 1) and "no matches for search" (Story 2). They must be visually + textually distinct.
> Goal: Render the right empty-state copy based on whether a search is active.
> Build:
>   1. In `Listing.tsx`, when status="success" AND filtered events length is 0:
>      - If `q.trim()` is non-empty: render the prototype's `.state` empty block — a heading `No events <em>match your search</em>` (the `<em>` in accent), a line "Try a different name, or clear the search to see every race.", and a primary "Clear search" button that calls `updateQuery("")`.
>      - Else: render `<p>No races yet — check back soon</p>` (per SPEC §5 Story 1 AC).
>   2. Style both as a centered block: body text `var(--text-muted)`, the heading in `var(--text)`, generous vertical padding.
> Acceptance: SPEC §5 Story 2 AC "this is distinct from the 'No races yet' state in Story 1".
> Verify:
>   - Type a non-matching query → "No events match your search".
>   - **Mode B only:** temporarily delete all 5 events in MockAPI → reload `/` with empty query → "No races yet — check back soon" → re-seed events. (Mode A operators: skip — would wipe the shared seed. The empty-state branch is identical to Story 1's, already covered.)
```

### Notes for Step 6

- Why no debounce: with 5–20 events in memory, filtering on every keystroke is sub-millisecond. Debounce only helps when filter is expensive (server-side search, large lists). Adding it here delays the URL update for no benefit.
- Why preserve inner whitespace: SPEC §5 Story 2 explicitly tests "Half Marathon" matches "Half Marathon" but not "HalfMarathon". A naive `.replace(/\s+/g, "")` would break this.

---

## Step 7 — Story 3: Event Details (`/events/:id`)

**References:** [SPEC §5 Story 3](SPEC.md#L217-L283), the prototype's `DetailScreen` + `DistanceRow` (`assets/screens.jsx`) and `.detail*` / `.register*` / `.distance-card*` rules (`assets/screens.css`).

**Decisions baked in this step:**
- New API call → `fetchEvent(id)` added to `lib/api.ts` now (lazy commitment matures — Step 5 deferred it, this Step needs it).
- **Two-column layout:** a full-width banner, then a body split into the description (left, ~60%) and a **sticky** Register panel (right, ~40%). The panel holds the distance cards + the CTA. Collapses to a single column under 1024px (panel un-sticks).
- `<DistanceCard>` extracted — multiple instances, clear pattern.
- Each DistanceCard has its own `open` state for the "More information" toggle. State is local per card (not lifted) because SPEC §5 Story 3 AC says "expanding one card does NOT collapse others".
- Selected distance state is page-level (only one selected at a time → lift to parent).
- Register CTA gating: enabled only when `status === "registration-open"` AND a distance is selected; the label varies by status.
- 404 redirect (not just an error message) when the event ID is invalid — `<Navigate to="/not-found" replace />`.

### Prompt 7.1 — Extend `lib/api.ts` with `fetchEvent(id)`

```
> Context: Step 5 created `lib/api.ts` with only `fetchEvents()`. Details page needs to fetch a single event by ID.
> Goal: Add `fetchEvent(id)` to the typed API client.
> Build:
>   1. In `src/lib/api.ts`, export `async function fetchEvent(id: string): Promise<Event>`.
>   2. GET `${base}/events/${id}`. On 404, throw `new ApiError("Event not found", 404)` — caller distinguishes by `error.status === 404`.
>   3. On other non-2xx → throw `ApiError` with status set. On network failure → throw generic `ApiError` without status.
>   4. Do NOT alter `fetchEvents()` — keep the additions additive.
> Acceptance: pure infrastructure.
> Verify:
>   - In a console snippet: `fetchEvent("1")` returns Event 1 with full distances + participants arrays.
>   - `fetchEvent("9999")` throws ApiError with status 404.
```

### Prompt 7.2 — `DistanceCard` component

```
> Context: The Register panel lists distances as cards (radio + label + price + km + collapsible description). Source of truth: the prototype's `DistanceRow` (assets/screens.jsx) + `.distance-card*` rules (assets/screens.css).
> Goal: Build a reusable DistanceCard that owns its own expand state and emits selection upward.
> Build:
>   1. Create `src/components/DistanceCard/DistanceCard.tsx` + module CSS.
>   2. Props: `{ distance: Distance; selected: boolean; onSelect: () => void; disabled?: boolean }`.
>   3. The card root is a bordered card (`var(--radius-md)`), clickable (`onClick` → `onSelect()` when not disabled), `role="radio"` `aria-checked={selected}` `aria-disabled={disabled}`, classes `is-selected` / `is-disabled`. **Keyboard a11y (the prototype's plain `<div onClick>` is NOT keyboard-operable — do not port that gap):** when enabled, add `tabIndex={0}` and an `onKeyDown` that selects on Enter / Space (`preventDefault` Space to stop the page scrolling); when disabled, `tabIndex={-1}`. Give the root a `:focus-visible` accent ring (`box-shadow: 0 0 0 4px color-mix(in oklch, var(--accent) 22%, transparent)`). This satisfies ACCEPTANCE §3.4 ("focus ring visible on every interactive element"; role=radio + aria-checked + aria-disabled).
>      - `.distance-card__top` (row): a custom `.radio` dot, `.distance-card__name` (the label, ~`--fs-h3`), and `.distance-card__price` (`{price} USD`, in `var(--accent)`).
>      - `.distance-card__km`: `{fmtKm(kilometers)} Km` (small, muted). `fmtKm` formats whole numbers as `NN.00` (port the prototype's helper).
>      - If `distance.description` exists: a `.distance-card__more` toggle ("More information" + `<Icon.chevron/>` that rotates via `.is-open`) and, when open, a `.distance-card__desc` block. The toggle `stopPropagation`s so it doesn't also select the card. Label stays "More information" (the chevron conveys state) — do NOT flip to "Hide".
>   4. Expansion: local `const [open, setOpen] = useState(false)` — per SPEC "expanding one card does NOT collapse others".
>   5. Selected look: `var(--accent)` border + a filled accent radio dot. Disabled: dimmed, radio not interactive, card click is a no-op. The "More information" toggle stays usable even when disabled (you can still read the description).
> Acceptance: SPEC §5 Story 3 AC for distance cards + More information toggle.
> Verify (after 7.3 wires it):
>   - Click a card → its radio fills (accent), others clear.
>   - Click "More information" → only that card's description appears; chevron rotates; other cards unchanged; that click does NOT select the card.
>   - On an upcoming/completed event, cards look disabled and selection is a no-op.
>   - Keyboard: Tab focuses each enabled card (visible accent ring); Enter / Space selects the focused card; disabled cards are skipped by Tab.
```

### Prompt 7.3 — Details page

```
> Context: api.ts has fetchEvent, DistanceCard exists, router has the `/events/:id` route as a TBD placeholder (from Prompt 5.1). Now build the real page.
> Goal: Implement Details per SPEC §5 Story 3 — page header, metadata, banner, distances, REGISTER button with status gating, 404 on invalid ID.
> Build:
>   1. Create `src/pages/Details/Details.tsx` + module CSS. Replace the placeholder in `App.tsx`.
>   2. Read `:id` from URL: `const { id } = useParams<{ id: string }>();`.
>   3. State machine (same shape as Listing):
>      - `status: "loading" | "error" | "notFound" | "success"` (semantic name; avoid numeric literal `"404"` in TS unions).
>      - `event: Event | null`
>      - On mount: fetchEvent(id). On `ApiError` with status 404 → set `status="notFound"` → render `<Navigate to="/not-found" replace />` (Step 10 will create that route). Other errors → status="error". Success → status="success".
>      - **Fetch wiring follows the Step 5 (Listing) pattern to avoid `react-hooks/set-state-in-effect`** (enforced by `eslint-plugin-react-hooks` v7+, fails CI):
>        a. Define `load` at **module level**, signature `(id, setEvent, setStatus, setSelectedDistanceId) => void`. Inside, only call setters from `.then`/`.catch` callbacks (the rule allows async setState).
>        b. Initial `useState<Status>(() => (id ? "loading" : "notFound"))` — lazy initializer derives the start state from URL so the effect never has to set `"loading"` synchronously.
>        c. Effect body is just `if (!id) return; load(id, setEvent, setStatus, setSelectedDistanceId);` — no direct setState. Deps `[id]`.
>        d. Retry handler (event handler, sync setState allowed): `const retry = () => { if (!id) return; setStatus("loading"); load(...); };`. Wire `<button onClick={retry}>Retry</button>`.
>   4. Layout (port the prototype's `DetailScreen`):
>      - `<PageHeader label="Events Details" />`.
>      - Event title `<h1 className={s.title}>` (large display weight).
>      - `.detail-meta` row (small icons in `var(--text-faint)`): `<Icon.pin/> {city}, {COUNTRY[country] ?? country}`, `<Icon.cal/> {fmtDate(date).full}`, `<Icon.route/> {distance labels, sorted by km, comma-joined}`. Reuse `fmtDate` (`@/lib/formatDate`) and the `COUNTRY` map from Step 5.
>      - `.detail-banner`: full-width banner image at ~21:9 (img + `imgOk` placeholder fallback), `var(--radius-lg)`, with the charcoal image treatment.
>      - `.detail-body`: a two-column grid (≈60% / 40%, `gap: var(--space-6)`); the right column is **sticky** on desktop:
>        - Left `<div>`: optional `.detail-subtitle` (`<h2>`, the event tagline) above `.detail-desc` — render `event.description.split("\n\n")` as `<p>` paragraphs.
>        - Right `<aside className={s.register} role="radiogroup" aria-label="Choose a distance">`: `.register__head` "Register"; `.register__hint` = "Pick a distance to continue to checkout." when open, else the status label + "."; `.distance-list` of `<DistanceCard>` for each distance **sorted by `kilometers` ascending**; then `.register__cta` holding the button.
>      - CTA (`btn--primary btn--lg`), full-width in the panel, state-aware label:
>        - `registration-open` + a distance selected → enabled "Register" → `onClick` navigates to `/events/${id}/checkout?distance=${selectedDistanceId}`.
>        - `registration-open` + nothing selected → disabled "Register".
>        - `upcoming` → disabled "Registration not open yet".
>        - `completed` → disabled "Event finished".
>   5. Selected distance state lives in Details: `const [selectedDistanceId, setSelectedDistanceId] = useState<string | null>(null);`. Reset to null when event changes.
>   6. Loading state → a small `<DetailsSkeleton />` inline sub-component (charcoal shimmer — same `.shimmer` keyframe as Listing): title bar, meta line, banner block, then a two-column body sketch (~3 description lines + ~3 distance-row placeholders). Wrap it `aria-hidden="true"`.
>   7. Error state (non-404) → `<div role="alert">Couldn't load event.<button>Retry</button></div>`.
> Acceptance: SPEC §5 Story 3 full AC.
> Verify:
>   - Navigate to `/events/1` (Event 1 = Mispo Winter Marathon, registration-open) — page renders fully.
>   - Distances sorted: 10 km (10) → Half Marathon (21.1) → Full Marathon (42.2).
>   - REGISTER disabled until a radio is selected. Selecting one enables it.
>   - "More Information" only appears on cards with description (Half Marathon + Full Marathon in Event 1, NOT the 10 km card).
>   - Navigate to `/events/4` (Event 4 = Tokyo, upcoming) — radios gray, REGISTER reads "Registration not open yet".
>   - Navigate to `/events/5` (Event 5 = Berlin, completed) — REGISTER reads "Event finished".
>   - Navigate to `/events/9999` — redirected to `/not-found` (Step 10 placeholder until then).
>   - Click REGISTER on a valid selection → navigates to `/events/1/checkout?distance=d1` (or d2/d3).
>   - Mobile (DevTools 428px): the two-column body collapses to one column (description, then the Register panel — no longer sticky), banner full-width, distance cards stacked, CTA full-width.
```

### Notes for Step 7

- The distance cards + Register panel come straight from the prototype's `DetailScreen` / `DistanceRow` — port the markup and the `.detail*` / `.register*` / `.distance-card*` CSS rather than re-deriving spacing. **One deliberate override:** the prototype collapses `.detail-body` to one column at `max-width: 800px`, but SPEC / ACCEPTANCE §1.3 require one column **under 1024px**. Use `@media (max-width: 1023px)` (matching the Listing carousel breakpoint) for the body→single-column + `.register { position: static }` + banner aspect change — do NOT copy the prototype's 800px.
- We do NOT show the participants list on Details (per SPEC §5 Story 3 AC — "no participants section in the design").
- The fetched event is NOT cached or shared with Step 5's Listing. Listing → Details → back to Listing re-fetches. Acceptable for a learning project; production would use TanStack Query or an in-memory cache.
- `DetailsSkeleton` is an inline sub-component inside Details.tsx (one consumer); the Listing skeleton has its own file because a top-level page uses it.
- The sticky Register panel uses `position: sticky; top: …` on desktop only; under 1024px it un-sticks and the body becomes one column. CTA hover/disabled states come from the shared `.btn` rules. These are prototype-faithful refinements; safe to rough-in on the first pass.

---

## Step 8 — Story 4: Checkout (`/events/:id/checkout?distance=:d`)

**References:** [SPEC §5 Story 4](SPEC.md#L285-L358), the prototype's `CheckoutScreen` + `validate()` + `FormField` (`assets/screens.jsx`) and `.checkout-bar` / `.form` / `.field` / `.radio-pill` rules (`assets/screens.css`).

**Decisions baked in this step:**
- React Hook Form (RHF) drives the form state. Zod or yup NOT used — RHF's built-in `register` rules cover what SPEC needs. (The prototype uses one imperative `validate()` function; we keep the same rules but express them as RHF per-field rules.)
- `<FormField>` primitive built here (one component for all single-input rows: label + input + per-field error). Specialty inputs (DOB, gender pills, phone) get their own components.
- **Error ownership contract:** `FormField` is the **single source of truth** for rendering the error message and the label. Custom widgets (`DOBPicker`, `GenderRadio`, `PhoneInput`) accept `invalid?: boolean` — they use it only for visual styling and `aria-invalid`. They MUST NOT render the error text themselves (otherwise errors double-render and screen readers announce duplicates). Enforce by typing the prop `boolean`, not `string`.
- **Error color:** use the existing `var(--err)` token (`#ff6b6b`, already in tokens.css) — no new token needed.
- **Latin-only text validation (SPEC §7):** Email, First Name, Last Name, and Address reject non-Latin input, because the ticket PDF (jsPDF/Helvetica, Step 9) cannot render Cyrillic. Patterns (port from the prototype's `validate()`): First/Last Name `/^[a-zA-Z\s\-']+$/`; Address `/^[a-zA-Z0-9\s\-',./]+$/`. For Email, the prototype's ASCII test `/^[\x00-\x7F]+$/` trips ESLint's `no-control-regex` (the `\x00` literal) — **do NOT port that regex**; use an equivalent array check instead: `[...v.trim()].every((c) => c.charCodeAt(0) <= 127)` (applied in addition to the email-format check). Message for all: `"Latin characters only (a–z)"`.
- Email de-dup happens **at submit time**, not on blur. Reason: catching it on blur leaks server state to the client preemptively; submit-time check matches the SPEC AC exactly ("When I submit the form, Then I see...").
- Submit flow: PUT entire event back to MockAPI with appended participant. MockAPI doesn't have a "nested append" endpoint — we read-modify-write the whole event document. Idempotency considered: the loading state on the Register button + button disabled during submit prevents double-clicks per SPEC AC.
- Email de-dup happens **at submit time**, not on blur. Reason: catching it on blur leaks server state to the client preemptively; submit-time check matches the SPEC AC exactly ("When I submit the form, Then I see...").
- Submit flow: PUT entire event back to MockAPI with appended participant. MockAPI doesn't have a "nested append" endpoint — we read-modify-write the whole event document. Idempotency considered: the loading state on the REGISTER button + button disabled during submit prevents double-clicks per SPEC AC.
- Participant ID generated client-side at submit time using `crypto.randomUUID()`.
- DOB stored as ISO `YYYY-MM-DD` string, computed from Day/Month/Year selects.
- Phone input: HTML `inputMode="numeric"` + `onChange` sanitizer that strips non-digits. Paste handler runs the same sanitizer.

### Prompt 8.1 — Extend `lib/api.ts`: `registerParticipant`

```
> Context: Submitting Checkout needs to append a participant to an event on MockAPI. The schema is denormalized — participants are nested inside the event document.
> Goal: Add `registerParticipant(eventId, participant)` that performs a read-modify-write against `/events/:id`.
> Build:
>   1. In `src/lib/api.ts`, export `async function registerParticipant(eventId: string, participant: Participant): Promise<Event>`.
>   2. Implementation:
>      a. `const event = await fetchEvent(eventId);` — get current state.
>      b. `const updated = { ...event, participants: [...event.participants, participant] };`
>      c. PUT `${base}/events/${eventId}` with body `updated`, Content-Type `application/json`.
>      d. Return the updated event from response.
>   3. Document the race condition: between read and write, another client could append a different participant; MockAPI doesn't support optimistic concurrency. For this learning project we accept the risk. Add a comment in the function: `// Note: read-modify-write has a known race condition; acceptable for this project's traffic profile.`
>   4. Do NOT add separate `fetchEvents`/`fetchEvent` changes — additive only.
> Acceptance: pure infrastructure.
> Verify:
>   - Manually POST a test participant via console: `registerParticipant("1", { id: "test-1", email: "test@example.com", ... })` → MockAPI now shows 3 participants on Event 1 (the 2 seeded + the test).
>   - Delete the test participant from MockAPI UI after verification.
```

### Prompt 8.2 — `FormField` + DOB + Gender primitives

```
> Context: Checkout has 7 form fields with diverse shapes (text, email, radio, three coupled selects, multiline-ish address, sanitized phone). Building shared primitives keeps the page clean.
> Goal: Create reusable form input primitives that integrate with React Hook Form.
> Build:
>   1. Install: `npm i react-hook-form` (already in Step 1 deps).
>   2. Create `src/components/FormField/FormField.tsx` + module CSS.
>      - Props: `{ label: string; htmlFor?: string; required?: boolean; error?: string; children: ReactNode }`. Include `htmlFor` so the `<label>` associates with its control (the prototype's FormField did this via `id`; keep it for a11y). Default `required` to `true` — all 7 Checkout fields are required.
>      - Renders: label row (`<label htmlFor={htmlFor}>` with a red `*` if required), then children (input), then error text (red, `role="alert"`, only if `error` provided).
>      - The actual `<input>` is passed as `children`, FormField is wrapper-only. This keeps RHF's `register("email", {...})` spread close to the input where TS infers types.
>   3. Inside FormField the input uses the prototype's `.input` look: background `var(--surface-2)`, `1px solid var(--border)`, `border-radius: var(--radius-pill)`, padding ~`12px 18px`, `color: var(--text)`, placeholder `var(--text-faint)`, `--fs-body`; focus → accent ring (`border-color: var(--accent)` / `--border-strong`). Invalid → a `.has-error` red border (`var(--err)`). Define `.input` once and reuse via `className={s.input}` from consumer pages. The error text is `var(--err)`, `--fs-sm`, with `role="alert"`.
>   4. Create `src/components/DOBPicker/DOBPicker.tsx` + module CSS.
>      - **Presentational only**, matching the prototype: the three parts live in the parent's form state and the ISO is assembled at submit — there is NO ISO-emitting picker and NO internal local state fighting RHF. (This is simpler than holding a parsed ISO inside the widget and avoids the "partial selection gets wiped" class of bug entirely.)
>      - Props: `{ day: string; month: string; year: string; onChange: (part: "day" | "month" | "year", value: string) => void; invalid?: boolean }`. `invalid` is `boolean` only — FormField owns the message (Error ownership contract).
>      - Three `<select>` in a row: Day (placeholder `DD`, options 1–31), Month (placeholder `MM`, options January–December with values 1–12), Year (placeholder `YYYY`, current year down to −100). Bind each `value=` to its prop; fire `onChange(part, value)` on change. Placeholders are the short `DD`/`MM`/`YYYY` forms on every viewport (matches the prototype).
>      - **Select styling:** port `.select` from the prototype's `screens.css` — it already sets `appearance: none` + a custom light chevron (inline-SVG `background-image`) with the right `padding-right`, and tightens padding/gap at small widths. Keep `font-size ≥ 16px` (smaller triggers iOS Safari zoom-on-focus). Without `appearance: none`, Windows Chrome shows a grey native arrow.
>   5. Create `src/components/GenderRadio/GenderRadio.tsx`.
>      - Props: `{ value: Gender | ""; onChange: (g: Gender) => void; invalid?: boolean; name?: string; id?: string }`. (Same `invalid: boolean` contract.)
>      - Three inline `.radio-pill` chips (Male / Female / Other) per the prototype: each a `<label>` wrapping a visually-hidden `<input type="radio">`, a custom `.radio` dot, and the text; the selected chip gets `.is-on` (accent border + filled dot).
>      - Use `invalid` ONLY for `aria-invalid` and an error-border class. Do NOT render any error `<p>` — FormField owns the message.
>   6. Create `src/components/PhoneInput/PhoneInput.tsx`.
>      - Props: `{ value: string; onChange: (digitsOnly: string) => void; invalid?: boolean; id?: string }`. (Same `invalid: boolean` contract.)
>      - Return a bare `<input>` — NOT a fragment with `<input>` + error `<p>`. FormField owns the message.
>      - `<input type="text" inputMode="numeric" />` — `inputMode="numeric"` triggers mobile numeric keypad without imposing tel-format restrictions.
>      - onChange handler: `const sanitized = e.target.value.replace(/\D/g, ""); onChange(sanitized);` — strips ALL non-digit characters, including those from paste.
>      - Per SPEC §5 Story 4 AC clarification: blocks letters, spaces, `+`, `-`, `(`, `)` at input. Verify by trying to type letters → nothing appears in the field.
> Acceptance: foundation primitives for Prompt 8.3.
> Verify (after 8.3 wires them):
>   - Tab through FormFields, labels and red asterisks align consistently.
>   - DOBPicker: pick Month=March alone (leave Day/Year empty) → the Month select continues to display "March" (NOT reverts to "Month" placeholder). This catches the local-state regression.
>   - DOBPicker: select Day=31, Month=February, Year=2025 → Day select snaps to 28 (visible, not just internal).
>   - DOBPicker: the select caret is the custom light chevron — no grey native OS arrow visible.
>   - DOBPicker on mobile (DevTools device mode, iPhone 14 / 360px): the three selects fit in one row with "DD" / "MM" / "YYYY" placeholders, no clipping by the chevron padding.
>   - Submit Checkout empty → each field shows exactly ONE "This field is required" message (NOT two). Catches the FormField-vs-widget dup.
>   - PhoneInput: paste "+1 (555) 010-1234" → field shows "15550101234".
```

### Prompt 8.3 — Checkout page

```
> Context: All form primitives + api.registerParticipant exist. Replace the `/events/:id/checkout` route placeholder with the real page.
> Goal: Implement the 7-field Checkout form per SPEC §5 Story 4 — header, fields, full validation, email de-dup at submit, loading state, redirect on success.
> Build:
>   1. Create `src/pages/Checkout/Checkout.tsx` + module CSS. Replace the placeholder in App.tsx.
>   2. Read params: `const { id } = useParams<{ id: string }>(); const [searchParams] = useSearchParams(); const distanceId = searchParams.get("distance");`.
>   3. On mount: `fetchEvent(id)`. Same state machine as Details — and crucially, the same module-level `load` + lazy-init pattern that avoids `react-hooks/set-state-in-effect` (see Prompt 7.3 step 3). After fetch:
>      - If `!distanceId` OR distanceId not in `event.distances.map(d => d.id)` → `<Navigate to={`/events/${id}`} replace />` (per SPEC AC).
>      - Else find the matching distance.
>   4. Layout (port the prototype's `CheckoutScreen`):
>      - `<PageHeader label="Checkout" />`.
>      - `.checkout-bar`: the event name on the left (`--fs-h2`) and the selected distance label on the right (a chip / `--text-muted`). Read-only confirmation of what's being registered; spans the content width.
>      - Form column: a centered `.form` (max-width ~680–720px) on `var(--surface)` (card-like), `var(--radius-lg)`, padding `--space-6`.
>      - Subsection label `<p className="form__section">Your Information</p>` (small, `--text-muted`, eyebrow-ish).
>      - The 7 fields, in SPEC §5 Story 4 order:
>        1. Email (`<input type="email">`)
>        2. First Name + Last Name in a `.field-row` (50/50 desktop, stacked mobile)
>        3. Gender (GenderRadio via Controller). Pass `invalid={Boolean(errors.gender)}`.
>        4. Date of Birth — three RHF fields `dobDay` / `dobMonth` / `dobYear` rendered through `<DOBPicker>`. Wire the values with **`useWatch({ control, name })`** (one per part) and push changes back via `setValue(name, value, { shouldValidate: isSubmitted })`. **Do NOT read them with the destructured `watch('dobDay')` inside JSX** — that trips `react-hooks/incompatible-library` (the React Compiler can't memoize `watch()`); `useWatch` is the memo-safe API. Pass `invalid={Boolean(errors.dobDay || errors.dobMonth || errors.dobYear)}`; show one message under the row (`errors.dobDay?.message || errors.dobMonth?.message || errors.dobYear?.message`).
>        5. Address (plain text input)
>        6. Phone (PhoneInput via Controller). Pass `invalid={Boolean(errors.phone)}`.
>      - Register button (`btn--primary btn--lg`), full-width on mobile. Label "Register"; while submitting → a `.spinner` + "Registering…", disabled.
>   5. Validation rules via RHF `register(name, { ... })` (mirror the prototype's `validate()`):
>      - All fields: `required: "This field is required"`.
>      - Email: format `pattern: /^[^@]+@[^@]+\.[^@]+$/` → "Invalid email format"; PLUS an ASCII check — `validate: v => [...v.trim()].every(c => c.charCodeAt(0) <= 127) || "Latin characters only (a–z)"`. (Do NOT use the prototype's `/^[\x00-\x7F]+$/` regex — ESLint `no-control-regex` rejects it; the array check is equivalent.)
>      - First Name / Last Name: `pattern: { value: /^[a-zA-Z\s\-']+$/, message: "Latin characters only (a–z)" }`.
>      - Address: `pattern: { value: /^[a-zA-Z0-9\s\-',./]+$/, message: "Latin characters only (a–z)" }`.
>      - DOB: `dobDay` / `dobMonth` / `dobYear` each `required`. The cross-field date rule lives in a `validate` on `dobYear` that reads all three via `getValues`: build `new Date(+year, +month-1, +day)`; if in the future → "Date of birth must be in the past"; if age on `event.date` < 16 → "You must be at least 16 years old to register" (precise: `eventYear - dobYear - (event m/d < dob m/d ? 1 : 0)`). Surface that single message under the DOB row.
>      - Phone validate: `(v) => /^\d{8,15}$/.test(v) || "Invalid phone number (8–15 digits)"`.
>   6. Submit handler `onSubmit(formData)`:
>      a. Set local `submitting=true`.
>      b. Email de-dup: `event.participants.find(p => p.email.toLowerCase() === formData.email.toLowerCase().trim())`. If match → set page-level error "You are already registered for this event" + `submitting=false` + return. Do NOT call API.
>      c. Assemble `dateOfBirth = `${dobYear}-${String(dobMonth).padStart(2,"0")}-${String(dobDay).padStart(2,"0")}``; build the participant `{ id: crypto.randomUUID(), email, firstName, lastName, gender, dateOfBirth, address, phone, distanceId, registeredAt: new Date().toISOString() }` (omit the raw `dobDay`/`dobMonth`/`dobYear` form fields).
>      d. `await registerParticipant(id, participant);`.
>      e. On success: `navigate(`/events/${id}/confirmation/${participant.id}`);`.
>      f. On API failure: set page-level error "Registration failed. Please try again." + `submitting=false`. Form data is preserved automatically (we never reset).
>   7. While `submitting=true`: the Register button shows a `.spinner` + "Registering…" and is disabled. Per SPEC §5 Story 4 AC, this prevents double-clicks.
>   8. Page-level errors (duplicate-email, API failure) render in a `.form__error-banner` above the fields — `<Icon.alert/>` + message on a subtle `var(--err)`-tinted background. Messages: "You are already registered for this event." / "Registration failed. Please try again."
> Acceptance: SPEC §5 Story 4 full AC.
> Verify (against Event 1 which has 2 pre-seeded participants):
>   - Navigate to `/events/1/checkout?distance=d1` (10 km, $35).
>   - Submit empty → 7 "This field is required" errors.
>   - Email "foo" → "Invalid email format". Email "вера@пошта.укр" → "Latin characters only (a–z)".
>   - First / Last / Address with Cyrillic (e.g. "Вера") → "Latin characters only (a–z)".
>   - DOB future → "Date of birth must be in the past".
>   - DOB making age 15 on event date → age error.
>   - Phone "123" → "Invalid phone number (8–15 digits)". Phone "12345678" (exactly 8) → passes.
>   - Submit valid form with email `anna.kowalski@example.com` (Anna's email from Event 1 seed) → page-level "You are already registered for this event". MockAPI was NOT called.
>   - Submit with new email + valid data → spinner appears → success → redirect to `/events/1/confirmation/{uuid}`. Refresh MockAPI UI on Event 1 → 3 participants now.
>   - Disable network → submit → "Registration failed. Please try again." form data still in fields.
>   - Navigate to `/events/1/checkout` (no `distance` param) → redirect to `/events/1`.
>   - Navigate to `/events/1/checkout?distance=invalid` → redirect to `/events/1`.
>   - Mobile (DevTools 428px): First/Last stack vertically, DOB stays 3 in a row (per SPEC AC), button full-width.
```

### Notes for Step 8

- Why submit-time de-dup, not blur-time: SPEC AC explicitly says "Given... When I submit the form, Then..." Adding blur-time check leaks (a) the existence of a participant with that email before they commit and (b) timing signal that could be probed. Match SPEC literally.
- DOB age check is on `event.date`, not today — defensible because the registration is for participation on that future date.
- `crypto.randomUUID()` available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+). Mentor's browser must support it; if not, fall back to a UUID library — but assume modern for this project.
- We accept that read-modify-write has a race condition (see Prompt 8.1 note). For this scale, the risk is theoretical.
- **DOB = three form fields, not one composite widget.** Following the prototype, `dobDay` / `dobMonth` / `dobYear` live directly in RHF state and the ISO is assembled at submit. This deliberately avoids the "composite widget that holds a parsed value" pattern — where emitting `""` for a partial selection wipes the user's in-progress picks and you have to keep internal local state in sync via `useRef`. Plain controlled selects = no local state to fall out of sync.
- **One error message per field.** Established here as a project-wide rule: the wrapper component (FormField) renders label + error message; inner input widgets render only their UI + `aria-invalid` + visual-state styling. Typing the prop as `invalid: boolean` (not `error: string`) makes it impossible to accidentally pass a message down and double-render. Apply this pattern to any future form widgets.
- **Native `<select>` arrow is OS-dependent.** On Windows Chrome it's a grey triangle that clashes with the dark pill. Set `appearance: none` and use an inline-SVG `background-image` chevron (light stroke), reserving space in `padding-right`. (See the prototype's DOB selects.)
- **Latin-only is a hard requirement, not polish.** The ticket PDF (Step 9, jsPDF/Helvetica) cannot render Cyrillic — non-Latin input would corrupt the downloaded ticket. The Latin patterns on email/name/address are exactly why the field rejects "Вера" (SPEC §7). If you later embed a Unicode font in the PDF, this restriction can be relaxed.

---

## Step 9 — Story 5: Confirmation + PDF (`/events/:id/confirmation/:participantId`)

**References:** [SPEC §5 Story 5](SPEC.md#L359-L402), the prototype's `ConfirmationScreen` + `generateTicketPDF` + `imgToBase64` (`assets/screens.jsx`) and `.confirm*` rules (`assets/screens.css`).

**Decisions baked in this step:**
- Confirmation page renders from URL params + a fresh `fetchEvent(id)` call. No reliance on localStorage / session state. Per SPEC §5 Story 5 AC, deep-link works on a different device/browser.
- The ticket PDF is drawn **imperatively with `jsPDF`** (A4 portrait, `unit: 'mm'`) in a `generateTicketPdf(event, participant, distance)` function ported from the prototype's `generateTicketPDF`. It uses jsPDF's built-in Helvetica → **Latin only**, which is why Checkout (Step 8) restricts text fields. Format is fixed regardless of viewport.
- **PDF filename rule:** slugify `event.name` via `.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")` → `"mispo-winter-marathon"`, and append only the **first 8 chars** of the participant UUID. Final: `ticket-{slug}-{participantId.slice(0,8)}.pdf`.
- Back button on Confirmation goes to `/` (Home) per SPEC unified Back behavior.

### Prompt 9.1 — Confirmation page (display only)

```
> Context: After successful Checkout submit, the user is navigated to `/events/:id/confirmation/:participantId`. The page must render from URL + API alone — no incoming navigation state.
> Goal: Display the confirmation ticket layout per SPEC §5 Story 5 AC. PDF generation comes in Prompt 9.2.
> Build:
>   1. Create `src/pages/Confirmation/Confirmation.tsx` + module CSS. Replace placeholder in App.tsx.
>   2. Read params: `const { id, participantId } = useParams<{ id: string; participantId: string }>();`.
>   3. State machine + fetch (same shape as Details — including module-level `load` to avoid `react-hooks/set-state-in-effect`, lazy-initialized status, a `loading` skeleton, and a non-404 `error` state with a Retry button). The Confirmation skeleton is simpler than Details (fewer rows — just banner + title + 3 lines, no distance list) but uses the same `.shimmer` keyframe. After fetchEvent:
>      - If event 404 → redirect to `/not-found`.
>      - Else find `participant = event.participants.find(p => p.id === participantId)`. If not found → redirect to `/not-found`.
>      - Find `distance = event.distances.find(d => d.id === participant.distanceId)`. If not found, `distance` is `undefined` and the distance line is omitted from the UI and the PDF (both branches handle the undefined gracefully). No warning log — the case shouldn't happen if data integrity holds, and defensive logging for impossible scenarios is noise.
>   4. Layout (port the prototype's `ConfirmationScreen`):
>      - `<PageHeader label="Confirmation Ticket" />`.
>      - `.confirm-banner`: a `.confirm-banner__check` circle with `<Icon.check/>` (**green, e.g. `#3fbf7f` background + white check** — ACCEPTANCE §1.5 wants a green check; the prototype's `.confirm-banner__check` uses `var(--accent)` yellow, so do NOT port that color here) + `.confirm-banner__text` "Your Order successfully done!".
>      - `.confirm-title` (`<h1>`) = event name.
>      - `.confirm-grid` — two columns (desktop):
>        - Left: `.confirm-meta` rows — `<Icon.pin/> {venue}, {COUNTRY[country] ?? country}` (venue, NOT city, per SPEC §5 Story 5), `<Icon.cal/> {fmtDate(date).full}`, `<Icon.route/> {distance.label}`; then a `.kv-list` of label/value pairs — "Name of Participant" → `{firstName} {lastName}`, "Phone", "Email", "Address"; then `.confirm-actions` holding the Download button.
>        - Right: `.confirm-photo` = the event banner image (with an `imgOk` placeholder fallback).
>      - Download control: `.download-btn` = `<Icon.download/> Download Ticket` (accent button). While generating → a `.spinner` + "Generating…", disabled. (Wired in 9.3.)
>   5. Mobile (**<1024px**): single column — the photo moves below the text block (e.g. `order: 3`), info stacks, the Download button spans full width. NOTE: the prototype collapses `.confirm-grid` at 800px; use `@media (max-width: 1023px)` to match ACCEPTANCE §1.5 / §3.3 (same override as Details, Step 7).
> Acceptance: SPEC §5 Story 5 AC for layout + 404 redirects.
> Verify:
>   - After Checkout submit succeeds, lands here with both event + participant data rendered correctly.
>   - Hard-refresh the URL → still renders (no localStorage dependency).
>   - Navigate to `/events/9999/confirmation/abc` → `/not-found`.
>   - Navigate to `/events/1/confirmation/garbage-uuid` → `/not-found`.
>   - Back button → `/`.
>   - Mobile layout: single column, banner below text block.
```

### Prompt 9.2 — Ticket PDF generator (jsPDF)

```
> Context: Step 1 installed `jspdf`. Source of truth: the prototype's `generateTicketPDF` + `imgToBase64` (`assets/screens.jsx`). The PDF is A4 portrait regardless of viewport.
> Goal: Build `src/lib/generateTicketPdf.ts` that draws the NEXTRUN ticket with jsPDF and saves it. Port the prototype's drawing code near-verbatim — it already encodes the layout, mm coordinates and colors.
> Build:
>   1. Export `async function generateTicketPdf(event: Event, participant: Participant, distance: Distance): Promise<void>`.
>      - `import { jsPDF } from "jspdf";` then `const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });`. Page width 210mm, margin 16mm.
>      - Colors as RGB tuples: dark `[21,20,15]`, muted `[138,134,120]`, yellow `[197,168,0]`. Font is jsPDF's built-in `helvetica` (bold/normal) — **Latin only** (this is why Step 8 enforces Latin input).
>      - Sections, top→bottom (all straight from the prototype):
>        - Header: `NEXTRUN.` (bold 18) left, `Ticket` (right, muted); a yellow rule under it.
>        - Banner photo top-right (≈38% width, 16:10), embedded via `imgToBase64` — port it: load the image with `crossOrigin = "anonymous"`, draw it to a `<canvas>`, return `canvas.toDataURL("image/jpeg", 0.82)`; on error/taint return `null` → draw a grey placeholder rect.
>        - Event title (bold 20, wrapped via `doc.splitTextToSize`).
>        - Meta lines (muted 9.5): `{venue}, {COUNTRY[country] ?? country}`, `fmtDate(date).full`, `distance.label`.
>        - "NAME OF PARTICIPANT" label + `{firstName} {lastName}` (bold 17).
>        - KV grid (3-col): `PARTICIPANT ID` = `"DFR-" + participant.id.slice(0,12).toUpperCase()`, `PHONE`, `EMAIL`, and `ADDRESS` (full width).
>        - Payment row: `{distance.label}  —  {event.name}` left, `{price.toFixed(2)} USD` right; then "Successfully Registered" in yellow. **Never "Paid"** — SPEC §6 excludes real payments.
>        - Dashed stub separator + a stub row repeating Name / Phone / Participant ID; an "Event" footer block with the event name + `city | date | distance`.
>      - Reuse `fmtDate` (`@/lib/formatDate`) and the `COUNTRY` map (`@/lib/country`).
>   2. Save: `const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); doc.save("ticket-" + slug + "-" + participant.id.slice(0,8) + ".pdf");`
>   3. This is a plain async function — NO React component, NO `@react-pdf/renderer`, NO font files. jsPDF ships Helvetica. (You MAY `await import("jspdf")` inside the handler to keep it out of the initial chunk, but a static import is fine for this project.)
> Acceptance: produces and saves the A4 ticket; matches the prototype's Download Ticket output.
> Verify (after 9.3 wires it):
>   - Generated PDF opens at A4 portrait (210×297mm).
>   - Header `NEXTRUN.` + yellow rule; banner photo top-right (grey rect if the host CORS-blocks the image).
>   - Event title, meta (venue / date / distance), participant name, then the `DFR-…` ID / phone / email / address grid.
>   - Payment row with `{price}.00 USD` + "Successfully Registered" (yellow), then the dashed tear-off stub.
>   - All text renders in Helvetica; Cyrillic never appears (Step 8 blocks it at input).
```

### Prompt 9.3 — Wire the Download button

```
> Context: `generateTicketPdf` exists (Prompt 9.2) and handles filename + save internally. Confirmation has a Download button stub. Now wire the click handler with loading + error states.
> Goal: Call the generator on click; show progress and surface failures.
> Build:
>   1. In `Confirmation.tsx`: `const [downloading, setDownloading] = useState(false);` and `const [downloadError, setDownloadError] = useState<string | null>(null);`.
>   2. `handleDownload` (async): re-entrancy guard `if (downloading) return;`, then
>      `try { setDownloading(true); setDownloadError(null); await generateTicketPdf(event, participant, distance); }`
>      `catch { setDownloadError("Couldn't generate the ticket. Please try again."); }`
>      `finally { setDownloading(false); }`.
>      (`distance` is guaranteed defined here — like the prototype, Confirmation falls back to `event.distances[0]` if the participant's `distanceId` is missing.)
>   3. Bind to the Download button: `disabled={downloading}` + `aria-busy={downloading}`; the label swaps to a `.spinner` + "Generating…" while busy. Below it: `{downloadError && <p role="alert" className={s.downloadError}>{downloadError}</p>}`.
> Acceptance: SPEC §5 Story 5 AC — "PDF saved … with filename ticket-{slug}-{participantId.slice(0,8)}.pdf".
> Verify:
>   - Click Download Ticket → an A4 PDF downloads as e.g. `ticket-mispo-winter-marathon-a1b2c3d4.pdf` (8-char id prefix).
>   - Open it: event / participant / distance data correct; banner image embedded (or a grey placeholder if the host CORS-blocks it).
>   - On mobile (DevTools 428px) → same A4 PDF (format independent of viewport).
>   - Double-clicking the button does not start two generations (re-entrancy guard).
>   - Error path: if generation throws, an inline `role="alert"` message appears and the button returns to "Download Ticket".
```

### Notes for Step 9

- The PDF is jsPDF/Helvetica — **Latin glyphs only**. That is the whole reason Step 8 restricts email / name / address to Latin (SPEC §7). Do not feed it Cyrillic, and do not relax the validation without first embedding a Unicode font in the PDF.
- **External banner images (Unsplash URLs):** `imgToBase64` loads them with `crossOrigin = "anonymous"` and draws to a canvas. A CORS-blocked host taints the canvas → `toDataURL` throws → the helper returns `null` and the PDF draws a grey placeholder rect. Layout still holds. Prefer CORS-open hosts in seed data.
- The ticket layout (sections, mm coordinates, the `DFR-` id, the tear-off stub, "Successfully Registered") is fully defined by the prototype's `generateTicketPDF` — port it rather than re-deriving positions.
- No fonts to download, no `src/assets/fonts/`, no `@react-pdf/renderer` — jsPDF ships Helvetica. (This removes the original project's single most fragile step.)
- Confirmation can render before the PDF lib is touched; importing `jspdf` lazily inside `handleDownload` keeps it out of the initial bundle if you care about first-load weight.

---

## Step 10 — Story 6: 404 (`*` + invalid-ID redirects)

**References:** [SPEC §5 Story 6](SPEC.md#L404-L422), the prototype's `NotFoundScreen` (`assets/screens.jsx`) + `.nf*` rules (`assets/screens.css`).

**Decisions baked in this step:**
- Two URL surfaces lead here: (a) the catch-all `*` route in App.tsx, (b) programmatic `<Navigate to="/not-found">` from Details / Checkout / Confirmation when their resource lookups fail.
- Per the prototype, the page uses `<PageHeader label="Error" />` (the header keeps its Back control) AND a large in-content "Back to Home" CTA below the message. Both go to `/`.

### Prompt 10.1 — `NotFound` page

```
> Context: App.tsx has a `<Route path="*" element={<div>404 — TBD Step 10</div>} />` placeholder. Replace it with the real page. Source of truth: the prototype's `NotFoundScreen`.
> Goal: Build the NotFound page per SPEC §5 Story 6 AC.
> Build:
>   1. Create `src/pages/NotFound/NotFound.tsx` + module CSS. Replace the placeholder in App.tsx, and add a second explicit route so programmatic redirects (`<Navigate to="/not-found" />`) work.
>   2. Routes addition in App.tsx:
>      - `<Route path="/not-found" element={<NotFound />} />`
>      - `<Route path="*" element={<NotFound />} />`
>      - Order: more-specific first (react-router-dom v6 doesn't strictly require order, but keeps the file readable).
>   3. Layout (port the prototype) — single centered `.nf` column, NO illustration. NOTE: the prototype's `.nf` is left-aligned; ACCEPTANCE §1.6 / §3.3 want it **centered** — add `margin-inline: auto; text-align: center; align-items: center` so the column + CTA center on all viewports.
>      - `<PageHeader label="Error" />` (keeps the header Back control).
>      - `.nf__code` — a large "404" in `var(--accent)`.
>      - `.nf__title` — `Error <em>Page</em>` with "Page" in `var(--accent)` via the `<em>`.
>      - `.nf__text` — "The page you're looking for doesn't exist or has been moved."
>      - A primary CTA `btn--primary btn--lg`: `<Icon.back/> Back to Home`, `onClick` → `navigate("/")`.
> Acceptance: SPEC §5 Story 6 AC: page renders for unmatched routes + invalid IDs + has a Back to Home button.
> Verify:
>   - Navigate to `/garbage` → NotFound renders ("Error Page").
>   - Navigate to `/events/9999` → fetchEvent fails → redirect to `/not-found` → NotFound renders.
>   - Navigate to `/events/1/confirmation/garbage-uuid` → participant not found → redirect to `/not-found` → NotFound renders.
>   - Navigate to `/events/1/checkout` (missing distance param) → redirect to `/events/1` (NOT to NotFound — Story 4 behavior, intentionally different).
>   - Click "Back to Home" → navigates to `/`. (The header Back control also goes to `/`.)
>   - Mobile: CTA spans full width.
```

### Prompt 10.2 — Audit existing redirects to NotFound

```
> Context: Steps 7 (Details), 8 (Checkout), 9 (Confirmation) each have lookup failure paths that should redirect to `/not-found`. Verify they all work end-to-end.
> Goal: Audit and fix any redirect that doesn't reach NotFound correctly.
> Build:
>   1. Re-read the redirect-on-error logic in:
>      - `Details.tsx` — fetchEvent 404 → `<Navigate to="/not-found" replace />`. ✓ should already work post-10.1.
>      - `Confirmation.tsx` — event 404 OR participant-not-found → `<Navigate to="/not-found" replace />`. ✓
>      - `Checkout.tsx` — note: Checkout uses different redirects:
>        * Event 404 → `<Navigate to="/not-found" replace />` (consistent with Details).
>        * Missing/invalid `distance` query param → `<Navigate to={`/events/${id}`} replace />` (per SPEC §5 Story 4 AC — back to the event, NOT to 404).
>   2. Confirm `replace: true` is used everywhere (so the broken URL doesn't pollute browser history — user pressing back doesn't re-trigger the redirect).
>   3. No new code needed if Step 7/8/9 followed the prompts — this is a verification audit.
> Acceptance: invariants hold for all three lookup-failure code paths.
> Verify (manual test of each path):
>   - `/events/9999` → /not-found (replace; browser-back skips it).
>   - `/events/1/checkout` (no distance) → /events/1.
>   - `/events/1/checkout?distance=invalid` → /events/1.
>   - `/events/1/confirmation/garbage` → /not-found.
>   - `/events/9999/confirmation/anything` → /not-found.
```

### Notes for Step 10

- The prototype's 404 has no illustration — it's a plain single-column text layout ("404" / "Error Page" / message / CTA).
- We deliberately do NOT redirect `/events/:id/checkout?distance=invalid` to /not-found — SPEC sends the user back to the Details page so they can pick a valid distance. This is a UX-over-strict-routing call from SPEC §5 Story 4.

---

## Step 11 — Final pass

**Goal:** Take the build from "code compiles" to "ready for acceptance testing". This Step is execution-only — no new features, no new files except cleanup.

### Prompt 11.1 — Cleanup debug routes + temporary code

```
> Context: Steps 2 and 4 added temporary App content (the TokensDebug swatch page, the Prompt 4.3 layout-test snippet) and Step 3 may have left a smoke-check `console.log`. These must not ship.
> Goal: Remove every debug surface introduced during the build.
> Build:
>   1. Delete `src/pages/TokensDebug/` directory. It's no longer imported (Prompt 5.1 swapped App.tsx to the router) — only the file lingers. Remove it.
>   2. Confirm the Prompt 4.3 layout-test snippet was reverted (App.tsx should no longer contain a stray `<><PageHeader label="Events Details" />…</>` outside of Routes).
>   3. Grep the codebase for `console.log`, `console.warn`, `console.error`, `console.info`, `debugger`. Remove any that don't serve a real purpose:
>      - Keep: error-path logs in api.ts (helps later debugging).
>      - Remove: stale prints from prompt verification steps.
>   4. Search for any `// TODO`, `// FIXME`, `// DEBUG` markers and resolve them (or note any you consciously defer).
> Acceptance: No debug-only routes or unintentional console output.
> Verify:
>   - Open DevTools console on each route — no unexpected logs.
>   - `npm run build` produces a clean dist/.
```

### Prompt 11.2 — Automated review pass

```
> Context: The codebase is now functionally complete. Run automated review skills before manual QA.
> Goal: Surface code quality and security issues via Claude Code's built-in skills.
> Build (operator-driven; these are slash commands the user runs):
>   1. Run `/review` against the current state. Triage output:
>      - Style / convention issues → fix in place.
>      - Architectural critiques → discuss; some may be follow-up work.
>      - False positives → ignore.
>   2. Run `/security-review` focused on:
>      - XSS surfaces: any place we render user-controlled strings without escaping. Most surfaces are React text nodes (auto-escaped), but check anywhere we use `dangerouslySetInnerHTML` (we shouldn't, but verify).
>      - URL injection: the `?q=...` search param and route params should not be passed to any HTML attribute as raw href / src. Spot-check Details and Confirmation.
>      - Open redirect: `<Navigate to>` always uses static paths in our code — verify no user input flows into navigation targets.
>      - Sensitive data exposure: env var leaks beyond VITE_, secrets in code (shouldn't be any).
>   3. Address findings inline. Note any "won't fix" decisions with a short rationale.
> Acceptance: Both reviews complete; no blocker-severity items left open.
> Verify:
>   - `/review` and `/security-review` outputs captured; note any findings you deliberately defer.
```

### Prompt 11.3 — Manual acceptance walkthrough

```
> Context: Acceptance criteria in SPEC §5 are dense. The build must pass every AC. This walkthrough exercises the same checks ACCEPTANCE.md formalizes.
> Goal: Tick every AC in SPEC §5 against the running app.
> Build (operator does the tests, makes a checklist):
>   1. For each of Stories 1–6 in SPEC §5, walk through every Given/When/Then literally:
>      - Trigger the Given (set up state).
>      - Perform the When (action).
>      - Observe the Then (expected outcome).
>      - Tick or note discrepancy.
>   2. Spot-check edge cases that SPEC covers but easy to miss:
>      - Story 1: subtitle "{count} Listing Found" updates immediately when search filters.
>      - Story 2: `?q=` (empty) cleared to `?` (none) — not left as `?q=`.
>      - Story 3: Distance cards sorted by km, "More Information" toggles independent, REGISTER label changes per status.
>      - Story 4: 7 fields validated, email de-dup against pre-seeded `anna.kowalski@example.com`, phone digits-only on paste, age-on-event-date check.
>      - Story 5: PDF filename slug correct, A4 on mobile, deep-link works on fresh session.
>      - Story 6: all three redirect paths (event 404, participant 404, garbage URL) reach the same NotFound page.
>   3. Any failed AC → fix immediately, or note it for follow-up if non-blocking.
> Acceptance: every SPEC AC has been manually exercised and passes (or is documented as deferred).
> Verify:
>   - A populated checklist captured, cross-checked against ACCEPTANCE.md.
```

### Prompt 11.4 — Mobile review (DevTools device mode)

```
> Context: The handoff prototype is responsive across all screens, so resize it side-by-side as a reference. DevTools device mode is the scoped-down substitute for a real-device pass — sufficient for this project's learning scope. Known gaps (touch-scroll inertia on the carousel, iOS Safari PDF `doc.save` / download quirks, Retina font rendering) are accepted, documented in SPEC §6.
> Goal: Exercise all 6 screens in Chrome (or Edge) DevTools device mode.
> Build (operator steps):
>   1. Run dev server normally: `npm run dev`.
>   2. Open the local URL in Chrome/Edge.
>   3. Open DevTools (`F12`), toggle device toolbar (`Ctrl+Shift+M`).
>   4. Run the full walkthrough against each preset:
>      - iPhone 14 Pro
>      - Pixel 7
>      - Responsive width 360px (smallest realistic phone)
>   5. Throttling: set Network to `Fast 3G` in the Network tab for at least one pass — surfaces skeleton/loading states honestly.
>   6. For each screen, note any of:
>      - Tap target too small (< ~44×44pt — measure with `Ctrl+Shift+P` → "Show rulers").
>      - Text overflow / clipping. **Specifically check DOBPicker** on `/events/:id/checkout` — all three placeholders (DD/MM/YYYY on mobile) must render in full inside the pill with the chevron, no clip. If you see "YYY" or similar, tighten gap/padding (see Step 8.2 mobile override) — do NOT lower font-size, that triggers iOS Safari zoom-on-focus.
>      - Footer not full-width on the dark surface.
>      - Carousel swipe (mouse-drag emulates touch in device mode) unresponsive or slides uneven height.
>      - Form input zoom-on-focus risk — verify inputs render at ≥16px (`--fs-body` = 1rem); DevTools won't trigger iOS zoom but the font-size check still catches the root cause.
>      - Reduced motion: enable via `Ctrl+Shift+P` → "Emulate CSS prefers-reduced-motion" → verify animations gracefully degrade.
>   7. Note anything that fails for follow-up.
> Acceptance: one DevTools mobile pass completed across all 3 presets + reduced-motion check.
> Verify:
>   - Notes captured per screen.
```

### Prompt 11.5 — Wrap-up

```
> Context: All 6 Stories implemented, reviewed, and walked through against SPEC §5.
> Goal: Confirm the build is complete and record any deviations.
> Build:
>   1. Re-run the full quality gate one last time: `npm run build`, `npx tsc --noEmit`, `npm run lint` — all clean.
>   2. Write a short build summary: what shipped, anything deferred, any deviations from SPEC encountered.
>   3. Hand off to ACCEPTANCE.md — walk it top-to-bottom against the running app.
> Acceptance: build green; summary written.
> Verify:
>   - All three quality commands exit 0.
>   - Summary is dated and informative.
```

### Notes for Step 11

- Step 11 is the only Step that doesn't produce new files. All work is verification + cleanup.
- Don't skip 11.4 (real-device review) — DevTools responsive mode misses iOS Safari quirks routinely. Even 15 minutes on a real phone surfaces issues no emulator catches.
- After Step 11, the build is **functionally complete**. Final acceptance testing (ACCEPTANCE.md) and any bugfixes from a real-device pass close out the project.

---

## Notes for the mentor reproducing this build

- You do not need Figma. The `design_handoff_nextrun/` prototype is the source of truth for visuals — open `Events Listing.html` in a browser and inspect its CSS/JSX as you build.
- Port from the prototype's `assets/` (tokens.css, styles.css, screens.css, components.jsx, screens.jsx) rather than re-deriving values; the SPEC governs behavior.
- If you find a contradiction between this file and SPEC, **SPEC wins**. Open an issue against this file.
- Each Story is independent: you can verify Story 3 without Story 4 done (use direct URLs).
