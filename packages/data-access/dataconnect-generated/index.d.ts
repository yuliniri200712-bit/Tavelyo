import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum BranchStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
};

export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
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
  AUTHORIZED = "AUTHORIZED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
  RELEASE_PENDING = "RELEASE_PENDING",
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
  tableSession_update?: TableSession_Key | null;
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
  } & Order_Key)[];
}

export interface ServerOrderByQuoteVariables {
  quoteId: UUIDString;
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

export interface ServerQuoteForPaymentData {
  orderQuotes: ({
    id: UUIDString;
    tenantId: UUIDString;
    status: OrderQuoteStatus;
    currency: string;
    totalMinor: Int64String;
    expiresAt: TimestampString;
    paymentRef?: string | null;
  } & OrderQuote_Key)[];
}

export interface ServerQuoteForPaymentVariables {
  quoteId: UUIDString;
  authUid: string;
}

export interface ServerRenewParticipantData {
  sessionParticipant_update?: SessionParticipant_Key | null;
}

export interface ServerRenewParticipantVariables {
  participantId: UUIDString;
  expiresAt: TimestampString;
}

export interface ServerSendOrderToKitchenData {
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

export interface ServerSetQuotePaymentData {
  orderQuote_update?: OrderQuote_Key | null;
  auditEvent_insert: AuditEvent_Key;
}

export interface ServerSetQuotePaymentVariables {
  quoteId: UUIDString;
  tenantId: UUIDString;
  authUid: string;
  status: OrderQuoteStatus;
  paymentRef: string;
}

export interface ServerStationsForOrderData {
  productBranches: ({
    productId: UUIDString;
    station?: {
      id: UUIDString;
      archivedAt?: TimestampString | null;
    } & Station_Key;
  })[];
  defaultStation: ({
    id: UUIDString;
  } & Station_Key)[];
}

export interface ServerStationsForOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productIds: UUIDString[];
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

interface ServerQuoteForPaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteForPaymentVariables): QueryRef<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerQuoteForPaymentVariables): QueryRef<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;
  operationName: string;
}
export const serverQuoteForPaymentRef: ServerQuoteForPaymentRef;

export function serverQuoteForPayment(vars: ServerQuoteForPaymentVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;
export function serverQuoteForPayment(dc: DataConnect, vars: ServerQuoteForPaymentVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;

interface ServerSetQuotePaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSetQuotePaymentVariables): MutationRef<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerSetQuotePaymentVariables): MutationRef<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;
  operationName: string;
}
export const serverSetQuotePaymentRef: ServerSetQuotePaymentRef;

export function serverSetQuotePayment(vars: ServerSetQuotePaymentVariables): MutationPromise<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;
export function serverSetQuotePayment(dc: DataConnect, vars: ServerSetQuotePaymentVariables): MutationPromise<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;

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

interface ServerStationsForOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerStationsForOrderVariables): QueryRef<ServerStationsForOrderData, ServerStationsForOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ServerStationsForOrderVariables): QueryRef<ServerStationsForOrderData, ServerStationsForOrderVariables>;
  operationName: string;
}
export const serverStationsForOrderRef: ServerStationsForOrderRef;

export function serverStationsForOrder(vars: ServerStationsForOrderVariables, options?: ExecuteQueryOptions): QueryPromise<ServerStationsForOrderData, ServerStationsForOrderVariables>;
export function serverStationsForOrder(dc: DataConnect, vars: ServerStationsForOrderVariables, options?: ExecuteQueryOptions): QueryPromise<ServerStationsForOrderData, ServerStationsForOrderVariables>;

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

