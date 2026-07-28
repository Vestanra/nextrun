import type { ReactNode } from 'react';
import Icon from '@/components/Icon/Icon';

interface Props {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, required = true, error, children }: Props) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field__label" htmlFor={htmlFor}>
        {label} {required && <span className="req">*</span>}
      </label>
      {children}
      {error && (
        <p className="field__error">
          <Icon.alert aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
