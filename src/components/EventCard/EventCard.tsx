import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '@/types/event';
import Icon from '@/components/Icon/Icon';
import { fmtDate } from '@/lib/formatDate';
import { COUNTRY } from '@/lib/country';
import s from './EventCard.module.css';

function minPrice(event: Event): number {
  return Math.min(...event.distances.map((d) => d.price));
}

export default function EventCard({ event }: { event: Event }) {
  const [imgOk, setImgOk] = useState(true);
  const d = fmtDate(event.date);

  return (
    <Link to={`/events/${event.id}/`} className={s.card}>
      <div className={s.media}>
        {imgOk ? (
          <img
            className={s.img}
            src={event.bannerImage}
            alt={event.name}
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className={s.placeholder}>running&nbsp;photo</div>
        )}
        <div className={s.dateBadge}>
          <b>{d.day}</b>
          <span>{d.mon}</span>
        </div>
        {event.status !== 'registration-open' && (
          <div className={s.flag}>
            {event.status === 'completed' ? 'Finished' : 'Soon'}
          </div>
        )}
      </div>

      <div className={s.body}>
        <h3 className={s.title}>{event.name}</h3>
        <div className={s.meta}>
          <span className={s.metaRow}>
            <Icon.pin aria-hidden="true" />
            {event.city}, {COUNTRY[event.country] ?? event.country}
          </span>
          <span className={s.metaRow}>
            <Icon.flag aria-hidden="true" />
            {event.distances.length} distances · {d.full}
          </span>
        </div>
        <div className={s.foot}>
          <span className={s.price}>
            Starting at<b><span>$</span>{minPrice(event)} USD</b>
          </span>
          <span className={s.go}>
            <Icon.arrow aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
