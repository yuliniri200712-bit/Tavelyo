import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

/**
 * Retenciones del cierre por inactividad (D-25): una pantalla que se mira sin tocar, como la de
 * cocina, retiene el cierre mientras está montada. El guardián solo las respeta con la pestaña
 * visible; oculta, la inactividad cuenta como siempre (D-19).
 */
export interface InactivityHolds {
  /** Registra una retención; devuelve la función que la libera. */
  hold(): () => void;
  isHeld(): boolean;
}

const HoldContext = createContext<InactivityHolds | null>(null);

export function InactivityHoldProvider({ children }: { readonly children: ReactNode }) {
  const count = useRef(0);
  const holds = useMemo<InactivityHolds>(
    () => ({
      hold() {
        count.current += 1;
        let released = false;
        return () => {
          if (released) return;
          released = true;
          count.current -= 1;
        };
      },
      isHeld: () => count.current > 0,
    }),
    [],
  );
  return <HoldContext.Provider value={holds}>{children}</HoldContext.Provider>;
}

/** Retenciones vigentes, o null fuera del proveedor. */
export function useInactivityHolds(): InactivityHolds | null {
  return useContext(HoldContext);
}

/** La pantalla que lo usa retiene el cierre por inactividad mientras está montada (D-25). */
export function useInactivityHold(active = true): void {
  const holds = useContext(HoldContext);
  useEffect(() => {
    if (!active || !holds) return undefined;
    return holds.hold();
  }, [active, holds]);
}
