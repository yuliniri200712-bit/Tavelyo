export type {
  CustomerError,
  CustomerGateway,
  CustomerRejection,
  CustomerResult,
  MenuProduct,
  PublicMenu,
} from './domain/index.ts';
export { describeOffering, menuSections, type MenuSection } from './application/menu.ts';
export {
  describeChange,
  describeProblem,
  formatMinor,
  newAttemptKey,
} from './application/review-text.ts';
export { OrderReviewPage, type OrderReviewPageProps } from './presentation/OrderReviewPage.tsx';
export { TableMenuPage, type TableMenuPageProps } from './presentation/TableMenuPage.tsx';
export {
  TableOrderProvider,
  useTableOrder,
  type TableOrderProviderProps,
} from './presentation/TableOrderProvider.tsx';
export { customerErrorText, type CheckoutState } from './presentation/useCheckout.ts';
