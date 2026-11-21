export type {
  Bill,
  BillingError,
  BillingGateway,
  BillingResult,
  BillLine,
  BillPayment,
  BillScope,
  BranchScope,
  OpenTable,
  PaymentInput,
  PaymentMethod,
  Receipt,
  RecordedPayment,
  RefundInput,
  TenantProfile,
  TenantProfileGateway,
} from './domain/index.ts';
export {
  changePreview,
  describeTable,
  METHOD_TEXT,
  participantLabels,
  readPaymentDraft,
  readReceiptNumber,
  readRefundReason,
  type DraftErrors,
  type PaymentDraft,
} from './application/billing.ts';
export { BillingDesk, type BillingDeskProps } from './presentation/BillingDesk.tsx';
export { BillPanel, type BillPanelProps } from './presentation/BillPanel.tsx';
export { PaymentForm, type PaymentFormProps } from './presentation/PaymentForm.tsx';
export { ReceiptPage, ReceiptView, type ReceiptPageProps } from './presentation/ReceiptPage.tsx';
export { CompanyDataCard, type CompanyDataCardProps } from './presentation/CompanyDataCard.tsx';
