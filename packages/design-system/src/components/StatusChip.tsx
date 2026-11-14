export type StatusTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export interface StatusChipProps {
  /** Texto del estado: el color nunca es la única señal (IV §4). */
  readonly label: string;
  readonly tone?: StatusTone;
}

export function StatusChip({ label, tone = 'neutral' }: StatusChipProps) {
  return <span className={`tv-chip tv-chip--${tone}`}>{label}</span>;
}
