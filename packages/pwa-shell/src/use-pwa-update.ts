import { useRegisterSW } from 'virtual:pwa-register/react';
import type { PwaUpdateState } from './PwaShell.tsx';

/** Registra el service worker y expone el aviso de nueva versión para `PwaShell`. */
export function usePwaUpdate(): PwaUpdateState {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  return {
    needRefresh,
    onUpdate: () => void updateServiceWorker(true),
    onDismiss: () => setNeedRefresh(false),
  };
}
