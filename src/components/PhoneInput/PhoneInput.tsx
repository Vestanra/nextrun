interface Props {
  value: string;
  onChange: (digitsOnly: string) => void;
  invalid?: boolean;
  id?: string;
}

export default function PhoneInput({ value, onChange, invalid, id }: Props) {
  const sanitize = (raw: string) => raw.replace(/\D/g, '');

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      className="input"
      placeholder="Digits only, 8–15 characters"
      value={value}
      aria-invalid={invalid}
      onChange={(e) => onChange(sanitize(e.target.value))}
      onPaste={(e) => {
        e.preventDefault();
        onChange(sanitize(e.clipboardData.getData('text')));
      }}
    />
  );
}
