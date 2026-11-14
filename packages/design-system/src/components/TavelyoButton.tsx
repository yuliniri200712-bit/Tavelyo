import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { classNames } from './class-names.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

export interface TavelyoButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  readonly variant?: ButtonVariant;
  /** Mientras carga, el botón conserva el foco pero no acepta otra pulsación (evita el doble envío). */
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly type?: 'button' | 'submit' | 'reset';
}

export function TavelyoButton({
  variant = 'primary',
  loading = false,
  loadingLabel = 'Procesando…',
  type = 'button',
  className,
  onClick,
  children,
  ...rest
}: TavelyoButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...rest}
      type={type}
      className={classNames('tv-button', `tv-button--${variant}`, className)}
      aria-disabled={loading ? true : rest['aria-disabled']}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading ? (
        <>
          <span className="tv-spinner" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
