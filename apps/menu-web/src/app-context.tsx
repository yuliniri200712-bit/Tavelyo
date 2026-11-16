import { createContext, useContext } from 'react';
import type { Services } from './composition.ts';

export const AppContext = createContext<Services | null>(null);

export function useServices(): Services {
  const value = useContext(AppContext);
  if (!value) throw new Error('useServices debe usarse dentro de <AppContext.Provider>.');
  return value;
}
