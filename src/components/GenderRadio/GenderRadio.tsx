import type { Gender } from '@/types/event';

interface Props {
  value: Gender | '';
  onChange: (g: Gender) => void;
  invalid?: boolean;
  name?: string;
  id?: string;
}

const OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other'  },
];

export default function GenderRadio({ value, onChange, invalid, name = 'gender', id }: Props) {
  return (
    <div className="radio-row" id={id} aria-invalid={invalid}>
      {OPTIONS.map((opt) => (
        <label key={opt.value} className={`radio-pill${value === opt.value ? ' is-on' : ''}`}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span className="radio" />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
