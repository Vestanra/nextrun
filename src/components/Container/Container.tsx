import type { ReactNode } from "react";
import s from "./Container.module.css";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/* Shared content-width wrapper — mirrors the prototype's .container
   (max-width var(--container), centered, gutter padding). */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={className ? `${s.container} ${className}` : s.container}>
      {children}
    </div>
  );
}
