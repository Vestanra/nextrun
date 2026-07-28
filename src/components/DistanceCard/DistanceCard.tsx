import { useState } from 'react';
import type { Distance } from '@/types/event';
import Icon from '@/components/Icon/Icon';
import s from './DistanceCard.module.css';

function fmtKm(km: number): string {
  return Number.isInteger(km)
    ? km.toFixed(2)
    : km.toString().replace(/(\.\d)$/, '$10');
}

interface Props {
  distance: Distance;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function DistanceCard({ distance, selected, onSelect, disabled = false }: Props) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!disabled) onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect();
    }
  };

  const cardClass = [
    s.card,
    selected ? s.isSelected : '',
    disabled ? s.isDisabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClass}
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={s.top}>
        <span className={s.radio} />
        <h4 className={s.name}>{distance.label}</h4>
        <span className={s.price}>{distance.price} USD</span>
      </div>

      <p className={s.km}>{fmtKm(distance.kilometers)} Km</p>

      {distance.description && (
        <>
          <button
            type="button"
            className={`${s.more}${open ? ` ${s.isOpen}` : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            More information <Icon.chevron aria-hidden="true" />
          </button>
          {open && <p className={s.desc}>{distance.description}</p>}
        </>
      )}
    </div>
  );
}
