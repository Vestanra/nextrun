import { useState, useEffect, type RefObject } from 'react';
import s from './CarouselDots.module.css';

interface Props {
  count: number;
  gridRef: RefObject<HTMLDivElement | null>;
}

export default function CarouselDots({ count, gridRef }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const onScroll = () => {
      const card = el.querySelector('[data-card]') as HTMLElement | null;
      if (!card) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const step = card.offsetWidth + gap;
      setActive(Math.round(el.scrollLeft / step));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [count, gridRef]);

  const go = (i: number) => {
    const el = gridRef.current;
    const card = el?.querySelector('[data-card]') as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card.offsetWidth + gap;
    el.scrollTo({ left: step * i, behavior: 'smooth' });
  };

  return (
    <div className={s.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to card ${i + 1}`}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => go(i)}
        />
      ))}
    </div>
  );
}
