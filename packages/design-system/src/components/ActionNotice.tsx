export interface ActionNoticeProps {
  /** Resultado de la última acción; null mientras no hay ninguno. */
  readonly notice: { readonly tone: 'success' | 'error'; readonly text: string } | null;
}

/**
 * Resultado de la última acción («Mesa M3 agregada», «Cierra la mesa antes de archivarla»),
 * anunciado por el lector de pantalla. La región existe siempre para que el anuncio no se pierda.
 */
export function ActionNotice({ notice }: ActionNoticeProps) {
  return (
    <div role="status" aria-live="polite">
      {notice ? (
        <p className={notice.tone === 'error' ? 'tv-form__error' : 'tv-form__notice'}>
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}
