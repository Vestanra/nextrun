import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import type { Event } from '@/types/event';
import { fetchEvent, ApiError } from '@/lib/api';
import { fmtDate } from '@/lib/formatDate';
import { COUNTRY } from '@/lib/country';
import PageHeader from '@/components/PageHeader/PageHeader';
import Icon from '@/components/Icon/Icon';
import DistanceCard from '@/components/DistanceCard/DistanceCard';
import s from './Details.module.css';

type Status = 'loading' | 'error' | 'notFound' | 'success';

function load(
  id: string,
  setEvent: (e: Event) => void,
  setStatus: (s: Status) => void,
  setSelectedDistanceId: (id: string | null) => void
) {
  fetchEvent(id)
    .then((ev) => {
      setEvent(ev);
      setSelectedDistanceId(null);
      setStatus('success');
    })
    .catch((err) => {
      if (err instanceof ApiError && err.status === 404) {
        setStatus('notFound');
      } else {
        setStatus('error');
      }
    });
}

function DetailsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className={`${s.skelBanner} ${s.skelShimmer}`} />
      <div className={s.body} style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[80, 65, 70, 55, 60].map((w, i) => (
            <div key={i} className={`${s.skelLine} ${s.skelShimmer}`} style={{ width: `${w}%` }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[100, 100, 100].map((w, i) => (
            <div key={i} className={`${s.skelShimmer}`} style={{ height: 80, borderRadius: 'var(--radius-md)', width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>(() => (id ? 'loading' : 'notFound'));
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedDistanceId, setSelectedDistanceId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    load(id, setEvent, setStatus, setSelectedDistanceId);
  }, [id]);

  const retry = () => {
    if (!id) return;
    setStatus('loading');
    load(id, setEvent, setStatus, setSelectedDistanceId);
  };

  if (status === 'notFound') return <Navigate to="/not-found" replace />;

  if (status === 'loading') {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <PageHeader label="Events Details" />
          <DetailsSkeleton />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <PageHeader label="Events Details" />
          <div className={s.errorState} role="alert">
            <p>Couldn&apos;t load event.</p>
            <button className={s.retryBtn} onClick={retry}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const d = fmtDate(event.date);
  const isOpen = event.status === 'registration-open';
  const sortedDistances = event.distances
    .slice()
    .sort((a, b) => a.kilometers - b.kilometers);
  const distanceLabels = sortedDistances.map((d) => d.label).join(', ');

  let ctaLabel = 'Register';
  if (event.status === 'upcoming') ctaLabel = 'Registration not open yet';
  else if (event.status === 'completed') ctaLabel = 'Event finished';

  const handleRegister = () => {
    if (selectedDistanceId) {
      navigate(`/events/${event.id}/checkout/?distance=${selectedDistanceId}`);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        <PageHeader label="Events Details" />

        <h1 className={s.title}>{event.name}</h1>

        <div className={s.meta}>
          <span className={s.metaRow}>
            <Icon.pin aria-hidden="true" />
            {event.city}, {COUNTRY[event.country] ?? event.country}
          </span>
          <span className={s.metaRow}>
            <Icon.cal aria-hidden="true" />
            {d.full}
          </span>
          <span className={s.metaRow}>
            <Icon.route aria-hidden="true" />
            {distanceLabels}
          </span>
        </div>

        <BannerImage src={event.bannerImage} alt={event.name} />

        <div className={s.body}>
          <div>
            {event.subtitle && (
              <h2 className={s.subtitle}>{event.subtitle}</h2>
            )}
            <div className={s.desc}>
              {event.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <aside
            className={s.register}
            role="radiogroup"
            aria-label="Choose a distance"
          >
            <h3 className={s.registerHead}>Register</h3>
            <p className={s.registerHint}>
              {isOpen
                ? 'Pick a distance to continue to checkout.'
                : ctaLabel + '.'}
            </p>

            <div className={s.distanceList}>
              {sortedDistances.map((dist) => (
                <DistanceCard
                  key={dist.id}
                  distance={dist}
                  selected={selectedDistanceId === dist.id}
                  disabled={!isOpen}
                  onSelect={() => setSelectedDistanceId(dist.id)}
                />
              ))}
            </div>

            <div className={s.registerCta}>
              <button
                className={s.btn}
                disabled={!isOpen || !selectedDistanceId}
                onClick={handleRegister}
              >
                {ctaLabel}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BannerImage({ src, alt }: { src: string; alt: string }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={s.banner}>
      {imgOk ? (
        <img src={src} alt={alt} onError={() => setImgOk(false)} />
      ) : (
        <div className={s.bannerPh}>event&nbsp;banner</div>
      )}
    </div>
  );
}
