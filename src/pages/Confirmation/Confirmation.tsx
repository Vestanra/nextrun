import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import type { Event, Distance, Participant } from '@/types/event';
import { fetchEvent, ApiError } from '@/lib/api';
import { generateTicketPdf } from '@/lib/generateTicketPdf';
import { fmtDate } from '@/lib/formatDate';
import { COUNTRY } from '@/lib/country';
import PageHeader from '@/components/PageHeader/PageHeader';
import Icon from '@/components/Icon/Icon';
import s from './Confirmation.module.css';

type Status = 'loading' | 'error' | 'notFound' | 'success';

function load(
  id: string,
  setEvent: (e: Event) => void,
  setStatus: (s: Status) => void
) {
  fetchEvent(id)
    .then((ev) => {
      setEvent(ev);
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

function ConfirmationSkeleton() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-8)' }}>
      {[60, 45, 40, 55, 35].map((w, i) => (
        <div key={i} className={s.skelLine} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function PhotoBlock({ src, alt }: { src: string; alt: string }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={s.photo}>
      {imgOk
        ? <img src={src} alt={alt} onError={() => setImgOk(false)} />
        : <div className={s.photoPh}>event photo</div>
      }
    </div>
  );
}

export default function Confirmation() {
  const { id, participantId } = useParams<{ id: string; participantId: string }>();

  const [status, setStatus] = useState<Status>(() => (id ? 'loading' : 'notFound'));
  const [event, setEvent] = useState<Event | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    load(id, setEvent, setStatus);
  }, [id]);

  const retry = () => {
    if (!id) return;
    setStatus('loading');
    load(id, setEvent, setStatus);
  };

  if (status === 'notFound') return <Navigate to="/not-found" replace />;

  if (status === 'loading') {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <PageHeader label="Confirmation Ticket" />
          <ConfirmationSkeleton />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <PageHeader label="Confirmation Ticket" />
          <div className={s.errorState} role="alert">
            <p>Couldn&apos;t load confirmation.</p>
            <button className={s.retryBtn} onClick={retry}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const participant: Participant | undefined = event.participants.find(
    (p) => p.id === participantId
  );
  if (!participant) return <Navigate to="/not-found" replace />;

  const distance: Distance =
    event.distances.find((d) => d.id === participant.distanceId) ?? event.distances[0];

  const d = fmtDate(event.date);

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      setDownloadError(null);
      await generateTicketPdf(event, participant, distance);
    } catch {
      setDownloadError("Couldn't generate the ticket. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        <PageHeader label="Confirmation Ticket" />

        <div className={s.banner}>
          <div className={s.bannerCheck}>
            <Icon.check aria-hidden="true" />
          </div>
          <p className={s.bannerText}>Your Order successfully done!</p>
        </div>

        <h1 className={s.title}>{event.name}</h1>

        <div className={s.grid}>
          <div>
            <div className={s.meta}>
              <span className={s.metaRow}>
                <Icon.pin aria-hidden="true" />
                {event.venue}, {COUNTRY[event.country] ?? event.country}
              </span>
              <span className={s.metaRow}>
                <Icon.cal aria-hidden="true" />
                {d.full}
              </span>
              <span className={s.metaRow}>
                <Icon.route aria-hidden="true" />
                {distance.label}
              </span>
            </div>

            <div className={s.kvList}>
              <div>
                <p className={s.kvLabel}>Name of Participant</p>
                <p className={`${s.kvValue} ${s.kvValueName}`}>
                  {participant.firstName} {participant.lastName}
                </p>
              </div>
              <div>
                <p className={s.kvLabel}>Phone</p>
                <p className={s.kvValue}>{participant.phone}</p>
              </div>
              <div>
                <p className={s.kvLabel}>Email</p>
                <p className={s.kvValue}>{participant.email}</p>
              </div>
              <div>
                <p className={s.kvLabel}>Address</p>
                <p className={s.kvValue}>{participant.address}</p>
              </div>
            </div>

            <div className={s.actions}>
              <button
                className={s.downloadBtn}
                onClick={handleDownload}
                disabled={downloading}
                aria-busy={downloading}
              >
                {downloading ? (
                  <><span className="spinner" /> Generating…</>
                ) : (
                  <><Icon.download aria-hidden="true" /> Download Ticket</>
                )}
              </button>
            </div>

            {downloadError && (
              <p className={s.downloadError} role="alert">{downloadError}</p>
            )}
          </div>

          <PhotoBlock src={event.bannerImage} alt={event.name} />
        </div>
      </div>
    </div>
  );
}
