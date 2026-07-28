import s from './ListingSkeleton.module.css';

function SkeletonCard() {
  return (
    <div className={s.card}>
      <div className={s.banner} />
      <div className={s.lines}>
        <div className={`${s.line} ${s.lineWide}`} />
        <div className={`${s.line} ${s.lineMid}`} />
        <div className={`${s.line} ${s.lineShort}`} />
        <div className={`${s.line} ${s.linePrice}`} />
      </div>
    </div>
  );
}

export default function ListingSkeleton() {
  return (
    <div className={s.grid} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
