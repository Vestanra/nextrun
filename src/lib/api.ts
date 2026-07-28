import type { Event, Participant } from '@/types/event';
import { demoEvents } from './demoEvents';

// Two backends behind one interface:
//  - Live: a MockAPI REST resource (local dev / `npm run dev`), via VITE_API_BASE_URL.
//  - Static demo: bundled seed data, in-memory (public GitHub Pages build), via VITE_STATIC_DEMO.
// The public demo uses static data on purpose — the MockAPI free tier is
// unauthenticated, so a live endpoint exposed in a public repo could be wiped
// or spammed by anyone. Static registrations persist for the session only
// (reset on reload) — enough to walk the full browse → register → ticket flow.
const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true';
const base = import.meta.env.VITE_API_BASE_URL;

if (!STATIC_DEMO && !base) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.example to .env and fill in your ' +
      'MockAPI project ID — or set VITE_STATIC_DEMO=true to run against bundled demo data.'
  );
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// --- Static demo backend ---------------------------------------------------
// Mutable session copy of the seed data. Cloned lazily so a page reload always
// starts from the pristine seed.
let demoStore: Event[] | null = null;
function store(): Event[] {
  if (!demoStore) demoStore = structuredClone(demoEvents);
  return demoStore;
}
// Small artificial latency so loading skeletons / spinners are actually visible.
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isValidEvent(e: unknown): e is Event {
  if (!e || typeof e !== 'object') return false;
  const ev = e as Record<string, unknown>;
  return Array.isArray(ev['distances']) && Array.isArray(ev['participants']);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, options);
  } catch {
    throw new ApiError('Network error');
  }
  if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status);
  return res.json() as Promise<T>;
}

export async function fetchEvents(): Promise<Event[]> {
  if (STATIC_DEMO) {
    await delay(350);
    return structuredClone(store());
  }
  const raw = await request<unknown[]>('/events');
  const valid = raw.filter((e) => {
    if (isValidEvent(e)) return true;
    console.warn('Dropped malformed event:', e);
    return false;
  });
  return valid as Event[];
}

export async function fetchEvent(id: string): Promise<Event> {
  if (STATIC_DEMO) {
    await delay(300);
    const ev = store().find((e) => e.id === id);
    if (!ev) throw new ApiError('Event not found', 404);
    return structuredClone(ev);
  }
  let raw: unknown;
  try {
    raw = await request<unknown>(`/events/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new ApiError('Event not found', 404);
    }
    throw err;
  }
  if (!isValidEvent(raw)) throw new ApiError('Event has malformed data', 404);
  return raw;
}

export async function registerParticipant(
  eventId: string,
  participant: Participant
): Promise<Event> {
  if (STATIC_DEMO) {
    await delay(500);
    const ev = store().find((e) => e.id === eventId);
    if (!ev) throw new ApiError('Event not found', 404);
    ev.participants.push(participant);
    return structuredClone(ev);
  }
  const event = await fetchEvent(eventId);
  const updated = { ...event, participants: [...event.participants, participant] };
  // Note: read-modify-write has a known race condition; acceptable for this project's traffic profile.
  return request<Event>(`/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
}
