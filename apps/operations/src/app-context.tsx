import { createContext, useContext } from 'react';
import type { PwaUpdateState } from '@tavelyo/pwa-shell';
import type { Services } from './composition.ts';

export interface AppContextValue {
  readonly services: Services;
  readonly update: PwaUpdateState;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppContext debe usarse dentro de <AppContext.Provider>.');
  return value;
}
