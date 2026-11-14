export type {
  BranchOption,
  TenancyErrorCode,
  TenancyGateway,
  TenantMembership,
} from './domain/index.ts';
export {
  canChangeContext,
  contextKey,
  initialSelection,
  selectionReducer,
  type SelectionEvent,
  type SelectionState,
} from './application/selection.ts';
export {
  TenancyProvider,
  useTenancy,
  type TenancyContextValue,
} from './presentation/TenancyProvider.tsx';
export {
  ContextBar,
  TenantSelector,
  type ContextBarProps,
} from './presentation/TenantSelector.tsx';
