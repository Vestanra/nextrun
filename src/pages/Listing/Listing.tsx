import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Event } from '@/types/event';
import { fetchEvents } from '@/lib/api';
import Brand from '@/components/Brand/Brand';
import SearchBar from '@/components/SearchBar/SearchBar';
import EventCard from '@/components/EventCard/EventCard';
import ListingSkeleton from '@/components/ListingSkeleton/ListingSkeleton';
import CarouselDots from '@/components/EventCarousel/CarouselDots';
import s from './Listing.module.css';

type Status = 'loading' | 'error' | 'success';

function load(
  setEvents: (e: Event[]) => void,
  setStatus: (s: Status) => void
) {
  fetchEvents()
    .then((all) => {
      const filtered = all
        .filter((e) => e.status === 'registration-open')
        .sort((a, b) => a.date.localeCompare(b.date));
      setEvents(filtered);
      setStatus('success');
    })
    .catch(() => setStatus('error'));
}

export default function Listing() {
  const [status, setStatus] = useState<Status>('loading');
  const [events, setEvents] = useState<Event[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  const q = searchParams.get('q') ?? '';

  useEffect(() => {
    load(setEvents, setStatus);
  }, []);

  const retry = () => {
    setStatus('loading');
    load(setEvents, setStatus);
  };

  const updateQuery = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      setSearchParams({});
    } else {
      setSearchParams({ q: next });
    }
  };

  const filtered = q.trim()
    ? events.filter((e) =>
        e.name.toLowerCase().includes(q.trim().toLowerCase())
      )
    : events;

  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* Top bar */}
        <div className={s.topbar}>
          <Brand />
          <SearchBar value={q} onChange={updateQuery} />
        </div>

        {/* Events head */}
        <div className={s.eventsHead}>
          <h1 className={s.title}>
            All Events <em>You&apos;ve Got</em>
          </h1>
          {status === 'success' && (
            <p className={s.count}>
              <b>{filtered.length}</b> Listing Found
            </p>
          )}
        </div>

        {/* States */}
        {status === 'loading' && <ListingSkeleton />}

        {status === 'error' && (
          <div className={s.errorState} role="alert">
            <p>Couldn&apos;t load events.</p>
            <button className={s.retryBtn} onClick={retry}>
              Retry
            </button>
          </div>
        )}

        {status === 'success' && filtered.length === 0 && (
          q.trim() ? (
            <div className={s.emptyState}>
              <h2 className={s.emptyHeading}>
                No events <em>match your search</em>
              </h2>
              <p className={s.emptyText}>
                Try a different name, or clear the search to see every race.
              </p>
              <button className={s.clearBtn} onClick={() => updateQuery('')}>
                Clear search
              </button>
            </div>
          ) : (
            <div className={s.emptyState}>
              <p>No races yet — check back soon</p>
            </div>
          )
        )}

        {status === 'success' && filtered.length > 0 && (
          <>
            <div className={s.grid} ref={gridRef}>
              {filtered.map((event) => (
                <div key={event.id} data-card>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
            <CarouselDots count={filtered.length} gridRef={gridRef} />
          </>
        )}
      </div>
    </div>
  );
}
