export type {
  BranchScope,
  CashError,
  CashGateway,
  CashMovement,
  CashMovementKind,
  CashResult,
  ManualMovement,
  Register,
  Till,
  TillCount,
} from './domain/index.ts';
export {
  availableRegisters,
  describeDifference,
  MOVEMENT_TEXT,
  readCashReason,
  readPesos,
  readRegisterName,
  REGISTER_NAME_MAX,
} from './application/cash-desk.ts';
export { TillPanel, type TillPanelProps } from './presentation/TillPanel.tsx';
export { RegistersAdmin, type RegistersAdminProps } from './presentation/RegistersAdmin.tsx';
