export type {
  CartLine,
  CartOption,
  CartOptionGroup,
  CartProduct,
  CartStorage,
} from './domain/index.ts';
export {
  acceptServerPrices,
  addToCart,
  cartTotal,
  clampQuantity,
  itemCount,
  lineTotal,
  normalizeNote,
  removeLine,
  setQuantity,
  toQuoteLines,
  unitTotal,
  type AddResult,
} from './application/cart.ts';
export {
  describeGroupRule,
  isSingleChoice,
  selectedOptions,
  toggleOption,
  validateSelection,
} from './application/selection.ts';
export { CART_TTL_MS, cartStorageKey, loadCart, saveCart } from './application/storage.ts';
export { CartLines, describeOptions, type CartLinesProps } from './presentation/CartLines.tsx';
export {
  ProductConfigurator,
  type ProductChoice,
  type ProductConfiguratorProps,
} from './presentation/ProductConfigurator.tsx';
export { QuantityStepper, type QuantityStepperProps } from './presentation/QuantityStepper.tsx';
