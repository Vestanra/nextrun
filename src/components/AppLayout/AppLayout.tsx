import type { ReactNode } from 'react';
import AppFooter from '@/components/AppFooter/AppFooter';
import s from './AppLayout.module.css';

export function Container({ children }: { children: ReactNode }) {
  return <div className={s.container}>{children}</div>;
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={s.root}>
      <main className={s.main}>{children}</main>
      <AppFooter />
    </div>
  );
}
