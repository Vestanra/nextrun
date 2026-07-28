import Icon from '@/components/Icon/Icon';
import s from './SearchBar.module.css';

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search races by name…',
}: Props) {
  return (
    <form
      className={s.search}
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className={s.input}
        type="text"
        placeholder={placeholder}
        value={value}
        aria-label="Search races by name"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className={s.clear}
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <Icon.close aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className={s.btn}
        aria-label="Search"
        tabIndex={-1}
      >
        <Icon.search aria-hidden="true" />
      </button>
    </form>
  );
}
