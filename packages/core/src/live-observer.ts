/**
 * Quien recibe una lectura en tiempo real (ADR-0007): cada resultado nuevo del servidor o la falla
 * de la suscripción. Lo implementan las pantallas; lo usan los contratos de las pasarelas.
 */
export interface LiveObserver<T, E> {
  readonly onData: (value: T) => void;
  readonly onError: (error: E) => void;
}
