import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum AuthorizationStatus {
  AUTHORIZED = "AUTHORIZED",
  CAPTURED = "CAPTURED",
  VOIDED = "VOIDED",
  EXPIRED = "EXPIRED",
};

export enum BranchStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
};

export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
};

export enum OrderApproval {
  NOT_REQUIRED = "NOT_REQUIRED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
};

export enum OrderApprovalMode {
  DIRECT = "DIRECT",
  WAITER_APPROVAL = "WAITER_APPROVAL",
};

export enum OrderItemStatus {
  RECEIVED = "RECEIVED",
  IN_PREPARATION = "IN_PREPARATION",
  READY = "READY",
  PICKED_UP = "PICKED_UP",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
};

export enum OrderQuoteStatus {
  QUOTED = "QUOTED",
  CONFIRMED = "CONFIRMED",
  AUTHORIZED = "AUTHORIZED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
  RELEASE_PENDING = "RELEASE_PENDING",
};

export enum PaymentOperationKind {
  AUTHORIZE = "AUTHORIZE",
  CAPTURE = "CAPTURE",
  VOID = "VOID",
  REFUND = "REFUND",
  CHARGE = "CHARGE",
};

export enum PaymentOperationStatus {
  CREATED = "CREATED",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  UNKNOWN = "UNKNOWN",
};

export enum ServiceRequestKind {
  CALL_WAITER = "CALL_WAITER",
  REQUEST_BILL = "REQUEST_BILL",
};



export interface AddMemberData {
  membership_insert: Membership_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface AddMemberVariables {
  tenantId: UUIDString;
  userId: string;
  roleCode: string;
}

export interface ApproveOrderData {
  sessionLock: number;
  order_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface ApproveOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
}

export interface AssignMemberBranchData {
  membershipBranch_insert: MembershipBranch_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface AssignMemberBranchVariables {
  tenantId: UUIDString;
  userId: string;
  branchId: UUIDString;
}

export interface AttendServiceRequestData {
  serviceRequest_update?: ServiceRequest_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface AttendServiceRequestVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  requestId: UUIDString;
}

export interface AuditEvent_Key {
  id: UUIDString;
  __typename?: 'AuditEvent_Key';
}

export interface BillPayment_Key {
  id: UUIDString;
  __typename?: 'BillPayment_Key';
}

export interface Bill_Key {
  id: UUIDString;
  __typename?: 'Bill_Key';
}

export interface BranchCatalogData {
  productBranches: ({
    productId: UUIDString;
    stationId?: UUIDString | null;
    available: boolean;
    daysMask?: number | null;
    startMinute?: number | null;
    endMinute?: number | null;
    currentPrice?: {
      id: UUIDString;
      amountMinor: Int64String;
      currency: string;
      validFrom: TimestampString;
    } & Price_Key;
  })[];
}

export interface BranchCatalogVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface BranchLayoutData {
  sectors: ({
    id: UUIDString;
    name: string;
    sort: number;
    archivedAt?: TimestampString | null;
    diningTables_on_sector: ({
      id: UUIDString;
      code: string;
      seats: number;
      qrPublicId: UUIDString;
      archivedAt?: TimestampString | null;
    } & DiningTable_Key)[];
  } & Sector_Key)[];
}

export interface BranchLayoutVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface BranchOrderApprovalData {
  branches: ({
    id: UUIDString;
    name: string;
    orderApproval: OrderApprovalMode;
  } & Branch_Key)[];
}

export interface BranchOrderApprovalVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface BranchStationsData {
  stations: ({
    id: UUIDString;
    name: string;
    sort: number;
    defaultForBranchId?: UUIDString | null;
    archivedAt?: TimestampString | null;
  } & Station_Key)[];
}

export interface BranchStationsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface Branch_Key {
  id: UUIDString;
  __typename?: 'Branch_Key';
}

export interface CancelOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface CancelOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
  reason: string;
}

export interface CashCount_Key {
  id: UUIDString;
  __typename?: 'CashCount_Key';
}

export interface CashMovement_Key {
  id: UUIDString;
  __typename?: 'CashMovement_Key';
}

export interface CashSession_Key {
  id: UUIDString;
  __typename?: 'CashSession_Key';
}

export interface CatalogAdminData {
  taxRules: ({
    id: UUIDString;
    name: string;
    rateBp: number;
    archivedAt?: TimestampString | null;
  } & TaxRule_Key)[];
  categories: ({
    id: UUIDString;
    name: string;
    sort: number;
    archivedAt?: TimestampString | null;
    products_on_category: ({
      id: UUIDString;
      name: string;
      description?: string | null;
      allergensDeclared?: string[] | null;
      sort: number;
      taxRuleId?: UUIDString | null;
      archivedAt?: TimestampString | null;
      modifierGroups_on_product: ({
        id: UUIDString;
        name: string;
        minSelect: number;
        maxSelect: number;
        sort: number;
        archivedAt?: TimestampString | null;
        modifierOptions_on_group: ({
          id: UUIDString;
          name: string;
          priceDeltaMinor: Int64String;
          sort: number;
          archivedAt?: TimestampString | null;
        } & ModifierOption_Key)[];
      } & ModifierGroup_Key)[];
    } & Product_Key)[];
  } & Category_Key)[];
}

export interface CatalogAdminVariables {
  tenantId: UUIDString;
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface ChangeMemberRoleData {
  membership_update?: Membership_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ChangeMemberRoleVariables {
  tenantId: UUIDString;
  userId: string;
  roleCode: string;
}

export interface ChangePriceData {
  price_insert: Price_Key;
  productBranch_update?: ProductBranch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ChangePriceVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productId: UUIDString;
  amountMinor: Int64String;
  currency: string;
}

export interface CloseTableSessionData {
  tableSession_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface CloseTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
}

export interface CreateBranchData {
  branch_insert: Branch_Key;
  station_insert: Station_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateBranchVariables {
  tenantId: UUIDString;
  name: string;
  currency: string;
  timezone: string;
}

export interface CreateCategoryData {
  category_insert: Category_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateCategoryVariables {
  tenantId: UUIDString;
  name: string;
  sort: number;
}

export interface CreateModifierGroupData {
  modifierGroup_insert: ModifierGroup_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateModifierGroupVariables {
  tenantId: UUIDString;
  productId: UUIDString;
  name: string;
  minSelect: number;
  maxSelect: number;
  sort: number;
}

export interface CreateModifierOptionData {
  modifierOption_insert: ModifierOption_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateModifierOptionVariables {
  tenantId: UUIDString;
  groupId: UUIDString;
  name: string;
  priceDeltaMinor: Int64String;
  sort: number;
}

export interface CreateProductData {
  product_insert: Product_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateProductVariables {
  tenantId: UUIDString;
  categoryId: UUIDString;
  taxRuleId?: UUIDString | null;
  name: string;
  description?: string | null;
  allergensDeclared?: string[] | null;
  sort: number;
}

export interface CreateSectorData {
  sector_insert: Sector_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateSectorVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  name: string;
  sort: number;
}

export interface CreateStationData {
  station_insert: Station_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  name: string;
  sort: number;
}

export interface CreateTableData {
  diningTable_insert: DiningTable_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateTableVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sectorId: UUIDString;
  code: string;
  seats: number;
}

export interface CreateTaxRuleData {
  taxRule_insert: TaxRule_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface CreateTaxRuleVariables {
  tenantId: UUIDString;
  name: string;
  rateBp: number;
}

export interface DeliverOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface DeliverOrderItemDirectlyData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface DeliverOrderItemDirectlyVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
  reason: string;
}

export interface DeliverOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}

export interface DiningTable_Key {
  id: UUIDString;
  __typename?: 'DiningTable_Key';
}

export interface FinishOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface FinishOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}

export interface FloorViewData {
  sectors: ({
    id: UUIDString;
    name: string;
    diningTables_on_sector: ({
      id: UUIDString;
      code: string;
      seats: number;
      tableSessions_on_table: ({
        id: UUIDString;
        openedAt: TimestampString;
        orders_on_session: ({
          orderItems_on_order: ({
            status: OrderItemStatus;
          })[];
        })[];
        serviceRequests_on_session: ({
          kind: ServiceRequestKind;
          createdAt: TimestampString;
        })[];
      } & TableSession_Key)[];
    } & DiningTable_Key)[];
  } & Sector_Key)[];
}

export interface FloorViewVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface KitchenQueueData {
  orderItems: ({
    id: UUIDString;
    version: number;
    status: OrderItemStatus;
    quantity: number;
    productNameSnapshot: string;
    allergensSnapshot?: string[] | null;
    note?: string | null;
    startedAt?: TimestampString | null;
    orderItemModifiers_on_item: ({
      nameSnapshot: string;
    })[];
    order: {
      id: UUIDString;
      sentToKitchenAt?: TimestampString | null;
      session: {
        table: {
          code: string;
        };
      };
    } & Order_Key;
  } & OrderItem_Key)[];
}

export interface KitchenQueueVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  stationId: UUIDString;
}

export interface KitchenStationsData {
  stations: ({
    id: UUIDString;
    name: string;
    defaultForBranchId?: UUIDString | null;
  } & Station_Key)[];
}

export interface KitchenStationsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface MembershipBranch_Key {
  tenantId: UUIDString;
  userId: string;
  branchId: UUIDString;
  __typename?: 'MembershipBranch_Key';
}

export interface Membership_Key {
  tenantId: UUIDString;
  userId: string;
  __typename?: 'Membership_Key';
}

export interface ModifierGroup_Key {
  id: UUIDString;
  __typename?: 'ModifierGroup_Key';
}

export interface ModifierOption_Key {
  id: UUIDString;
  __typename?: 'ModifierOption_Key';
}

export interface MyBranchesData {
  branches: ({
    id: UUIDString;
    name: string;
    currency: string;
    timezone: string;
  } & Branch_Key)[];
}

export interface MyBranchesVariables {
  tenantId: UUIDString;
}

export interface MyMembershipsData {
  memberships: ({
    tenant: {
      id: UUIDString;
      name: string;
      defaultCurrency: string;
      defaultTimezone: string;
    } & Tenant_Key;
    role: {
      code: string;
      name: string;
      rank: number;
      rolePermissions_on_role: ({
        permission: {
          code: string;
        } & Permission_Key;
      })[];
    } & Role_Key;
  })[];
}

export interface MyOrdersData {
  orders: ({
    id: UUIDString;
    sentToKitchenAt?: TimestampString | null;
    approval: OrderApproval;
    approvalRequestedAt?: TimestampString | null;
    rejectionReason?: string | null;
    quote: {
      currency: string;
      totalMinor: Int64String;
    };
    orderItems_on_order: ({
      id: UUIDString;
      status: OrderItemStatus;
      quantity: number;
      productNameSnapshot: string;
      lineTotalMinor: Int64String;
      note?: string | null;
      orderItemModifiers_on_item: ({
        nameSnapshot: string;
      })[];
    } & OrderItem_Key)[];
  } & Order_Key)[];
}

export interface MyOrdersVariables {
  sessionId: UUIDString;
  branchId: UUIDString;
}

export interface MyParticipationData {
  sessionParticipants: ({
    id: UUIDString;
    branchId: UUIDString;
    expiresAt: TimestampString;
    session: {
      status: TableSessionStatus;
      table: {
        code: string;
      };
    };
  } & SessionParticipant_Key)[];
}

export interface MyParticipationVariables {
  sessionId: UUIDString;
}

export interface MyProfileData {
  userProfile?: {
    id: string;
    displayName: string;
  } & UserProfile_Key;
}

export interface OpenTableSessionData {
  tableSession_insert: TableSession_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface OpenTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  tableId: UUIDString;
}

export interface OrderItemModifier_Key {
  id: UUIDString;
  __typename?: 'OrderItemModifier_Key';
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface OrderQuoteLine_Key {
  id: UUIDString;
  __typename?: 'OrderQuoteLine_Key';
}

export interface OrderQuote_Key {
  id: UUIDString;
  __typename?: 'OrderQuote_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface OutboxEvent_Key {
  id: UUIDString;
  __typename?: 'OutboxEvent_Key';
}

export interface PaymentAllocation_Key {
  id: UUIDString;
  __typename?: 'PaymentAllocation_Key';
}

export interface PaymentAuthorization_Key {
  id: UUIDString;
  __typename?: 'PaymentAuthorization_Key';
}

export interface PaymentOperation_Key {
  id: UUIDString;
  __typename?: 'PaymentOperation_Key';
}

export interface PendingApprovalOrdersData {
  orders: ({
    id: UUIDString;
    approvalRequestedAt?: TimestampString | null;
    session: {
      id: UUIDString;
      table: {
        code: string;
      };
    } & TableSession_Key;
    quote: {
      currency: string;
      totalMinor: Int64String;
    };
    orderItems_on_order: ({
      id: UUIDString;
      quantity: number;
      productNameSnapshot: string;
      note?: string | null;
      allergensSnapshot?: string[] | null;
      orderItemModifiers_on_item: ({
        nameSnapshot: string;
      })[];
    } & OrderItem_Key)[];
  } & Order_Key)[];
}

export interface PendingApprovalOrdersVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface PendingServiceRequestsData {
  serviceRequests: ({
    id: UUIDString;
    kind: ServiceRequestKind;
    createdAt: TimestampString;
    session: {
      id: UUIDString;
      table: {
        code: string;
      };
    } & TableSession_Key;
  } & ServiceRequest_Key)[];
}

export interface PendingServiceRequestsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface Permission_Key {
  code: string;
  __typename?: 'Permission_Key';
}

export interface PickUpOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface PickUpOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}

export interface PickupQueueData {
  orderItems: ({
    id: UUIDString;
    version: number;
    status: OrderItemStatus;
    quantity: number;
    productNameSnapshot: string;
    note?: string | null;
    readyAt?: TimestampString | null;
    pickedUpAt?: TimestampString | null;
    orderItemModifiers_on_item: ({
      nameSnapshot: string;
    })[];
    station: {
      name: string;
    };
    order: {
      session: {
        id: UUIDString;
        table: {
          code: string;
        };
      } & TableSession_Key;
    };
  } & OrderItem_Key)[];
}

export interface PickupQueueVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface Price_Key {
  id: UUIDString;
  __typename?: 'Price_Key';
}

export interface ProductBranch_Key {
  productId: UUIDString;
  branchId: UUIDString;
  __typename?: 'ProductBranch_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface ProviderEvent_Key {
  id: UUIDString;
  __typename?: 'ProviderEvent_Key';
}

export interface PublicMenuData {
  diningTables: ({
    code: string;
    sector: {
      branch: {
        name: string;
        status: BranchStatus;
        currency: string;
        timezone: string;
        productBranches_on_branch: ({
          daysMask?: number | null;
          startMinute?: number | null;
          endMinute?: number | null;
          currentPrice?: {
            id: UUIDString;
            amountMinor: Int64String;
            currency: string;
          } & Price_Key;
          product: {
            id: UUIDString;
            name: string;
            description?: string | null;
            allergensDeclared?: string[] | null;
            sort: number;
            category: {
              id: UUIDString;
              name: string;
              sort: number;
            } & Category_Key;
            modifierGroups_on_product: ({
              id: UUIDString;
              name: string;
              minSelect: number;
              maxSelect: number;
              sort: number;
              modifierOptions_on_group: ({
                id: UUIDString;
                name: string;
                priceDeltaMinor: Int64String;
                sort: number;
              } & ModifierOption_Key)[];
            } & ModifierGroup_Key)[];
          } & Product_Key;
        })[];
      };
    };
  })[];
}

export interface PublicMenuVariables {
  qrPublicId: UUIDString;
}

export interface RateLimitHit_Key {
  id: UUIDString;
  __typename?: 'RateLimitHit_Key';
}

export interface Refund_Key {
  id: UUIDString;
  __typename?: 'Refund_Key';
}

export interface Register_Key {
  id: UUIDString;
  __typename?: 'Register_Key';
}

export interface RejectOrderData {
  order_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface RejectOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
  reason: string;
}

export interface RemoveParticipantData {
  sessionParticipant_update?: SessionParticipant_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface RemoveParticipantVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  participantId: UUIDString;
}

export interface RevokeMemberData {
  membership_update?: Membership_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface RevokeMemberVariables {
  tenantId: UUIDString;
  userId: string;
  reason?: string | null;
}

export interface RolePermission_Key {
  roleCode: string;
  permissionCode: string;
  __typename?: 'RolePermission_Key';
}

export interface Role_Key {
  code: string;
  __typename?: 'Role_Key';
}

export interface RotateTableQrData {
  diningTable_update?: DiningTable_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface RotateTableQrVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  tableId: UUIDString;
}

export interface Sector_Key {
  id: UUIDString;
  __typename?: 'Sector_Key';
}

export interface ServerAdoptOrphanAuthorizationData {
  paymentOperation_updateMany: number;
  orderQuote_update?: OrderQuote_Key | null;
  paymentAuthorization_insert: PaymentAuthorization_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerAdoptOrphanAuthorizationVariables {
  operationId: UUIDString;
  quoteId: UUIDString;
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  participantId: UUIDString;
  provider: string;
  paymentRef: string;
  currency: string;
  amountMinor: Int64String;
  expiresAt?: TimestampString | null;
}

export interface ServerAuthorizationByIdData {
  paymentAuthorization?: {
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    provider: string;
    providerRef: string;
    currency: string;
    authorizedMinor: Int64String;
    capturedMinor: Int64String;
    status: AuthorizationStatus;
    expiresAt?: TimestampString | null;
  } & PaymentAuthorization_Key;
}

export interface ServerAuthorizationByIdVariables {
  authorizationId: UUIDString;
}

export interface ServerAuthorizationsToReleaseData {
  paymentAuthorizations: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    provider: string;
    providerRef: string;
    currency: string;
    authorizedMinor: Int64String;
    capturedMinor: Int64String;
    status: AuthorizationStatus;
    expiresAt?: TimestampString | null;
  } & PaymentAuthorization_Key)[];
}

export interface ServerAuthorizationsToReleaseVariables {
  limit: number;
}

export interface ServerBeginPaymentOperationData {
  paymentOperation_insert: PaymentOperation_Key;
}

export interface ServerBeginPaymentOperationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  kind: PaymentOperationKind;
  idempotencyKey: string;
  currency: string;
  amountMinor: Int64String;
  providerRef?: string | null;
  authorizationId?: UUIDString | null;
  paymentId?: UUIDString | null;
  refundId?: UUIDString | null;
  quoteId?: UUIDString | null;
}

export interface ServerCloseSettledTableSessionData {
  tableSession_updateMany: number;
  bill_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
  settleAudit: AuditEvent_Key;
}

export interface ServerCloseSettledTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  authUid: string;
  billId: UUIDString;
  billVersion: number;
  totalMinor: Int64String;
}

export interface ServerCloseTableSessionData {
  tableSession_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerCloseTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  authUid: string;
}

export interface ServerCompleteOutboxEventData {
  outboxEvent_update?: OutboxEvent_Key | null;
}

export interface ServerCompleteOutboxEventVariables {
  outboxId: UUIDString;
}

export interface ServerConfirmQuoteData {
  orderQuote_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerConfirmQuoteVariables {
  quoteId: UUIDString;
  tenantId: UUIDString;
  authUid: string;
}

export interface ServerCreateDefaultStationData {
  station_insert: Station_Key;
}

export interface ServerCreateDefaultStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}

export interface ServerCreateServiceRequestData {
  serviceRequest_insert: ServiceRequest_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerCreateServiceRequestVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  participantId: UUIDString;
  authUid: string;
  kind: ServiceRequestKind;
}

export interface ServerDeclineAuthorizeData {
  paymentOperation_updateMany: number;
  orderQuote_update?: OrderQuote_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerDeclineAuthorizeVariables {
  operationId: UUIDString;
  quoteId: UUIDString;
  tenantId: UUIDString;
  authUid: string;
  paymentRef: string;
  consentTextVersion: string;
}

export interface ServerDueOutboxEventsData {
  outboxEvents: ({
    id: UUIDString;
    kind: string;
    payload: string;
    attempts: number;
  } & OutboxEvent_Key)[];
}

export interface ServerDueOutboxEventsVariables {
  now: TimestampString;
  limit: number;
}

export interface ServerExpireAuthorizationByRefData {
  paymentAuthorization_updateMany: number;
}

export interface ServerExpireAuthorizationByRefVariables {
  provider: string;
  providerRef: string;
}

export interface ServerExpireAuthorizationData {
  paymentAuthorization_updateMany: number;
}

export interface ServerExpireAuthorizationVariables {
  authorizationId: UUIDString;
}

export interface ServerExpireLapsedAuthorizationsData {
  paymentAuthorization_updateMany: number;
}

export interface ServerExpireLapsedAuthorizationsVariables {
  now: TimestampString;
}

export interface ServerExpiringAuthorizationsData {
  paymentAuthorizations: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    expiresAt?: TimestampString | null;
  } & PaymentAuthorization_Key)[];
}

export interface ServerExpiringAuthorizationsVariables {
  before: TimestampString;
  limit: number;
}

export interface ServerFailCaptureData {
  paymentOperation_updateMany: number;
  billPayment_update?: BillPayment_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerFailCaptureVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  paymentId: UUIDString;
  failureCode: string;
  actorId: string;
}

export interface ServerFailOutboxEventData {
  outboxEvent_update?: OutboxEvent_Key | null;
}

export interface ServerFailOutboxEventVariables {
  outboxId: UUIDString;
  lastError: string;
}

export interface ServerFailPaymentOperationData {
  paymentOperation_updateMany: number;
}

export interface ServerFailPaymentOperationVariables {
  operationId: UUIDString;
  failureCode: string;
}

export interface ServerFinishProviderEventData {
  providerEvent_update?: ProviderEvent_Key | null;
}

export interface ServerFinishProviderEventVariables {
  eventId: UUIDString;
  outcome: string;
  tenantId?: UUIDString | null;
}

export interface ServerHitRateLimitData {
  rateLimitHit_insert: RateLimitHit_Key;
  query?: {
    rateLimitHits: ({
      _count: number;
    })[];
  };
}

export interface ServerHitRateLimitVariables {
  scope: string;
  subject: string;
  since: TimestampString;
  limit: number;
}

export interface ServerInsertParticipantData {
  sessionParticipant_insert: SessionParticipant_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerInsertParticipantVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  authUid: string;
  expiresAt: TimestampString;
}

export interface ServerMarkPaymentOperationUnknownData {
  paymentOperation_updateMany: number;
}

export interface ServerMarkPaymentOperationUnknownVariables {
  operationId: UUIDString;
}

export interface ServerMarkRefundPendingData {
  paymentOperation_updateMany: number;
  refund_updateMany: number;
}

export interface ServerMarkRefundPendingVariables {
  operationId: UUIDString;
  refundId: UUIDString;
  refundRef: string;
}

export interface ServerOpenSessionByQrData {
  diningTables: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    code: string;
    tableSessions_on_table: ({
      id: UUIDString;
      mine: ({
        id: UUIDString;
        expiresAt: TimestampString;
        removedAt?: TimestampString | null;
      } & SessionParticipant_Key)[];
      active: ({
        _count: number;
      })[];
    } & TableSession_Key)[];
  } & DiningTable_Key)[];
}

export interface ServerOpenSessionByQrVariables {
  qrPublicId: UUIDString;
  authUid: string;
}

export interface ServerOrderByQuoteData {
  orders: ({
    id: UUIDString;
    sentToKitchenAt?: TimestampString | null;
    approval: OrderApproval;
  } & Order_Key)[];
}

export interface ServerOrderByQuoteVariables {
  quoteId: UUIDString;
}

export interface ServerPaymentOperationByKeyData {
  paymentOperations: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    kind: PaymentOperationKind;
    status: PaymentOperationStatus;
    idempotencyKey: string;
    authorizationId?: UUIDString | null;
    paymentId?: UUIDString | null;
    refundId?: UUIDString | null;
    quoteId?: UUIDString | null;
    currency: string;
    amountMinor: Int64String;
    providerRef?: string | null;
    failureCode?: string | null;
    attempts: number;
    updatedAt: TimestampString;
  } & PaymentOperation_Key)[];
}

export interface ServerPaymentOperationByKeyVariables {
  idempotencyKey: string;
}

export interface ServerProductsForOrderData {
  productBranches: ({
    productId: UUIDString;
    station?: {
      id: UUIDString;
      archivedAt?: TimestampString | null;
    } & Station_Key;
    product: {
      allergensDeclared?: string[] | null;
    };
  })[];
  defaultStation: ({
    id: UUIDString;
  } & Station_Key)[];
}

export interface ServerProductsForOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productIds: UUIDString[];
}

export interface ServerProductsForQuoteData {
  productBranches: ({
    productId: UUIDString;
    available: boolean;
    daysMask?: number | null;
    startMinute?: number | null;
    endMinute?: number | null;
    currentPrice?: {
      id: UUIDString;
      amountMinor: Int64String;
      currency: string;
    } & Price_Key;
    product: {
      name: string;
      archivedAt?: TimestampString | null;
      category: {
        archivedAt?: TimestampString | null;
      };
      taxRule?: {
        rateBp: number;
        archivedAt?: TimestampString | null;
      };
      modifierGroups_on_product: ({
        id: UUIDString;
        minSelect: number;
        maxSelect: number;
        modifierOptions_on_group: ({
          id: UUIDString;
          name: string;
          priceDeltaMinor: Int64String;
        } & ModifierOption_Key)[];
      } & ModifierGroup_Key)[];
    };
  })[];
}

export interface ServerProductsForQuoteVariables {
  branchId: UUIDString;
  productIds: UUIDString[];
}

export interface ServerProviderEventData {
  providerEvents: ({
    id: UUIDString;
    payloadHash: string;
    processedAt?: TimestampString | null;
  } & ProviderEvent_Key)[];
}

export interface ServerProviderEventVariables {
  provider: string;
  externalEventId: string;
}

export interface ServerQuoteByKeyData {
  orderQuotes: ({
    id: UUIDString;
    fingerprint: string;
    status: OrderQuoteStatus;
    currency: string;
    subtotalMinor: Int64String;
    taxMinor: Int64String;
    totalMinor: Int64String;
    expiresAt: TimestampString;
    orderQuoteLines_on_quote: ({
      position: number;
      productId: UUIDString;
      priceId: UUIDString;
      productNameSnapshot: string;
      quantity: number;
      unitPriceMinor: Int64String;
      modifiersSnapshot?: string[] | null;
      modifiersMinor: Int64String;
      lineTotalMinor: Int64String;
      taxMinor: Int64String;
      note?: string | null;
    })[];
  } & OrderQuote_Key)[];
}

export interface ServerQuoteByKeyVariables {
  participantId: UUIDString;
  idempotencyKey: string;
}

export interface ServerQuoteContextData {
  sessionParticipants: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    session: {
      table: {
        sector: {
          branch: {
            currency: string;
            timezone: string;
            status: BranchStatus;
            tenant: {
              status: TenantStatus;
            };
          };
        };
      };
    };
  } & SessionParticipant_Key)[];
}

export interface ServerQuoteContextVariables {
  sessionId: UUIDString;
  authUid: string;
}

export interface ServerQuoteForSubmitData {
  orderQuotes: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    sessionId: UUIDString;
    participantId: UUIDString;
    status: OrderQuoteStatus;
    currency: string;
    totalMinor: Int64String;
    expiresAt: TimestampString;
    session: {
      status: TableSessionStatus;
      table: {
        sector: {
          branch: {
            orderApproval: OrderApprovalMode;
          };
        };
      };
    };
    participant: {
      removedAt?: TimestampString | null;
      expiresAt: TimestampString;
    };
    orderQuoteLines_on_quote: ({
      position: number;
      productId: UUIDString;
      priceId: UUIDString;
      productNameSnapshot: string;
      quantity: number;
      unitPriceMinor: Int64String;
      modifiersSnapshot?: string[] | null;
      modifiersMinor: Int64String;
      lineTotalMinor: Int64String;
      taxMinor: Int64String;
      note?: string | null;
    })[];
  } & OrderQuote_Key)[];
}

export interface ServerQuoteForSubmitVariables {
  quoteId: UUIDString;
  authUid: string;
}

export interface ServerRecordProviderEventData {
  providerEvent_insert: ProviderEvent_Key;
}

export interface ServerRecordProviderEventVariables {
  provider: string;
  externalEventId: string;
  type: string;
  payloadHash: string;
  providerRef: string;
}

export interface ServerRejectRefundData {
  paymentOperation_updateMany: number;
  refund_update?: Refund_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerRejectRefundVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  refundId: UUIDString;
  failureCode: string;
  actorId: string;
}

export interface ServerRenewParticipantData {
  sessionParticipant_update?: SessionParticipant_Key | null;
}

export interface ServerRenewParticipantVariables {
  participantId: UUIDString;
  expiresAt: TimestampString;
}

export interface ServerRequestOrderApprovalData {
  sessionLock: number;
  order_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerRequestOrderApprovalVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
  authUid: string;
}

export interface ServerRetryOutboxEventData {
  outboxEvent_update?: OutboxEvent_Key | null;
}

export interface ServerRetryOutboxEventVariables {
  outboxId: UUIDString;
  nextAttemptAt: TimestampString;
  lastError: string;
}

export interface ServerRetryPaymentOperationData {
  paymentOperation_updateMany: number;
}

export interface ServerRetryPaymentOperationVariables {
  operationId: UUIDString;
}

export interface ServerSendOrderToKitchenData {
  sessionLock: number;
  order_update?: Order_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerSendOrderToKitchenVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
  authUid: string;
}

export interface ServerSettleAuthorizeData {
  paymentOperation_updateMany: number;
  orderQuote_update?: OrderQuote_Key | null;
  paymentAuthorization_insert: PaymentAuthorization_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerSettleAuthorizeVariables {
  operationId: UUIDString;
  quoteId: UUIDString;
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  participantId: UUIDString;
  authUid: string;
  provider: string;
  paymentRef: string;
  currency: string;
  amountMinor: Int64String;
  expiresAt?: TimestampString | null;
  consentTextVersion: string;
}

export interface ServerSettleCaptureData {
  paymentOperation_updateMany: number;
  paymentAuthorization_update?: PaymentAuthorization_Key | null;
  billPayment_update?: BillPayment_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerSettleCaptureVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  authorizationId: UUIDString;
  paymentId: UUIDString;
  capturedMinor: Int64String;
  providerRef: string;
  actorId: string;
}

export interface ServerSettleRefundData {
  paymentOperation_updateMany: number;
  refund_update?: Refund_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerSettleRefundVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  refundId: UUIDString;
  refundRef: string;
  actorId: string;
}

export interface ServerSettleVoidData {
  paymentOperation_updateMany: number;
  paymentAuthorization_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerSettleVoidVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  authorizationId: UUIDString;
  status: AuthorizationStatus;
  actorId: string;
}

export interface ServerStalePaymentOperationsData {
  paymentOperations: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    kind: PaymentOperationKind;
    status: PaymentOperationStatus;
    idempotencyKey: string;
    authorizationId?: UUIDString | null;
    paymentId?: UUIDString | null;
    refundId?: UUIDString | null;
    quoteId?: UUIDString | null;
    currency: string;
    amountMinor: Int64String;
    providerRef?: string | null;
    failureCode?: string | null;
    attempts: number;
    updatedAt: TimestampString;
    quote?: {
      sessionId: UUIDString;
      participantId: UUIDString;
      status: OrderQuoteStatus;
      expiresAt: TimestampString;
    };
  } & PaymentOperation_Key)[];
}

export interface ServerStalePaymentOperationsVariables {
  before: TimestampString;
  limit: number;
}

export interface ServiceRequest_Key {
  id: UUIDString;
  __typename?: 'ServiceRequest_Key';
}

export interface SessionOrdersData {
  orders: ({
    id: UUIDString;
    sentToKitchenAt?: TimestampString | null;
    orderItems_on_order: ({
      id: UUIDString;
      version: number;
      status: OrderItemStatus;
      quantity: number;
      productNameSnapshot: string;
      note?: string | null;
      cancelReason?: string | null;
      orderItemModifiers_on_item: ({
        nameSnapshot: string;
      })[];
    } & OrderItem_Key)[];
  } & Order_Key)[];
}

export interface SessionOrdersVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
}

export interface SessionParticipant_Key {
  id: UUIDString;
  __typename?: 'SessionParticipant_Key';
}

export interface SessionParticipantsData {
  sessionParticipants: ({
    id: UUIDString;
    joinedAt: TimestampString;
    expiresAt: TimestampString;
    removedAt?: TimestampString | null;
  } & SessionParticipant_Key)[];
}

export interface SessionParticipantsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
}

export interface SetBranchOrderApprovalData {
  branch_update?: Branch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface SetBranchOrderApprovalVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  mode: OrderApprovalMode;
}

export interface SetProductAvailabilityData {
  productBranch_upsert: ProductBranch_Key;
  auditEvent_insert: AuditEvent_Key;
}

export interface SetProductAvailabilityVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productId: UUIDString;
  available: boolean;
  daysMask?: number | null;
  startMinute?: number | null;
  endMinute?: number | null;
}

export interface SetProductStationData {
  productBranch_update?: ProductBranch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface SetProductStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productId: UUIDString;
  stationId: UUIDString;
}

export interface StartOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}

export interface StartOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}

export interface Station_Key {
  id: UUIDString;
  __typename?: 'Station_Key';
}

export interface TableSession_Key {
  id: UUIDString;
  __typename?: 'TableSession_Key';
}

export interface TaxRule_Key {
  id: UUIDString;
  __typename?: 'TaxRule_Key';
}

export interface TenantAuditEventsData {
  auditEvents: ({
    id: UUIDString;
    actorId: string;
    operation: string;
    resourceType: string;
    resourceId: string;
    reason?: string | null;
    at: TimestampString;
  } & AuditEvent_Key)[];
}

export interface TenantAuditEventsVariables {
  tenantId: UUIDString;
}

export interface TenantBranchesData {
  branches: ({
    id: UUIDString;
    name: string;
    currency: string;
    timezone: string;
    status: BranchStatus;
  } & Branch_Key)[];
}

export interface TenantBranchesVariables {
  tenantId: UUIDString;
}

export interface TenantMembersData {
  memberships: ({
    user: {
      id: string;
      displayName: string;
    } & UserProfile_Key;
    role: {
      code: string;
      name: string;
      rank: number;
    } & Role_Key;
    status: MembershipStatus;
    revokedAt?: TimestampString | null;
    membershipBranches_on_membership: ({
      branch: {
        id: UUIDString;
        name: string;
      } & Branch_Key;
    })[];
  })[];
}

export interface TenantMembersVariables {
  tenantId: UUIDString;
}

export interface Tenant_Key {
  id: UUIDString;
  __typename?: 'Tenant_Key';
}

export interface UnassignMemberBranchData {
  membershipBranch_delete?: MembershipBranch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UnassignMemberBranchVariables {
  tenantId: UUIDString;
  userId: string;
  branchId: UUIDString;
}

export interface UpdateBranchData {
  branch_update?: Branch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateBranchVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  name: string;
  timezone: string;
  archived: boolean;
}

export interface UpdateCategoryData {
  category_update?: Category_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateCategoryVariables {
  tenantId: UUIDString;
  categoryId: UUIDString;
  name: string;
  sort: number;
  archived: boolean;
}

export interface UpdateModifierGroupData {
  modifierGroup_update?: ModifierGroup_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateModifierGroupVariables {
  tenantId: UUIDString;
  groupId: UUIDString;
  name: string;
  minSelect: number;
  maxSelect: number;
  sort: number;
  archived: boolean;
}

export interface UpdateModifierOptionData {
  modifierOption_update?: ModifierOption_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateModifierOptionVariables {
  tenantId: UUIDString;
  optionId: UUIDString;
  name: string;
  priceDeltaMinor: Int64String;
  sort: number;
  archived: boolean;
}

export interface UpdateProductData {
  product_update?: Product_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateProductVariables {
  tenantId: UUIDString;
  productId: UUIDString;
  categoryId: UUIDString;
  taxRuleId?: UUIDString | null;
  name: string;
  description?: string | null;
  allergensDeclared?: string[] | null;
  sort: number;
  archived: boolean;
}

export interface UpdateSectorData {
  sector_update?: Sector_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateSectorVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sectorId: UUIDString;
  name: string;
  sort: number;
  archived: boolean;
}

export interface UpdateStationData {
  station_update?: Station_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  stationId: UUIDString;
  name: string;
  sort: number;
  archived: boolean;
}

export interface UpdateTableData {
  diningTable_update?: DiningTable_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateTableVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  tableId: UUIDString;
  sectorId: UUIDString;
  code: string;
  seats: number;
  archived: boolean;
}

export interface UpdateTaxRuleData {
  taxRule_update?: TaxRule_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface UpdateTaxRuleVariables {
  tenantId: UUIDString;
  taxRuleId: UUIDString;
  name: string;
  rateBp: number;
  archived: boolean;
}

export interface UpsertMyProfileData {
  userProfile_upsert: UserProfile_Key;
}

export interface UpsertMyProfileVariables {
  displayName: string;
}

export interface UserProfile_Key {
  id: string;
  __typename?: 'UserProfile_Key';
}

export interface WithdrawMyOrderData {
  order_updateMany: number;
}

export interface WithdrawMyOrderVariables {
  sessionId: UUIDString;
  branchId: UUIDString;
  orderId: UUIDString;
}

interface BranchOrderApprovalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchOrderApprovalVariables): QueryRef<BranchOrderApprovalData, BranchOrderApprovalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: BranchOrderApprovalVariables): QueryRef<BranchOrderApprovalData, BranchOrderApprovalVariables>;
  operationName: string;
}
export const branchOrderApprovalRef: BranchOrderApprovalRef;

export function branchOrderApproval(vars: BranchOrderApprovalVariables, options?: ExecuteQueryOptions): QueryPromise<BranchOrderApprovalData, BranchOrderApprovalVariables>;
export function branchOrderApproval(dc: DataConnect, vars: BranchOrderApprovalVariables, options?: ExecuteQueryOptions): QueryPromise<BranchOrderApprovalData, BranchOrderApprovalVariables>;

interface SetBranchOrderApprovalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetBranchOrderApprovalVariables): MutationRef<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetBranchOrderApprovalVariables): MutationRef<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;
  operationName: string;
}
export const setBranchOrderApprovalRef: SetBranchOrderApprovalRef;

export function setBranchOrderApproval(vars: SetBranchOrderApprovalVariables): MutationPromise<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;
export function setBranchOrderApproval(dc: DataConnect, vars: SetBranchOrderApprovalVariables): MutationPromise<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;

interface PendingApprovalOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PendingApprovalOrdersVariables): QueryRef<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PendingApprovalOrdersVariables): QueryRef<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;
  operationName: string;
}
export const pendingApprovalOrdersRef: PendingApprovalOrdersRef;

export function pendingApprovalOrders(vars: PendingApprovalOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;
export function pendingApprovalOrders(dc: DataConnect, vars: PendingApprovalOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;

interface ApproveOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ApproveOrderVariables): MutationRef<ApproveOrderData, ApproveOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ApproveOrderVariables): MutationRef<ApproveOrderData, ApproveOrderVariables>;
  operationName: string;
}
export const approveOrderRef: ApproveOrderRef;

export function approveOrder(vars: ApproveOrderVariables): MutationPromise<ApproveOrderData, ApproveOrderVariables>;
export function approveOrder(dc: DataConnect, vars: ApproveOrderVariables): MutationPromise<ApproveOrderData, ApproveOrderVariables>;

interface RejectOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RejectOrderVariables): MutationRef<RejectOrderData, RejectOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RejectOrderVariables): MutationRef<RejectOrderData, RejectOrderVariables>;
  operationName: string;
}
export const rejectOrderRef: RejectOrderRef;

export function rejectOrder(vars: RejectOrderVariables): MutationPromise<RejectOrderData, RejectOrderVariables>;
export function rejectOrder(dc: DataConnect, vars: RejectOrderVariables): MutationPromise<RejectOrderData, RejectOrderVariables>;

interface WithdrawMyOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: WithdrawMyOrderVariables): MutationRef<WithdrawMyOrderData, WithdrawMyOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: WithdrawMyOrderVariables): MutationRef<WithdrawMyOrderData, WithdrawMyOrderVariables>;
  operationName: string;
}
export const withdrawMyOrderRef: WithdrawMyOrderRef;

export function withdrawMyOrder(vars: WithdrawMyOrderVariables): MutationPromise<WithdrawMyOrderData, WithdrawMyOrderVariables>;
export function withdrawMyOrder(dc: DataConnect, vars: WithdrawMyOrderVariables): MutationPromise<WithdrawMyOrderData, WithdrawMyOrderVariables>;

interface CatalogAdminRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CatalogAdminVariables): QueryRef<CatalogAdminData, CatalogAdminVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CatalogAdminVariables): QueryRef<CatalogAdminData, CatalogAdminVariables>;
  operationName: string;
}
export const catalogAdminRef: CatalogAdminRef;

export function catalogAdmin(vars: CatalogAdminVariables, options?: ExecuteQueryOptions): QueryPromise<CatalogAdminData, CatalogAdminVariables>;
export function catalogAdmin(dc: DataConnect, vars: CatalogAdminVariables, options?: ExecuteQueryOptions): QueryPromise<CatalogAdminData, CatalogAdminVariables>;

interface BranchCatalogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchCatalogVariables): QueryRef<BranchCatalogData, BranchCatalogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: BranchCatalogVariables): QueryRef<BranchCatalogData, BranchCatalogVariables>;
  operationName: string;
}
export const branchCatalogRef: BranchCatalogRef;

export function branchCatalog(vars: BranchCatalogVariables, options?: ExecuteQueryOptions): QueryPromise<BranchCatalogData, BranchCatalogVariables>;
export function branchCatalog(dc: DataConnect, vars: BranchCatalogVariables, options?: ExecuteQueryOptions): QueryPromise<BranchCatalogData, BranchCatalogVariables>;

interface CreateTaxRuleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaxRuleVariables): MutationRef<CreateTaxRuleData, CreateTaxRuleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTaxRuleVariables): MutationRef<CreateTaxRuleData, CreateTaxRuleVariables>;
  operationName: string;
}
export const createTaxRuleRef: CreateTaxRuleRef;

export function createTaxRule(vars: CreateTaxRuleVariables): MutationPromise<CreateTaxRuleData, CreateTaxRuleVariables>;
export function createTaxRule(dc: DataConnect, vars: CreateTaxRuleVariables): MutationPromise<CreateTaxRuleData, CreateTaxRuleVariables>;

interface UpdateTaxRuleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaxRuleVariables): MutationRef<UpdateTaxRuleData, UpdateTaxRuleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTaxRuleVariables): MutationRef<UpdateTaxRuleData, UpdateTaxRuleVariables>;
  operationName: string;
}
export const updateTaxRuleRef: UpdateTaxRuleRef;

export function updateTaxRule(vars: UpdateTaxRuleVariables): MutationPromise<UpdateTaxRuleData, UpdateTaxRuleVariables>;
export function updateTaxRule(dc: DataConnect, vars: UpdateTaxRuleVariables): MutationPromise<UpdateTaxRuleData, UpdateTaxRuleVariables>;

interface CreateCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
  operationName: string;
}
export const createCategoryRef: CreateCategoryRef;

export function createCategory(vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;
export function createCategory(dc: DataConnect, vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface UpdateCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
  operationName: string;
}
export const updateCategoryRef: UpdateCategoryRef;

export function updateCategory(vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;
export function updateCategory(dc: DataConnect, vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;

interface CreateProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
  operationName: string;
}
export const createProductRef: CreateProductRef;

export function createProduct(vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;
export function createProduct(dc: DataConnect, vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface UpdateProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
  operationName: string;
}
export const updateProductRef: UpdateProductRef;

export function updateProduct(vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;
export function updateProduct(dc: DataConnect, vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;

interface CreateModifierGroupRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateModifierGroupVariables): MutationRef<CreateModifierGroupData, CreateModifierGroupVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateModifierGroupVariables): MutationRef<CreateModifierGroupData, CreateModifierGroupVariables>;
  operationName: string;
}
export const createModifierGroupRef: CreateModifierGroupRef;

export function createModifierGroup(vars: CreateModifierGroupVariables): MutationPromise<CreateModifierGroupData, CreateModifierGroupVariables>;
export function createModifierGroup(dc: DataConnect, vars: CreateModifierGroupVariables): MutationPromise<CreateModifierGroupData, CreateModifierGroupVariables>;

interface UpdateModifierGroupRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateModifierGroupVariables): MutationRef<UpdateModifierGroupData, UpdateModifierGroupVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateModifierGroupVariables): MutationRef<UpdateModifierGroupData, UpdateModifierGroupVariables>;
  operationName: string;
}
export const updateModifierGroupRef: UpdateModifierGroupRef;

export function updateModifierGroup(vars: UpdateModifierGroupVariables): MutationPromise<UpdateModifierGroupData, UpdateModifierGroupVariables>;
export function updateModifierGroup(dc: DataConnect, vars: UpdateModifierGroupVariables): MutationPromise<UpdateModifierGroupData, UpdateModifierGroupVariables>;

interface CreateModifierOptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateModifierOptionVariables): MutationRef<CreateModifierOptionData, CreateModifierOptionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateModifierOptionVariables): MutationRef<CreateModifierOptionData, CreateModifierOptionVariables>;
  operationName: string;
}
export const createModifierOptionRef: CreateModifierOptionRef;

export function createModifierOption(vars: CreateModifierOptionVariables): MutationPromise<CreateModifierOptionData, CreateModifierOptionVariables>;
export function createModifierOption(dc: DataConnect, vars: CreateModifierOptionVariables): MutationPromise<CreateModifierOptionData, CreateModifierOptionVariables>;

interface UpdateModifierOptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateModifierOptionVariables): MutationRef<UpdateModifierOptionData, UpdateModifierOptionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateModifierOptionVariables): MutationRef<UpdateModifierOptionData, UpdateModifierOptionVariables>;
  operationName: string;
}
export const updateModifierOptionRef: UpdateModifierOptionRef;

export function updateModifierOption(vars: UpdateModifierOptionVariables): MutationPromise<UpdateModifierOptionData, UpdateModifierOptionVariables>;
export function updateModifierOption(dc: DataConnect, vars: UpdateModifierOptionVariables): MutationPromise<UpdateModifierOptionData, UpdateModifierOptionVariables>;

interface SetProductAvailabilityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetProductAvailabilityVariables): MutationRef<SetProductAvailabilityData, SetProductAvailabilityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetProductAvailabilityVariables): MutationRef<SetProductAvailabilityData, SetProductAvailabilityVariables>;
  operationName: string;
}
export const setProductAvailabilityRef: SetProductAvailabilityRef;

export function setProductAvailability(vars: SetProductAvailabilityVariables): MutationPromise<SetProductAvailabilityData, SetProductAvailabilityVariables>;
export function setProductAvailability(dc: DataConnect, vars: SetProductAvailabilityVariables): MutationPromise<SetProductAvailabilityData, SetProductAvailabilityVariables>;

interface ChangePriceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ChangePriceVariables): MutationRef<ChangePriceData, ChangePriceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ChangePriceVariables): MutationRef<ChangePriceData, ChangePriceVariables>;
  operationName: string;
}
export const changePriceRef: ChangePriceRef;

export function changePrice(vars: ChangePriceVariables): MutationPromise<ChangePriceData, ChangePriceVariables>;
export function changePrice(dc: DataConnect, vars: ChangePriceVariables): MutationPromise<ChangePriceData, ChangePriceVariables>;

interface PublicMenuRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PublicMenuVariables): QueryRef<PublicMenuData, PublicMenuVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PublicMenuVariables): QueryRef<PublicMenuData, PublicMenuVariables>;
  operationName: string;
}
export const publicMenuRef: PublicMenuRef;

export function publicMenu(vars: PublicMenuVariables, options?: ExecuteQueryOptions): QueryPromise<PublicMenuData, PublicMenuVariables>;
export function publicMenu(dc: DataConnect, vars: PublicMenuVariables, options?: ExecuteQueryOptions): QueryPromise<PublicMenuData, PublicMenuVariables>;

interface MyParticipationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MyParticipationVariables): QueryRef<MyParticipationData, MyParticipationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MyParticipationVariables): QueryRef<MyParticipationData, MyParticipationVariables>;
  operationName: string;
}
export const myParticipationRef: MyParticipationRef;

export function myParticipation(vars: MyParticipationVariables, options?: ExecuteQueryOptions): QueryPromise<MyParticipationData, MyParticipationVariables>;
export function myParticipation(dc: DataConnect, vars: MyParticipationVariables, options?: ExecuteQueryOptions): QueryPromise<MyParticipationData, MyParticipationVariables>;

interface MyOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MyOrdersVariables): QueryRef<MyOrdersData, MyOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MyOrdersVariables): QueryRef<MyOrdersData, MyOrdersVariables>;
  operationName: string;
}
export const myOrdersRef: MyOrdersRef;

export function myOrders(vars: MyOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<MyOrdersData, MyOrdersVariables>;
export function myOrders(dc: DataConnect, vars: MyOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<MyOrdersData, MyOrdersVariables>;

interface BranchStationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchStationsVariables): QueryRef<BranchStationsData, BranchStationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: BranchStationsVariables): QueryRef<BranchStationsData, BranchStationsVariables>;
  operationName: string;
}
export const branchStationsRef: BranchStationsRef;

export function branchStations(vars: BranchStationsVariables, options?: ExecuteQueryOptions): QueryPromise<BranchStationsData, BranchStationsVariables>;
export function branchStations(dc: DataConnect, vars: BranchStationsVariables, options?: ExecuteQueryOptions): QueryPromise<BranchStationsData, BranchStationsVariables>;

interface CreateStationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateStationVariables): MutationRef<CreateStationData, CreateStationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateStationVariables): MutationRef<CreateStationData, CreateStationVariables>;
  operationName: string;
}
export const createStationRef: CreateStationRef;

export function createStation(vars: CreateStationVariables): MutationPromise<CreateStationData, CreateStationVariables>;
export function createStation(dc: DataConnect, vars: CreateStationVariables): MutationPromise<CreateStationData, CreateStationVariables>;

interface UpdateStationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateStationVariables): MutationRef<UpdateStationData, UpdateStationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateStationVariables): MutationRef<UpdateStationData, UpdateStationVariables>;
  operationName: string;
}
export const updateStationRef: UpdateStationRef;

export function updateStation(vars: UpdateStationVariables): MutationPromise<UpdateStationData, UpdateStationVariables>;
export function updateStation(dc: DataConnect, vars: UpdateStationVariables): MutationPromise<UpdateStationData, UpdateStationVariables>;

interface SetProductStationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetProductStationVariables): MutationRef<SetProductStationData, SetProductStationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetProductStationVariables): MutationRef<SetProductStationData, SetProductStationVariables>;
  operationName: string;
}
export const setProductStationRef: SetProductStationRef;

export function setProductStation(vars: SetProductStationVariables): MutationPromise<SetProductStationData, SetProductStationVariables>;
export function setProductStation(dc: DataConnect, vars: SetProductStationVariables): MutationPromise<SetProductStationData, SetProductStationVariables>;

interface KitchenStationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: KitchenStationsVariables): QueryRef<KitchenStationsData, KitchenStationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: KitchenStationsVariables): QueryRef<KitchenStationsData, KitchenStationsVariables>;
  operationName: string;
}
export const kitchenStationsRef: KitchenStationsRef;

export function kitchenStations(vars: KitchenStationsVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenStationsData, KitchenStationsVariables>;
export function kitchenStations(dc: DataConnect, vars: KitchenStationsVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenStationsData, KitchenStationsVariables>;

interface KitchenQueueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: KitchenQueueVariables): QueryRef<KitchenQueueData, KitchenQueueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: KitchenQueueVariables): QueryRef<KitchenQueueData, KitchenQueueVariables>;
  operationName: string;
}
export const kitchenQueueRef: KitchenQueueRef;

export function kitchenQueue(vars: KitchenQueueVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenQueueData, KitchenQueueVariables>;
export function kitchenQueue(dc: DataConnect, vars: KitchenQueueVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenQueueData, KitchenQueueVariables>;

interface StartOrderItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: StartOrderItemVariables): MutationRef<StartOrderItemData, StartOrderItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: StartOrderItemVariables): MutationRef<StartOrderItemData, StartOrderItemVariables>;
  operationName: string;
}
export const startOrderItemRef: StartOrderItemRef;

export function startOrderItem(vars: StartOrderItemVariables): MutationPromise<StartOrderItemData, StartOrderItemVariables>;
export function startOrderItem(dc: DataConnect, vars: StartOrderItemVariables): MutationPromise<StartOrderItemData, StartOrderItemVariables>;

interface FinishOrderItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: FinishOrderItemVariables): MutationRef<FinishOrderItemData, FinishOrderItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: FinishOrderItemVariables): MutationRef<FinishOrderItemData, FinishOrderItemVariables>;
  operationName: string;
}
export const finishOrderItemRef: FinishOrderItemRef;

export function finishOrderItem(vars: FinishOrderItemVariables): MutationPromise<FinishOrderItemData, FinishOrderItemVariables>;
export function finishOrderItem(dc: DataConnect, vars: FinishOrderItemVariables): MutationPromise<FinishOrderItemData, FinishOrderItemVariables>;

interface BranchLayoutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchLayoutVariables): QueryRef<BranchLayoutData, BranchLayoutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: BranchLayoutVariables): QueryRef<BranchLayoutData, BranchLayoutVariables>;
  operationName: string;
}
export const branchLayoutRef: BranchLayoutRef;

export function branchLayout(vars: BranchLayoutVariables, options?: ExecuteQueryOptions): QueryPromise<BranchLayoutData, BranchLayoutVariables>;
export function branchLayout(dc: DataConnect, vars: BranchLayoutVariables, options?: ExecuteQueryOptions): QueryPromise<BranchLayoutData, BranchLayoutVariables>;

interface CreateSectorRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSectorVariables): MutationRef<CreateSectorData, CreateSectorVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSectorVariables): MutationRef<CreateSectorData, CreateSectorVariables>;
  operationName: string;
}
export const createSectorRef: CreateSectorRef;

export function createSector(vars: CreateSectorVariables): MutationPromise<CreateSectorData, CreateSectorVariables>;
export function createSector(dc: DataConnect, vars: CreateSectorVariables): MutationPromise<CreateSectorData, CreateSectorVariables>;

interface UpdateSectorRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSectorVariables): MutationRef<UpdateSectorData, UpdateSectorVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSectorVariables): MutationRef<UpdateSectorData, UpdateSectorVariables>;
  operationName: string;
}
export const updateSectorRef: UpdateSectorRef;

export function updateSector(vars: UpdateSectorVariables): MutationPromise<UpdateSectorData, UpdateSectorVariables>;
export function updateSector(dc: DataConnect, vars: UpdateSectorVariables): MutationPromise<UpdateSectorData, UpdateSectorVariables>;

interface CreateTableRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTableVariables): MutationRef<CreateTableData, CreateTableVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTableVariables): MutationRef<CreateTableData, CreateTableVariables>;
  operationName: string;
}
export const createTableRef: CreateTableRef;

export function createTable(vars: CreateTableVariables): MutationPromise<CreateTableData, CreateTableVariables>;
export function createTable(dc: DataConnect, vars: CreateTableVariables): MutationPromise<CreateTableData, CreateTableVariables>;

interface UpdateTableRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTableVariables): MutationRef<UpdateTableData, UpdateTableVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTableVariables): MutationRef<UpdateTableData, UpdateTableVariables>;
  operationName: string;
}
export const updateTableRef: UpdateTableRef;

export function updateTable(vars: UpdateTableVariables): MutationPromise<UpdateTableData, UpdateTableVariables>;
export function updateTable(dc: DataConnect, vars: UpdateTableVariables): MutationPromise<UpdateTableData, UpdateTableVariables>;

interface RotateTableQrRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RotateTableQrVariables): MutationRef<RotateTableQrData, RotateTableQrVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RotateTableQrVariables): MutationRef<RotateTableQrData, RotateTableQrVariables>;
  operationName: string;
}
export const rotateTableQrRef: RotateTableQrRef;

export function rotateTableQr(vars: RotateTableQrVariables): MutationPromise<RotateTableQrData, RotateTableQrVariables>;
export function rotateTableQr(dc: DataConnect, vars: RotateTableQrVariables): MutationPromise<RotateTableQrData, RotateTableQrVariables>;

interface UpsertMyProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
  operationName: string;
}
export const upsertMyProfileRef: UpsertMyProfileRef;

export function upsertMyProfile(vars: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;
export function upsertMyProfile(dc: DataConnect, vars: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;

interface AddMemberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddMemberVariables): MutationRef<AddMemberData, AddMemberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddMemberVariables): MutationRef<AddMemberData, AddMemberVariables>;
  operationName: string;
}
export const addMemberRef: AddMemberRef;

export function addMember(vars: AddMemberVariables): MutationPromise<AddMemberData, AddMemberVariables>;
export function addMember(dc: DataConnect, vars: AddMemberVariables): MutationPromise<AddMemberData, AddMemberVariables>;

interface ChangeMemberRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ChangeMemberRoleVariables): MutationRef<ChangeMemberRoleData, ChangeMemberRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ChangeMemberRoleVariables): MutationRef<ChangeMemberRoleData, ChangeMemberRoleVariables>;
  operationName: string;
}
export const changeMemberRoleRef: ChangeMemberRoleRef;

export function changeMemberRole(vars: ChangeMemberRoleVariables): MutationPromise<ChangeMemberRoleData, ChangeMemberRoleVariables>;
export function changeMemberRole(dc: DataConnect, vars: ChangeMemberRoleVariables): MutationPromise<ChangeMemberRoleData, ChangeMemberRoleVariables>;

interface RevokeMemberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RevokeMemberVariables): MutationRef<RevokeMemberData, RevokeMemberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RevokeMemberVariables): MutationRef<RevokeMemberData, RevokeMemberVariables>;
  operationName: string;
}
export const revokeMemberRef: RevokeMemberRef;

export function revokeMember(vars: RevokeMemberVariables): MutationPromise<RevokeMemberData, RevokeMemberVariables>;
export function revokeMember(dc: DataConnect, vars: RevokeMemberVariables): MutationPromise<RevokeMemberData, RevokeMemberVariables>;

interface AssignMemberBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignMemberBranchVariables): MutationRef<AssignMemberBranchData, AssignMemberBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignMemberBranchVariables): MutationRef<AssignMemberBranchData, AssignMemberBranchVariables>;
  operationName: string;
}
export const assignMemberBranchRef: AssignMemberBranchRef;

export function assignMemberBranch(vars: AssignMemberBranchVariables): MutationPromise<AssignMemberBranchData, AssignMemberBranchVariables>;
export function assignMemberBranch(dc: DataConnect, vars: AssignMemberBranchVariables): MutationPromise<AssignMemberBranchData, AssignMemberBranchVariables>;

interface UnassignMemberBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UnassignMemberBranchVariables): MutationRef<UnassignMemberBranchData, UnassignMemberBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UnassignMemberBranchVariables): MutationRef<UnassignMemberBranchData, UnassignMemberBranchVariables>;
  operationName: string;
}
export const unassignMemberBranchRef: UnassignMemberBranchRef;

export function unassignMemberBranch(vars: UnassignMemberBranchVariables): MutationPromise<UnassignMemberBranchData, UnassignMemberBranchVariables>;
export function unassignMemberBranch(dc: DataConnect, vars: UnassignMemberBranchVariables): MutationPromise<UnassignMemberBranchData, UnassignMemberBranchVariables>;

interface ServerPaymentOperationByKeyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerPaymentOperationByKeyVariables): QueryRef<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerPaymentOperationByKeyVariables): QueryRef<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;
  operationName: string;
}
export const serverPaymentOperationByKeyRef: ServerPaymentOperationByKeyRef;

export function serverPaymentOperationByKey(vars: ServerPaymentOperationByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;
export function serverPaymentOperationByKey(dc: DataConnect, vars: ServerPaymentOperationByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;

interface ServerStalePaymentOperationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerStalePaymentOperationsVariables): QueryRef<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerStalePaymentOperationsVariables): QueryRef<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;
  operationName: string;
}
export const serverStalePaymentOperationsRef: ServerStalePaymentOperationsRef;

export function serverStalePaymentOperations(vars: ServerStalePaymentOperationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;
export function serverStalePaymentOperations(dc: DataConnect, vars: ServerStalePaymentOperationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;

interface ServerAuthorizationByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerAuthorizationByIdVariables): QueryRef<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerAuthorizationByIdVariables): QueryRef<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;
  operationName: string;
}
export const serverAuthorizationByIdRef: ServerAuthorizationByIdRef;

export function serverAuthorizationById(vars: ServerAuthorizationByIdVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;
export function serverAuthorizationById(dc: DataConnect, vars: ServerAuthorizationByIdVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;

interface ServerAuthorizationsToReleaseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerAuthorizationsToReleaseVariables): QueryRef<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerAuthorizationsToReleaseVariables): QueryRef<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;
  operationName: string;
}
export const serverAuthorizationsToReleaseRef: ServerAuthorizationsToReleaseRef;

export function serverAuthorizationsToRelease(vars: ServerAuthorizationsToReleaseVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;
export function serverAuthorizationsToRelease(dc: DataConnect, vars: ServerAuthorizationsToReleaseVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;

interface ServerExpiringAuthorizationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpiringAuthorizationsVariables): QueryRef<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerExpiringAuthorizationsVariables): QueryRef<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;
  operationName: string;
}
export const serverExpiringAuthorizationsRef: ServerExpiringAuthorizationsRef;

export function serverExpiringAuthorizations(vars: ServerExpiringAuthorizationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;
export function serverExpiringAuthorizations(dc: DataConnect, vars: ServerExpiringAuthorizationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;

interface ServerProviderEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerProviderEventVariables): QueryRef<ServerProviderEventData, ServerProviderEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerProviderEventVariables): QueryRef<ServerProviderEventData, ServerProviderEventVariables>;
  operationName: string;
}
export const serverProviderEventRef: ServerProviderEventRef;

export function serverProviderEvent(vars: ServerProviderEventVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProviderEventData, ServerProviderEventVariables>;
export function serverProviderEvent(dc: DataConnect, vars: ServerProviderEventVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProviderEventData, ServerProviderEventVariables>;

interface ServerDueOutboxEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerDueOutboxEventsVariables): QueryRef<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerDueOutboxEventsVariables): QueryRef<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;
  operationName: string;
}
export const serverDueOutboxEventsRef: ServerDueOutboxEventsRef;

export function serverDueOutboxEvents(vars: ServerDueOutboxEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;
export function serverDueOutboxEvents(dc: DataConnect, vars: ServerDueOutboxEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;

interface ServerBeginPaymentOperationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerBeginPaymentOperationVariables): MutationRef<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerBeginPaymentOperationVariables): MutationRef<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;
  operationName: string;
}
export const serverBeginPaymentOperationRef: ServerBeginPaymentOperationRef;

export function serverBeginPaymentOperation(vars: ServerBeginPaymentOperationVariables): MutationPromise<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;
export function serverBeginPaymentOperation(dc: DataConnect, vars: ServerBeginPaymentOperationVariables): MutationPromise<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;

interface ServerRetryPaymentOperationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRetryPaymentOperationVariables): MutationRef<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerRetryPaymentOperationVariables): MutationRef<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;
  operationName: string;
}
export const serverRetryPaymentOperationRef: ServerRetryPaymentOperationRef;

export function serverRetryPaymentOperation(vars: ServerRetryPaymentOperationVariables): MutationPromise<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;
export function serverRetryPaymentOperation(dc: DataConnect, vars: ServerRetryPaymentOperationVariables): MutationPromise<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;

interface ServerMarkPaymentOperationUnknownRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerMarkPaymentOperationUnknownVariables): MutationRef<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerMarkPaymentOperationUnknownVariables): MutationRef<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;
  operationName: string;
}
export const serverMarkPaymentOperationUnknownRef: ServerMarkPaymentOperationUnknownRef;

export function serverMarkPaymentOperationUnknown(vars: ServerMarkPaymentOperationUnknownVariables): MutationPromise<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;
export function serverMarkPaymentOperationUnknown(dc: DataConnect, vars: ServerMarkPaymentOperationUnknownVariables): MutationPromise<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;

interface ServerFailPaymentOperationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFailPaymentOperationVariables): MutationRef<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerFailPaymentOperationVariables): MutationRef<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;
  operationName: string;
}
export const serverFailPaymentOperationRef: ServerFailPaymentOperationRef;

export function serverFailPaymentOperation(vars: ServerFailPaymentOperationVariables): MutationPromise<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;
export function serverFailPaymentOperation(dc: DataConnect, vars: ServerFailPaymentOperationVariables): MutationPromise<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;

interface ServerSettleAuthorizeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleAuthorizeVariables): MutationRef<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerSettleAuthorizeVariables): MutationRef<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;
  operationName: string;
}
export const serverSettleAuthorizeRef: ServerSettleAuthorizeRef;

export function serverSettleAuthorize(vars: ServerSettleAuthorizeVariables): MutationPromise<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;
export function serverSettleAuthorize(dc: DataConnect, vars: ServerSettleAuthorizeVariables): MutationPromise<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;

interface ServerDeclineAuthorizeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerDeclineAuthorizeVariables): MutationRef<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerDeclineAuthorizeVariables): MutationRef<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;
  operationName: string;
}
export const serverDeclineAuthorizeRef: ServerDeclineAuthorizeRef;

export function serverDeclineAuthorize(vars: ServerDeclineAuthorizeVariables): MutationPromise<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;
export function serverDeclineAuthorize(dc: DataConnect, vars: ServerDeclineAuthorizeVariables): MutationPromise<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;

interface ServerAdoptOrphanAuthorizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerAdoptOrphanAuthorizationVariables): MutationRef<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerAdoptOrphanAuthorizationVariables): MutationRef<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;
  operationName: string;
}
export const serverAdoptOrphanAuthorizationRef: ServerAdoptOrphanAuthorizationRef;

export function serverAdoptOrphanAuthorization(vars: ServerAdoptOrphanAuthorizationVariables): MutationPromise<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;
export function serverAdoptOrphanAuthorization(dc: DataConnect, vars: ServerAdoptOrphanAuthorizationVariables): MutationPromise<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;

interface ServerSettleCaptureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleCaptureVariables): MutationRef<ServerSettleCaptureData, ServerSettleCaptureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerSettleCaptureVariables): MutationRef<ServerSettleCaptureData, ServerSettleCaptureVariables>;
  operationName: string;
}
export const serverSettleCaptureRef: ServerSettleCaptureRef;

export function serverSettleCapture(vars: ServerSettleCaptureVariables): MutationPromise<ServerSettleCaptureData, ServerSettleCaptureVariables>;
export function serverSettleCapture(dc: DataConnect, vars: ServerSettleCaptureVariables): MutationPromise<ServerSettleCaptureData, ServerSettleCaptureVariables>;

interface ServerFailCaptureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFailCaptureVariables): MutationRef<ServerFailCaptureData, ServerFailCaptureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerFailCaptureVariables): MutationRef<ServerFailCaptureData, ServerFailCaptureVariables>;
  operationName: string;
}
export const serverFailCaptureRef: ServerFailCaptureRef;

export function serverFailCapture(vars: ServerFailCaptureVariables): MutationPromise<ServerFailCaptureData, ServerFailCaptureVariables>;
export function serverFailCapture(dc: DataConnect, vars: ServerFailCaptureVariables): MutationPromise<ServerFailCaptureData, ServerFailCaptureVariables>;

interface ServerSettleVoidRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleVoidVariables): MutationRef<ServerSettleVoidData, ServerSettleVoidVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerSettleVoidVariables): MutationRef<ServerSettleVoidData, ServerSettleVoidVariables>;
  operationName: string;
}
export const serverSettleVoidRef: ServerSettleVoidRef;

export function serverSettleVoid(vars: ServerSettleVoidVariables): MutationPromise<ServerSettleVoidData, ServerSettleVoidVariables>;
export function serverSettleVoid(dc: DataConnect, vars: ServerSettleVoidVariables): MutationPromise<ServerSettleVoidData, ServerSettleVoidVariables>;

interface ServerExpireAuthorizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpireAuthorizationVariables): MutationRef<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerExpireAuthorizationVariables): MutationRef<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;
  operationName: string;
}
export const serverExpireAuthorizationRef: ServerExpireAuthorizationRef;

export function serverExpireAuthorization(vars: ServerExpireAuthorizationVariables): MutationPromise<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;
export function serverExpireAuthorization(dc: DataConnect, vars: ServerExpireAuthorizationVariables): MutationPromise<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;

interface ServerExpireAuthorizationByRefRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpireAuthorizationByRefVariables): MutationRef<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerExpireAuthorizationByRefVariables): MutationRef<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;
  operationName: string;
}
export const serverExpireAuthorizationByRefRef: ServerExpireAuthorizationByRefRef;

export function serverExpireAuthorizationByRef(vars: ServerExpireAuthorizationByRefVariables): MutationPromise<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;
export function serverExpireAuthorizationByRef(dc: DataConnect, vars: ServerExpireAuthorizationByRefVariables): MutationPromise<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;

interface ServerExpireLapsedAuthorizationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpireLapsedAuthorizationsVariables): MutationRef<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerExpireLapsedAuthorizationsVariables): MutationRef<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;
  operationName: string;
}
export const serverExpireLapsedAuthorizationsRef: ServerExpireLapsedAuthorizationsRef;

export function serverExpireLapsedAuthorizations(vars: ServerExpireLapsedAuthorizationsVariables): MutationPromise<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;
export function serverExpireLapsedAuthorizations(dc: DataConnect, vars: ServerExpireLapsedAuthorizationsVariables): MutationPromise<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;

interface ServerSettleRefundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleRefundVariables): MutationRef<ServerSettleRefundData, ServerSettleRefundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerSettleRefundVariables): MutationRef<ServerSettleRefundData, ServerSettleRefundVariables>;
  operationName: string;
}
export const serverSettleRefundRef: ServerSettleRefundRef;

export function serverSettleRefund(vars: ServerSettleRefundVariables): MutationPromise<ServerSettleRefundData, ServerSettleRefundVariables>;
export function serverSettleRefund(dc: DataConnect, vars: ServerSettleRefundVariables): MutationPromise<ServerSettleRefundData, ServerSettleRefundVariables>;

interface ServerMarkRefundPendingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerMarkRefundPendingVariables): MutationRef<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerMarkRefundPendingVariables): MutationRef<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;
  operationName: string;
}
export const serverMarkRefundPendingRef: ServerMarkRefundPendingRef;

export function serverMarkRefundPending(vars: ServerMarkRefundPendingVariables): MutationPromise<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;
export function serverMarkRefundPending(dc: DataConnect, vars: ServerMarkRefundPendingVariables): MutationPromise<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;

interface ServerRejectRefundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRejectRefundVariables): MutationRef<ServerRejectRefundData, ServerRejectRefundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerRejectRefundVariables): MutationRef<ServerRejectRefundData, ServerRejectRefundVariables>;
  operationName: string;
}
export const serverRejectRefundRef: ServerRejectRefundRef;

export function serverRejectRefund(vars: ServerRejectRefundVariables): MutationPromise<ServerRejectRefundData, ServerRejectRefundVariables>;
export function serverRejectRefund(dc: DataConnect, vars: ServerRejectRefundVariables): MutationPromise<ServerRejectRefundData, ServerRejectRefundVariables>;

interface ServerRecordProviderEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRecordProviderEventVariables): MutationRef<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerRecordProviderEventVariables): MutationRef<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;
  operationName: string;
}
export const serverRecordProviderEventRef: ServerRecordProviderEventRef;

export function serverRecordProviderEvent(vars: ServerRecordProviderEventVariables): MutationPromise<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;
export function serverRecordProviderEvent(dc: DataConnect, vars: ServerRecordProviderEventVariables): MutationPromise<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;

interface ServerFinishProviderEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFinishProviderEventVariables): MutationRef<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerFinishProviderEventVariables): MutationRef<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;
  operationName: string;
}
export const serverFinishProviderEventRef: ServerFinishProviderEventRef;

export function serverFinishProviderEvent(vars: ServerFinishProviderEventVariables): MutationPromise<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;
export function serverFinishProviderEvent(dc: DataConnect, vars: ServerFinishProviderEventVariables): MutationPromise<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;

interface ServerCompleteOutboxEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCompleteOutboxEventVariables): MutationRef<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerCompleteOutboxEventVariables): MutationRef<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;
  operationName: string;
}
export const serverCompleteOutboxEventRef: ServerCompleteOutboxEventRef;

export function serverCompleteOutboxEvent(vars: ServerCompleteOutboxEventVariables): MutationPromise<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;
export function serverCompleteOutboxEvent(dc: DataConnect, vars: ServerCompleteOutboxEventVariables): MutationPromise<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;

interface ServerRetryOutboxEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRetryOutboxEventVariables): MutationRef<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerRetryOutboxEventVariables): MutationRef<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;
  operationName: string;
}
export const serverRetryOutboxEventRef: ServerRetryOutboxEventRef;

export function serverRetryOutboxEvent(vars: ServerRetryOutboxEventVariables): MutationPromise<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;
export function serverRetryOutboxEvent(dc: DataConnect, vars: ServerRetryOutboxEventVariables): MutationPromise<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;

interface ServerFailOutboxEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFailOutboxEventVariables): MutationRef<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerFailOutboxEventVariables): MutationRef<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;
  operationName: string;
}
export const serverFailOutboxEventRef: ServerFailOutboxEventRef;

export function serverFailOutboxEvent(vars: ServerFailOutboxEventVariables): MutationPromise<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;
export function serverFailOutboxEvent(dc: DataConnect, vars: ServerFailOutboxEventVariables): MutationPromise<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;

interface PickupQueueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PickupQueueVariables): QueryRef<PickupQueueData, PickupQueueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PickupQueueVariables): QueryRef<PickupQueueData, PickupQueueVariables>;
  operationName: string;
}
export const pickupQueueRef: PickupQueueRef;

export function pickupQueue(vars: PickupQueueVariables, options?: ExecuteQueryOptions): QueryPromise<PickupQueueData, PickupQueueVariables>;
export function pickupQueue(dc: DataConnect, vars: PickupQueueVariables, options?: ExecuteQueryOptions): QueryPromise<PickupQueueData, PickupQueueVariables>;

interface SessionOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SessionOrdersVariables): QueryRef<SessionOrdersData, SessionOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SessionOrdersVariables): QueryRef<SessionOrdersData, SessionOrdersVariables>;
  operationName: string;
}
export const sessionOrdersRef: SessionOrdersRef;

export function sessionOrders(vars: SessionOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<SessionOrdersData, SessionOrdersVariables>;
export function sessionOrders(dc: DataConnect, vars: SessionOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<SessionOrdersData, SessionOrdersVariables>;

interface PickUpOrderItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PickUpOrderItemVariables): MutationRef<PickUpOrderItemData, PickUpOrderItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PickUpOrderItemVariables): MutationRef<PickUpOrderItemData, PickUpOrderItemVariables>;
  operationName: string;
}
export const pickUpOrderItemRef: PickUpOrderItemRef;

export function pickUpOrderItem(vars: PickUpOrderItemVariables): MutationPromise<PickUpOrderItemData, PickUpOrderItemVariables>;
export function pickUpOrderItem(dc: DataConnect, vars: PickUpOrderItemVariables): MutationPromise<PickUpOrderItemData, PickUpOrderItemVariables>;

interface DeliverOrderItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeliverOrderItemVariables): MutationRef<DeliverOrderItemData, DeliverOrderItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeliverOrderItemVariables): MutationRef<DeliverOrderItemData, DeliverOrderItemVariables>;
  operationName: string;
}
export const deliverOrderItemRef: DeliverOrderItemRef;

export function deliverOrderItem(vars: DeliverOrderItemVariables): MutationPromise<DeliverOrderItemData, DeliverOrderItemVariables>;
export function deliverOrderItem(dc: DataConnect, vars: DeliverOrderItemVariables): MutationPromise<DeliverOrderItemData, DeliverOrderItemVariables>;

interface DeliverOrderItemDirectlyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeliverOrderItemDirectlyVariables): MutationRef<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeliverOrderItemDirectlyVariables): MutationRef<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;
  operationName: string;
}
export const deliverOrderItemDirectlyRef: DeliverOrderItemDirectlyRef;

export function deliverOrderItemDirectly(vars: DeliverOrderItemDirectlyVariables): MutationPromise<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;
export function deliverOrderItemDirectly(dc: DataConnect, vars: DeliverOrderItemDirectlyVariables): MutationPromise<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;

interface CancelOrderItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelOrderItemVariables): MutationRef<CancelOrderItemData, CancelOrderItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CancelOrderItemVariables): MutationRef<CancelOrderItemData, CancelOrderItemVariables>;
  operationName: string;
}
export const cancelOrderItemRef: CancelOrderItemRef;

export function cancelOrderItem(vars: CancelOrderItemVariables): MutationPromise<CancelOrderItemData, CancelOrderItemVariables>;
export function cancelOrderItem(dc: DataConnect, vars: CancelOrderItemVariables): MutationPromise<CancelOrderItemData, CancelOrderItemVariables>;

interface PendingServiceRequestsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PendingServiceRequestsVariables): QueryRef<PendingServiceRequestsData, PendingServiceRequestsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PendingServiceRequestsVariables): QueryRef<PendingServiceRequestsData, PendingServiceRequestsVariables>;
  operationName: string;
}
export const pendingServiceRequestsRef: PendingServiceRequestsRef;

export function pendingServiceRequests(vars: PendingServiceRequestsVariables, options?: ExecuteQueryOptions): QueryPromise<PendingServiceRequestsData, PendingServiceRequestsVariables>;
export function pendingServiceRequests(dc: DataConnect, vars: PendingServiceRequestsVariables, options?: ExecuteQueryOptions): QueryPromise<PendingServiceRequestsData, PendingServiceRequestsVariables>;

interface AttendServiceRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AttendServiceRequestVariables): MutationRef<AttendServiceRequestData, AttendServiceRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AttendServiceRequestVariables): MutationRef<AttendServiceRequestData, AttendServiceRequestVariables>;
  operationName: string;
}
export const attendServiceRequestRef: AttendServiceRequestRef;

export function attendServiceRequest(vars: AttendServiceRequestVariables): MutationPromise<AttendServiceRequestData, AttendServiceRequestVariables>;
export function attendServiceRequest(dc: DataConnect, vars: AttendServiceRequestVariables): MutationPromise<AttendServiceRequestData, AttendServiceRequestVariables>;

interface MyProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyProfileData, undefined>;
  operationName: string;
}
export const myProfileRef: MyProfileRef;

export function myProfile(options?: ExecuteQueryOptions): QueryPromise<MyProfileData, undefined>;
export function myProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyProfileData, undefined>;

interface MyMembershipsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyMembershipsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyMembershipsData, undefined>;
  operationName: string;
}
export const myMembershipsRef: MyMembershipsRef;

export function myMemberships(options?: ExecuteQueryOptions): QueryPromise<MyMembershipsData, undefined>;
export function myMemberships(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyMembershipsData, undefined>;

interface MyBranchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MyBranchesVariables): QueryRef<MyBranchesData, MyBranchesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MyBranchesVariables): QueryRef<MyBranchesData, MyBranchesVariables>;
  operationName: string;
}
export const myBranchesRef: MyBranchesRef;

export function myBranches(vars: MyBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<MyBranchesData, MyBranchesVariables>;
export function myBranches(dc: DataConnect, vars: MyBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<MyBranchesData, MyBranchesVariables>;

interface TenantMembersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: TenantMembersVariables): QueryRef<TenantMembersData, TenantMembersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: TenantMembersVariables): QueryRef<TenantMembersData, TenantMembersVariables>;
  operationName: string;
}
export const tenantMembersRef: TenantMembersRef;

export function tenantMembers(vars: TenantMembersVariables, options?: ExecuteQueryOptions): QueryPromise<TenantMembersData, TenantMembersVariables>;
export function tenantMembers(dc: DataConnect, vars: TenantMembersVariables, options?: ExecuteQueryOptions): QueryPromise<TenantMembersData, TenantMembersVariables>;

interface TenantAuditEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: TenantAuditEventsVariables): QueryRef<TenantAuditEventsData, TenantAuditEventsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: TenantAuditEventsVariables): QueryRef<TenantAuditEventsData, TenantAuditEventsVariables>;
  operationName: string;
}
export const tenantAuditEventsRef: TenantAuditEventsRef;

export function tenantAuditEvents(vars: TenantAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<TenantAuditEventsData, TenantAuditEventsVariables>;
export function tenantAuditEvents(dc: DataConnect, vars: TenantAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<TenantAuditEventsData, TenantAuditEventsVariables>;

interface FloorViewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: FloorViewVariables): QueryRef<FloorViewData, FloorViewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: FloorViewVariables): QueryRef<FloorViewData, FloorViewVariables>;
  operationName: string;
}
export const floorViewRef: FloorViewRef;

export function floorView(vars: FloorViewVariables, options?: ExecuteQueryOptions): QueryPromise<FloorViewData, FloorViewVariables>;
export function floorView(dc: DataConnect, vars: FloorViewVariables, options?: ExecuteQueryOptions): QueryPromise<FloorViewData, FloorViewVariables>;

interface SessionParticipantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SessionParticipantsVariables): QueryRef<SessionParticipantsData, SessionParticipantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SessionParticipantsVariables): QueryRef<SessionParticipantsData, SessionParticipantsVariables>;
  operationName: string;
}
export const sessionParticipantsRef: SessionParticipantsRef;

export function sessionParticipants(vars: SessionParticipantsVariables, options?: ExecuteQueryOptions): QueryPromise<SessionParticipantsData, SessionParticipantsVariables>;
export function sessionParticipants(dc: DataConnect, vars: SessionParticipantsVariables, options?: ExecuteQueryOptions): QueryPromise<SessionParticipantsData, SessionParticipantsVariables>;

interface OpenTableSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: OpenTableSessionVariables): MutationRef<OpenTableSessionData, OpenTableSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: OpenTableSessionVariables): MutationRef<OpenTableSessionData, OpenTableSessionVariables>;
  operationName: string;
}
export const openTableSessionRef: OpenTableSessionRef;

export function openTableSession(vars: OpenTableSessionVariables): MutationPromise<OpenTableSessionData, OpenTableSessionVariables>;
export function openTableSession(dc: DataConnect, vars: OpenTableSessionVariables): MutationPromise<OpenTableSessionData, OpenTableSessionVariables>;

interface CloseTableSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CloseTableSessionVariables): MutationRef<CloseTableSessionData, CloseTableSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CloseTableSessionVariables): MutationRef<CloseTableSessionData, CloseTableSessionVariables>;
  operationName: string;
}
export const closeTableSessionRef: CloseTableSessionRef;

export function closeTableSession(vars: CloseTableSessionVariables): MutationPromise<CloseTableSessionData, CloseTableSessionVariables>;
export function closeTableSession(dc: DataConnect, vars: CloseTableSessionVariables): MutationPromise<CloseTableSessionData, CloseTableSessionVariables>;

interface RemoveParticipantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RemoveParticipantVariables): MutationRef<RemoveParticipantData, RemoveParticipantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RemoveParticipantVariables): MutationRef<RemoveParticipantData, RemoveParticipantVariables>;
  operationName: string;
}
export const removeParticipantRef: RemoveParticipantRef;

export function removeParticipant(vars: RemoveParticipantVariables): MutationPromise<RemoveParticipantData, RemoveParticipantVariables>;
export function removeParticipant(dc: DataConnect, vars: RemoveParticipantVariables): MutationPromise<RemoveParticipantData, RemoveParticipantVariables>;

interface ServerOpenSessionByQrRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerOpenSessionByQrVariables): QueryRef<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerOpenSessionByQrVariables): QueryRef<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;
  operationName: string;
}
export const serverOpenSessionByQrRef: ServerOpenSessionByQrRef;

export function serverOpenSessionByQr(vars: ServerOpenSessionByQrVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;
export function serverOpenSessionByQr(dc: DataConnect, vars: ServerOpenSessionByQrVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;

interface ServerInsertParticipantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerInsertParticipantVariables): MutationRef<ServerInsertParticipantData, ServerInsertParticipantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerInsertParticipantVariables): MutationRef<ServerInsertParticipantData, ServerInsertParticipantVariables>;
  operationName: string;
}
export const serverInsertParticipantRef: ServerInsertParticipantRef;

export function serverInsertParticipant(vars: ServerInsertParticipantVariables): MutationPromise<ServerInsertParticipantData, ServerInsertParticipantVariables>;
export function serverInsertParticipant(dc: DataConnect, vars: ServerInsertParticipantVariables): MutationPromise<ServerInsertParticipantData, ServerInsertParticipantVariables>;

interface ServerRenewParticipantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRenewParticipantVariables): MutationRef<ServerRenewParticipantData, ServerRenewParticipantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerRenewParticipantVariables): MutationRef<ServerRenewParticipantData, ServerRenewParticipantVariables>;
  operationName: string;
}
export const serverRenewParticipantRef: ServerRenewParticipantRef;

export function serverRenewParticipant(vars: ServerRenewParticipantVariables): MutationPromise<ServerRenewParticipantData, ServerRenewParticipantVariables>;
export function serverRenewParticipant(dc: DataConnect, vars: ServerRenewParticipantVariables): MutationPromise<ServerRenewParticipantData, ServerRenewParticipantVariables>;

interface ServerQuoteContextRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteContextVariables): QueryRef<ServerQuoteContextData, ServerQuoteContextVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerQuoteContextVariables): QueryRef<ServerQuoteContextData, ServerQuoteContextVariables>;
  operationName: string;
}
export const serverQuoteContextRef: ServerQuoteContextRef;

export function serverQuoteContext(vars: ServerQuoteContextVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteContextData, ServerQuoteContextVariables>;
export function serverQuoteContext(dc: DataConnect, vars: ServerQuoteContextVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteContextData, ServerQuoteContextVariables>;

interface ServerProductsForQuoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerProductsForQuoteVariables): QueryRef<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerProductsForQuoteVariables): QueryRef<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;
  operationName: string;
}
export const serverProductsForQuoteRef: ServerProductsForQuoteRef;

export function serverProductsForQuote(vars: ServerProductsForQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;
export function serverProductsForQuote(dc: DataConnect, vars: ServerProductsForQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;

interface ServerQuoteByKeyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteByKeyVariables): QueryRef<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerQuoteByKeyVariables): QueryRef<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;
  operationName: string;
}
export const serverQuoteByKeyRef: ServerQuoteByKeyRef;

export function serverQuoteByKey(vars: ServerQuoteByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;
export function serverQuoteByKey(dc: DataConnect, vars: ServerQuoteByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;

interface ServerQuoteForSubmitRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteForSubmitVariables): QueryRef<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerQuoteForSubmitVariables): QueryRef<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;
  operationName: string;
}
export const serverQuoteForSubmitRef: ServerQuoteForSubmitRef;

export function serverQuoteForSubmit(vars: ServerQuoteForSubmitVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;
export function serverQuoteForSubmit(dc: DataConnect, vars: ServerQuoteForSubmitVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;

interface ServerHitRateLimitRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerHitRateLimitVariables): MutationRef<ServerHitRateLimitData, ServerHitRateLimitVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerHitRateLimitVariables): MutationRef<ServerHitRateLimitData, ServerHitRateLimitVariables>;
  operationName: string;
}
export const serverHitRateLimitRef: ServerHitRateLimitRef;

export function serverHitRateLimit(vars: ServerHitRateLimitVariables): MutationPromise<ServerHitRateLimitData, ServerHitRateLimitVariables>;
export function serverHitRateLimit(dc: DataConnect, vars: ServerHitRateLimitVariables): MutationPromise<ServerHitRateLimitData, ServerHitRateLimitVariables>;

interface ServerOrderByQuoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerOrderByQuoteVariables): QueryRef<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerOrderByQuoteVariables): QueryRef<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;
  operationName: string;
}
export const serverOrderByQuoteRef: ServerOrderByQuoteRef;

export function serverOrderByQuote(vars: ServerOrderByQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;
export function serverOrderByQuote(dc: DataConnect, vars: ServerOrderByQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;

interface ServerProductsForOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerProductsForOrderVariables): QueryRef<ServerProductsForOrderData, ServerProductsForOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerProductsForOrderVariables): QueryRef<ServerProductsForOrderData, ServerProductsForOrderVariables>;
  operationName: string;
}
export const serverProductsForOrderRef: ServerProductsForOrderRef;

export function serverProductsForOrder(vars: ServerProductsForOrderVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForOrderData, ServerProductsForOrderVariables>;
export function serverProductsForOrder(dc: DataConnect, vars: ServerProductsForOrderVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForOrderData, ServerProductsForOrderVariables>;

interface ServerCreateDefaultStationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCreateDefaultStationVariables): MutationRef<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerCreateDefaultStationVariables): MutationRef<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;
  operationName: string;
}
export const serverCreateDefaultStationRef: ServerCreateDefaultStationRef;

export function serverCreateDefaultStation(vars: ServerCreateDefaultStationVariables): MutationPromise<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;
export function serverCreateDefaultStation(dc: DataConnect, vars: ServerCreateDefaultStationVariables): MutationPromise<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;

interface ServerSendOrderToKitchenRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSendOrderToKitchenVariables): MutationRef<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerSendOrderToKitchenVariables): MutationRef<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;
  operationName: string;
}
export const serverSendOrderToKitchenRef: ServerSendOrderToKitchenRef;

export function serverSendOrderToKitchen(vars: ServerSendOrderToKitchenVariables): MutationPromise<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;
export function serverSendOrderToKitchen(dc: DataConnect, vars: ServerSendOrderToKitchenVariables): MutationPromise<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;

interface ServerConfirmQuoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerConfirmQuoteVariables): MutationRef<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerConfirmQuoteVariables): MutationRef<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;
  operationName: string;
}
export const serverConfirmQuoteRef: ServerConfirmQuoteRef;

export function serverConfirmQuote(vars: ServerConfirmQuoteVariables): MutationPromise<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;
export function serverConfirmQuote(dc: DataConnect, vars: ServerConfirmQuoteVariables): MutationPromise<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;

interface ServerRequestOrderApprovalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRequestOrderApprovalVariables): MutationRef<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerRequestOrderApprovalVariables): MutationRef<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;
  operationName: string;
}
export const serverRequestOrderApprovalRef: ServerRequestOrderApprovalRef;

export function serverRequestOrderApproval(vars: ServerRequestOrderApprovalVariables): MutationPromise<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;
export function serverRequestOrderApproval(dc: DataConnect, vars: ServerRequestOrderApprovalVariables): MutationPromise<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;

interface ServerCreateServiceRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCreateServiceRequestVariables): MutationRef<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerCreateServiceRequestVariables): MutationRef<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;
  operationName: string;
}
export const serverCreateServiceRequestRef: ServerCreateServiceRequestRef;

export function serverCreateServiceRequest(vars: ServerCreateServiceRequestVariables): MutationPromise<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;
export function serverCreateServiceRequest(dc: DataConnect, vars: ServerCreateServiceRequestVariables): MutationPromise<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;

interface ServerCloseTableSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCloseTableSessionVariables): MutationRef<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerCloseTableSessionVariables): MutationRef<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;
  operationName: string;
}
export const serverCloseTableSessionRef: ServerCloseTableSessionRef;

export function serverCloseTableSession(vars: ServerCloseTableSessionVariables): MutationPromise<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;
export function serverCloseTableSession(dc: DataConnect, vars: ServerCloseTableSessionVariables): MutationPromise<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;

interface ServerCloseSettledTableSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCloseSettledTableSessionVariables): MutationRef<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerCloseSettledTableSessionVariables): MutationRef<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;
  operationName: string;
}
export const serverCloseSettledTableSessionRef: ServerCloseSettledTableSessionRef;

export function serverCloseSettledTableSession(vars: ServerCloseSettledTableSessionVariables): MutationPromise<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;
export function serverCloseSettledTableSession(dc: DataConnect, vars: ServerCloseSettledTableSessionVariables): MutationPromise<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;

interface TenantBranchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: TenantBranchesVariables): QueryRef<TenantBranchesData, TenantBranchesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: TenantBranchesVariables): QueryRef<TenantBranchesData, TenantBranchesVariables>;
  operationName: string;
}
export const tenantBranchesRef: TenantBranchesRef;

export function tenantBranches(vars: TenantBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<TenantBranchesData, TenantBranchesVariables>;
export function tenantBranches(dc: DataConnect, vars: TenantBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<TenantBranchesData, TenantBranchesVariables>;

interface CreateBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBranchVariables): MutationRef<CreateBranchData, CreateBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBranchVariables): MutationRef<CreateBranchData, CreateBranchVariables>;
  operationName: string;
}
export const createBranchRef: CreateBranchRef;

export function createBranch(vars: CreateBranchVariables): MutationPromise<CreateBranchData, CreateBranchVariables>;
export function createBranch(dc: DataConnect, vars: CreateBranchVariables): MutationPromise<CreateBranchData, CreateBranchVariables>;

interface UpdateBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBranchVariables): MutationRef<UpdateBranchData, UpdateBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBranchVariables): MutationRef<UpdateBranchData, UpdateBranchVariables>;
  operationName: string;
}
export const updateBranchRef: UpdateBranchRef;

export function updateBranch(vars: UpdateBranchVariables): MutationPromise<UpdateBranchData, UpdateBranchVariables>;
export function updateBranch(dc: DataConnect, vars: UpdateBranchVariables): MutationPromise<UpdateBranchData, UpdateBranchVariables>;

