import { useEffect, useId, useRef, type ReactNode } from 'react';
import { TavelyoButton } from './TavelyoButton.tsx';

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  /** Qué recurso, monto y efecto tiene la acción (IV §6). */
  readonly children: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly destructive?: boolean;
  readonly busy?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** Diálogo modal nativo (`<dialog>`): foco atrapado, Escape cancela y el foco vuelve al origen. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // En acciones destructivas el foco inicial va a «Cancelar», la opción segura.
      (destructive ? cancelRef : confirmRef).current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, destructive]);

  return (
    <dialog
      ref={ref}
      className="tv-dialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <div className="tv-dialog__body">
        <h2 id={titleId}>{title}</h2>
        <div id={bodyId}>{children}</div>
      </div>
      <div className="tv-dialog__actions">
        <TavelyoButton variant="secondary" onClick={onCancel} disabled={busy} ref={cancelRef}>
          {cancelLabel}
        </TavelyoButton>
        <TavelyoButton
          variant={destructive ? 'destructive' : 'primary'}
          onClick={onConfirm}
          loading={busy}
          ref={confirmRef}
        >
          {confirmLabel}
        </TavelyoButton>
      </div>
    </dialog>
  );
}
