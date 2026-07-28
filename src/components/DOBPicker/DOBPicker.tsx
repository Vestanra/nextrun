const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

function daysInMonth(month: string, year: string): number {
  if (!month) return 31;
  return new Date(year ? +year : 2000, +month, 0).getDate();
}

interface Props {
  day: string;
  month: string;
  year: string;
  onChange: (part: 'day' | 'month' | 'year', value: string) => void;
  invalid?: boolean;
}

export default function DOBPicker({ day, month, year, onChange, invalid }: Props) {
  const maxDays = daysInMonth(month, year);
  const dayOptions = Array.from({ length: maxDays }, (_, i) => i + 1);

  const handleChange = (part: 'day' | 'month' | 'year', value: string) => {
    onChange(part, value);
    // Clamp day if month/year change reduces available days
    if (part === 'month' || part === 'year') {
      const newMonth = part === 'month' ? value : month;
      const newYear = part === 'year' ? value : year;
      const max = daysInMonth(newMonth, newYear);
      if (day && +day > max) {
        onChange('day', String(max));
      }
    }
  };

  return (
    <div className="field-row field-row--dob">
      <select
        className="select"
        value={day}
        aria-label="Day of birth"
        aria-invalid={invalid}
        onChange={(e) => handleChange('day', e.target.value)}
      >
        <option value="">DD</option>
        {dayOptions.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        className="select"
        value={month}
        aria-label="Month of birth"
        aria-invalid={invalid}
        onChange={(e) => handleChange('month', e.target.value)}
      >
        <option value="">MM</option>
        {MONTHS.map((m, i) => (
          <option key={i} value={i + 1}>{m}</option>
        ))}
      </select>

      <select
        className="select"
        value={year}
        aria-label="Year of birth"
        aria-invalid={invalid}
        onChange={(e) => handleChange('year', e.target.value)}
      >
        <option value="">YYYY</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
