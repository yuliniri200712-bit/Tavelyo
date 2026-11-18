import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { TextAreaField } from './TextAreaField.tsx';

export interface ReasonDialogProps {
  readonly open: boolean;
  readonly title: string;
  /** Qué pasa al confirmar (recurso y efecto, IV §6). */
  readonly children: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly destructive?: boolean;
  readonly label: string;
  readonly hint?: string;
  readonly maxLength: number;
  /** Devuelve el motivo limpio o null si no es válido (mismo criterio que el servidor). */
  readonly parse: (text: string) => string | null;
  /** Texto del error cuando el motivo no es válido. */
  readonly invalidText: string;
  readonly onConfirm: (reason: string) => void;
  readonly onCancel: () => void;
}

/** Confirmación que exige escribir un motivo (cancelar, saltarse un paso…): queda en el registro. */
export function ReasonDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Volver',
  destructive = false,
  label,
  hint,
  maxLength,
  parse,
  invalidText,
  onConfirm,
  onCancel,
}: ReasonDialogProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const reset = () => {
    setText('');
    setError(undefined);
  };
  return (
    <ConfirmDialog
      open={open}
      title={title}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      destructive={destructive}
      onCancel={() => {
        reset();
        onCancel();
      }}
      onConfirm={() => {
        const reason = parse(text);
        if (!reason) {
          setError(invalidText);
          return;
        }
        reset();
        onConfirm(reason);
      }}
    >
      {children}
      <TextAreaField
        label={label}
        value={text}
        maxLength={maxLength}
        onChange={(event) => setText(event.target.value)}
        {...(hint ? { hint } : {})}
        {...(error ? { error } : {})}
      />
    </ConfirmDialog>
  );
}
