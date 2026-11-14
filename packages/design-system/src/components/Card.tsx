import { useId, type ReactNode } from 'react';

export interface CardProps {
  readonly title?: string;
  /** Nivel del título dentro de la página, para mantener la jerarquía de encabezados. */
  readonly headingLevel?: 2 | 3;
  readonly children: ReactNode;
}

export function Card({ title, headingLevel = 3, children }: CardProps) {
  const headingId = useId();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section className="tv-card" aria-labelledby={title ? headingId : undefined}>
      {title ? <Heading id={headingId}>{title}</Heading> : null}
      {children}
    </section>
  );
}
