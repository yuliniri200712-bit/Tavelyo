# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `tavelyo`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*BranchOrderApproval*](#branchorderapproval)
  - [*PendingApprovalOrders*](#pendingapprovalorders)
  - [*BranchRegisters*](#branchregisters)
  - [*BillingTables*](#billingtables)
  - [*CatalogAdmin*](#catalogadmin)
  - [*BranchCatalog*](#branchcatalog)
  - [*PublicMenu*](#publicmenu)
  - [*MyParticipation*](#myparticipation)
  - [*MyOrders*](#myorders)
  - [*BranchStations*](#branchstations)
  - [*KitchenStations*](#kitchenstations)
  - [*KitchenQueue*](#kitchenqueue)
  - [*StaffOrderDesk*](#stafforderdesk)
  - [*BranchLayout*](#branchlayout)
  - [*ServerPaymentOperationByKey*](#serverpaymentoperationbykey)
  - [*ServerStalePaymentOperations*](#serverstalepaymentoperations)
  - [*ServerAuthorizationById*](#serverauthorizationbyid)
  - [*ServerAuthorizationsToRelease*](#serverauthorizationstorelease)
  - [*ServerExpiringAuthorizations*](#serverexpiringauthorizations)
  - [*ServerProviderEvent*](#serverproviderevent)
  - [*ServerDueOutboxEvents*](#serverdueoutboxevents)
  - [*PickupQueue*](#pickupqueue)
  - [*SessionOrders*](#sessionorders)
  - [*PendingServiceRequests*](#pendingservicerequests)
  - [*MyProfile*](#myprofile)
  - [*MyMemberships*](#mymemberships)
  - [*MyBranches*](#mybranches)
  - [*TenantMembers*](#tenantmembers)
  - [*TenantAuditEvents*](#tenantauditevents)
  - [*FloorView*](#floorview)
  - [*SessionParticipants*](#sessionparticipants)
  - [*ServerOpenSessionByQr*](#serveropensessionbyqr)
  - [*ServerMyOpenParticipation*](#servermyopenparticipation)
  - [*ServerQuoteContext*](#serverquotecontext)
  - [*ServerProductsForQuote*](#serverproductsforquote)
  - [*ServerQuoteByKey*](#serverquotebykey)
  - [*ServerQuoteForSubmit*](#serverquoteforsubmit)
  - [*ServerOrderByQuote*](#serverorderbyquote)
  - [*ServerProductsForOrder*](#serverproductsfororder)
  - [*TenantBranches*](#tenantbranches)
  - [*TenantProfile*](#tenantprofile)
- [**Mutations**](#mutations)
  - [*SetBranchOrderApproval*](#setbranchorderapproval)
  - [*ApproveOrder*](#approveorder)
  - [*RejectOrder*](#rejectorder)
  - [*WithdrawMyOrder*](#withdrawmyorder)
  - [*CreateRegister*](#createregister)
  - [*UpdateRegister*](#updateregister)
  - [*CreateTaxRule*](#createtaxrule)
  - [*UpdateTaxRule*](#updatetaxrule)
  - [*CreateCategory*](#createcategory)
  - [*UpdateCategory*](#updatecategory)
  - [*CreateProduct*](#createproduct)
  - [*UpdateProduct*](#updateproduct)
  - [*CreateModifierGroup*](#createmodifiergroup)
  - [*UpdateModifierGroup*](#updatemodifiergroup)
  - [*CreateModifierOption*](#createmodifieroption)
  - [*UpdateModifierOption*](#updatemodifieroption)
  - [*SetProductAvailability*](#setproductavailability)
  - [*ChangePrice*](#changeprice)
  - [*CreateStation*](#createstation)
  - [*UpdateStation*](#updatestation)
  - [*SetProductStation*](#setproductstation)
  - [*StartOrderItem*](#startorderitem)
  - [*FinishOrderItem*](#finishorderitem)
  - [*AddTableGuest*](#addtableguest)
  - [*ServerSendStaffOrder*](#serversendstafforder)
  - [*CreateSector*](#createsector)
  - [*UpdateSector*](#updatesector)
  - [*CreateTable*](#createtable)
  - [*UpdateTable*](#updatetable)
  - [*RotateTableQr*](#rotatetableqr)
  - [*UpsertMyProfile*](#upsertmyprofile)
  - [*AddMember*](#addmember)
  - [*ChangeMemberRole*](#changememberrole)
  - [*RevokeMember*](#revokemember)
  - [*AssignMemberBranch*](#assignmemberbranch)
  - [*UnassignMemberBranch*](#unassignmemberbranch)
  - [*ServerBeginPaymentOperation*](#serverbeginpaymentoperation)
  - [*ServerRetryPaymentOperation*](#serverretrypaymentoperation)
  - [*ServerMarkPaymentOperationUnknown*](#servermarkpaymentoperationunknown)
  - [*ServerFailPaymentOperation*](#serverfailpaymentoperation)
  - [*ServerSettleAuthorize*](#serversettleauthorize)
  - [*ServerDeclineAuthorize*](#serverdeclineauthorize)
  - [*ServerAdoptOrphanAuthorization*](#serveradoptorphanauthorization)
  - [*ServerSettleCapture*](#serversettlecapture)
  - [*ServerFailCapture*](#serverfailcapture)
  - [*ServerSettleVoid*](#serversettlevoid)
  - [*ServerExpireAuthorization*](#serverexpireauthorization)
  - [*ServerExpireAuthorizationByRef*](#serverexpireauthorizationbyref)
  - [*ServerExpireLapsedAuthorizations*](#serverexpirelapsedauthorizations)
  - [*ServerSettleRefund*](#serversettlerefund)
  - [*ServerMarkRefundPending*](#servermarkrefundpending)
  - [*ServerRejectRefund*](#serverrejectrefund)
  - [*ServerRecordProviderEvent*](#serverrecordproviderevent)
  - [*ServerFinishProviderEvent*](#serverfinishproviderevent)
  - [*ServerCompleteOutboxEvent*](#servercompleteoutboxevent)
  - [*ServerRetryOutboxEvent*](#serverretryoutboxevent)
  - [*ServerFailOutboxEvent*](#serverfailoutboxevent)
  - [*PickUpOrderItem*](#pickuporderitem)
  - [*DeliverOrderItem*](#deliverorderitem)
  - [*DeliverOrderItemDirectly*](#deliverorderitemdirectly)
  - [*CancelOrderItem*](#cancelorderitem)
  - [*AttendServiceRequest*](#attendservicerequest)
  - [*OpenTableSession*](#opentablesession)
  - [*CloseTableSession*](#closetablesession)
  - [*RemoveParticipant*](#removeparticipant)
  - [*TransferTableSession*](#transfertablesession)
  - [*ServerInsertParticipant*](#serverinsertparticipant)
  - [*ServerRenewParticipant*](#serverrenewparticipant)
  - [*ServerHitRateLimit*](#serverhitratelimit)
  - [*ServerCreateDefaultStation*](#servercreatedefaultstation)
  - [*ServerSendOrderToKitchen*](#serversendordertokitchen)
  - [*ServerConfirmQuote*](#serverconfirmquote)
  - [*ServerRequestOrderApproval*](#serverrequestorderapproval)
  - [*ServerCreateServiceRequest*](#servercreateservicerequest)
  - [*ServerCloseTableSession*](#serverclosetablesession)
  - [*ServerCloseSettledTableSession*](#serverclosesettledtablesession)
  - [*CreateBranch*](#createbranch)
  - [*UpdateBranch*](#updatebranch)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `tavelyo`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@tavelyo/dataconnect-sdk` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@tavelyo/dataconnect-sdk';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@tavelyo/dataconnect-sdk';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `tavelyo` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## BranchOrderApproval
You can execute the `BranchOrderApproval` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
branchOrderApproval(vars: BranchOrderApprovalVariables, options?: ExecuteQueryOptions): QueryPromise<BranchOrderApprovalData, BranchOrderApprovalVariables>;

interface BranchOrderApprovalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchOrderApprovalVariables): QueryRef<BranchOrderApprovalData, BranchOrderApprovalVariables>;
}
export const branchOrderApprovalRef: BranchOrderApprovalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
branchOrderApproval(dc: DataConnect, vars: BranchOrderApprovalVariables, options?: ExecuteQueryOptions): QueryPromise<BranchOrderApprovalData, BranchOrderApprovalVariables>;

interface BranchOrderApprovalRef {
  ...
  (dc: DataConnect, vars: BranchOrderApprovalVariables): QueryRef<BranchOrderApprovalData, BranchOrderApprovalVariables>;
}
export const branchOrderApprovalRef: BranchOrderApprovalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the branchOrderApprovalRef:
```typescript
const name = branchOrderApprovalRef.operationName;
console.log(name);
```

### Variables
The `BranchOrderApproval` query requires an argument of type `BranchOrderApprovalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface BranchOrderApprovalVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `BranchOrderApproval` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `BranchOrderApprovalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface BranchOrderApprovalData {
  branches: ({
    id: UUIDString;
    name: string;
    orderApproval: OrderApprovalMode;
  } & Branch_Key)[];
}
```
### Using `BranchOrderApproval`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, branchOrderApproval, BranchOrderApprovalVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchOrderApproval` query requires an argument of type `BranchOrderApprovalVariables`:
const branchOrderApprovalVars: BranchOrderApprovalVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchOrderApproval()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await branchOrderApproval(branchOrderApprovalVars);
// Variables can be defined inline as well.
const { data } = await branchOrderApproval({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await branchOrderApproval(dataConnect, branchOrderApprovalVars);

console.log(data.branches);

// Or, you can use the `Promise` API.
branchOrderApproval(branchOrderApprovalVars).then((response) => {
  const data = response.data;
  console.log(data.branches);
});
```

### Using `BranchOrderApproval`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, branchOrderApprovalRef, BranchOrderApprovalVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchOrderApproval` query requires an argument of type `BranchOrderApprovalVariables`:
const branchOrderApprovalVars: BranchOrderApprovalVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchOrderApprovalRef()` function to get a reference to the query.
const ref = branchOrderApprovalRef(branchOrderApprovalVars);
// Variables can be defined inline as well.
const ref = branchOrderApprovalRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = branchOrderApprovalRef(dataConnect, branchOrderApprovalVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.branches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.branches);
});
```

## PendingApprovalOrders
You can execute the `PendingApprovalOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
pendingApprovalOrders(vars: PendingApprovalOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;

interface PendingApprovalOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PendingApprovalOrdersVariables): QueryRef<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;
}
export const pendingApprovalOrdersRef: PendingApprovalOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
pendingApprovalOrders(dc: DataConnect, vars: PendingApprovalOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;

interface PendingApprovalOrdersRef {
  ...
  (dc: DataConnect, vars: PendingApprovalOrdersVariables): QueryRef<PendingApprovalOrdersData, PendingApprovalOrdersVariables>;
}
export const pendingApprovalOrdersRef: PendingApprovalOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the pendingApprovalOrdersRef:
```typescript
const name = pendingApprovalOrdersRef.operationName;
console.log(name);
```

### Variables
The `PendingApprovalOrders` query requires an argument of type `PendingApprovalOrdersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PendingApprovalOrdersVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `PendingApprovalOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PendingApprovalOrdersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `PendingApprovalOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, pendingApprovalOrders, PendingApprovalOrdersVariables } from '@tavelyo/dataconnect-sdk';

// The `PendingApprovalOrders` query requires an argument of type `PendingApprovalOrdersVariables`:
const pendingApprovalOrdersVars: PendingApprovalOrdersVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `pendingApprovalOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await pendingApprovalOrders(pendingApprovalOrdersVars);
// Variables can be defined inline as well.
const { data } = await pendingApprovalOrders({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await pendingApprovalOrders(dataConnect, pendingApprovalOrdersVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
pendingApprovalOrders(pendingApprovalOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `PendingApprovalOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, pendingApprovalOrdersRef, PendingApprovalOrdersVariables } from '@tavelyo/dataconnect-sdk';

// The `PendingApprovalOrders` query requires an argument of type `PendingApprovalOrdersVariables`:
const pendingApprovalOrdersVars: PendingApprovalOrdersVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `pendingApprovalOrdersRef()` function to get a reference to the query.
const ref = pendingApprovalOrdersRef(pendingApprovalOrdersVars);
// Variables can be defined inline as well.
const ref = pendingApprovalOrdersRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = pendingApprovalOrdersRef(dataConnect, pendingApprovalOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## BranchRegisters
You can execute the `BranchRegisters` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
branchRegisters(vars: BranchRegistersVariables, options?: ExecuteQueryOptions): QueryPromise<BranchRegistersData, BranchRegistersVariables>;

interface BranchRegistersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchRegistersVariables): QueryRef<BranchRegistersData, BranchRegistersVariables>;
}
export const branchRegistersRef: BranchRegistersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
branchRegisters(dc: DataConnect, vars: BranchRegistersVariables, options?: ExecuteQueryOptions): QueryPromise<BranchRegistersData, BranchRegistersVariables>;

interface BranchRegistersRef {
  ...
  (dc: DataConnect, vars: BranchRegistersVariables): QueryRef<BranchRegistersData, BranchRegistersVariables>;
}
export const branchRegistersRef: BranchRegistersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the branchRegistersRef:
```typescript
const name = branchRegistersRef.operationName;
console.log(name);
```

### Variables
The `BranchRegisters` query requires an argument of type `BranchRegistersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface BranchRegistersVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `BranchRegisters` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `BranchRegistersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface BranchRegistersData {
  registers: ({
    id: UUIDString;
    name: string;
    archivedAt?: TimestampString | null;
    cashSessions_on_register: ({
      id: UUIDString;
      openedBy: string;
      openedAt: TimestampString;
    } & CashSession_Key)[];
  } & Register_Key)[];
}
```
### Using `BranchRegisters`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, branchRegisters, BranchRegistersVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchRegisters` query requires an argument of type `BranchRegistersVariables`:
const branchRegistersVars: BranchRegistersVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchRegisters()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await branchRegisters(branchRegistersVars);
// Variables can be defined inline as well.
const { data } = await branchRegisters({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await branchRegisters(dataConnect, branchRegistersVars);

console.log(data.registers);

// Or, you can use the `Promise` API.
branchRegisters(branchRegistersVars).then((response) => {
  const data = response.data;
  console.log(data.registers);
});
```

### Using `BranchRegisters`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, branchRegistersRef, BranchRegistersVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchRegisters` query requires an argument of type `BranchRegistersVariables`:
const branchRegistersVars: BranchRegistersVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchRegistersRef()` function to get a reference to the query.
const ref = branchRegistersRef(branchRegistersVars);
// Variables can be defined inline as well.
const ref = branchRegistersRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = branchRegistersRef(dataConnect, branchRegistersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.registers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.registers);
});
```

## BillingTables
You can execute the `BillingTables` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
billingTables(vars: BillingTablesVariables, options?: ExecuteQueryOptions): QueryPromise<BillingTablesData, BillingTablesVariables>;

interface BillingTablesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: BillingTablesVariables): QueryRef<BillingTablesData, BillingTablesVariables>;
}
export const billingTablesRef: BillingTablesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
billingTables(dc: DataConnect, vars: BillingTablesVariables, options?: ExecuteQueryOptions): QueryPromise<BillingTablesData, BillingTablesVariables>;

interface BillingTablesRef {
  ...
  (dc: DataConnect, vars: BillingTablesVariables): QueryRef<BillingTablesData, BillingTablesVariables>;
}
export const billingTablesRef: BillingTablesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the billingTablesRef:
```typescript
const name = billingTablesRef.operationName;
console.log(name);
```

### Variables
The `BillingTables` query requires an argument of type `BillingTablesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface BillingTablesVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `BillingTables` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `BillingTablesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface BillingTablesData {
  tableSessions: ({
    id: UUIDString;
    openedAt: TimestampString;
    table: {
      code: string;
      sector: {
        name: string;
      };
    };
    serviceRequests_on_session: ({
      createdAt: TimestampString;
    })[];
  } & TableSession_Key)[];
}
```
### Using `BillingTables`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, billingTables, BillingTablesVariables } from '@tavelyo/dataconnect-sdk';

// The `BillingTables` query requires an argument of type `BillingTablesVariables`:
const billingTablesVars: BillingTablesVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `billingTables()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await billingTables(billingTablesVars);
// Variables can be defined inline as well.
const { data } = await billingTables({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await billingTables(dataConnect, billingTablesVars);

console.log(data.tableSessions);

// Or, you can use the `Promise` API.
billingTables(billingTablesVars).then((response) => {
  const data = response.data;
  console.log(data.tableSessions);
});
```

### Using `BillingTables`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, billingTablesRef, BillingTablesVariables } from '@tavelyo/dataconnect-sdk';

// The `BillingTables` query requires an argument of type `BillingTablesVariables`:
const billingTablesVars: BillingTablesVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `billingTablesRef()` function to get a reference to the query.
const ref = billingTablesRef(billingTablesVars);
// Variables can be defined inline as well.
const ref = billingTablesRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = billingTablesRef(dataConnect, billingTablesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tableSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tableSessions);
});
```

## CatalogAdmin
You can execute the `CatalogAdmin` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
catalogAdmin(vars: CatalogAdminVariables, options?: ExecuteQueryOptions): QueryPromise<CatalogAdminData, CatalogAdminVariables>;

interface CatalogAdminRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CatalogAdminVariables): QueryRef<CatalogAdminData, CatalogAdminVariables>;
}
export const catalogAdminRef: CatalogAdminRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
catalogAdmin(dc: DataConnect, vars: CatalogAdminVariables, options?: ExecuteQueryOptions): QueryPromise<CatalogAdminData, CatalogAdminVariables>;

interface CatalogAdminRef {
  ...
  (dc: DataConnect, vars: CatalogAdminVariables): QueryRef<CatalogAdminData, CatalogAdminVariables>;
}
export const catalogAdminRef: CatalogAdminRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the catalogAdminRef:
```typescript
const name = catalogAdminRef.operationName;
console.log(name);
```

### Variables
The `CatalogAdmin` query requires an argument of type `CatalogAdminVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CatalogAdminVariables {
  tenantId: UUIDString;
}
```
### Return Type
Recall that executing the `CatalogAdmin` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CatalogAdminData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `CatalogAdmin`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, catalogAdmin, CatalogAdminVariables } from '@tavelyo/dataconnect-sdk';

// The `CatalogAdmin` query requires an argument of type `CatalogAdminVariables`:
const catalogAdminVars: CatalogAdminVariables = {
  tenantId: ..., 
};

// Call the `catalogAdmin()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await catalogAdmin(catalogAdminVars);
// Variables can be defined inline as well.
const { data } = await catalogAdmin({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await catalogAdmin(dataConnect, catalogAdminVars);

console.log(data.taxRules);
console.log(data.categories);

// Or, you can use the `Promise` API.
catalogAdmin(catalogAdminVars).then((response) => {
  const data = response.data;
  console.log(data.taxRules);
  console.log(data.categories);
});
```

### Using `CatalogAdmin`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, catalogAdminRef, CatalogAdminVariables } from '@tavelyo/dataconnect-sdk';

// The `CatalogAdmin` query requires an argument of type `CatalogAdminVariables`:
const catalogAdminVars: CatalogAdminVariables = {
  tenantId: ..., 
};

// Call the `catalogAdminRef()` function to get a reference to the query.
const ref = catalogAdminRef(catalogAdminVars);
// Variables can be defined inline as well.
const ref = catalogAdminRef({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = catalogAdminRef(dataConnect, catalogAdminVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.taxRules);
console.log(data.categories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.taxRules);
  console.log(data.categories);
});
```

## BranchCatalog
You can execute the `BranchCatalog` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
branchCatalog(vars: BranchCatalogVariables, options?: ExecuteQueryOptions): QueryPromise<BranchCatalogData, BranchCatalogVariables>;

interface BranchCatalogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchCatalogVariables): QueryRef<BranchCatalogData, BranchCatalogVariables>;
}
export const branchCatalogRef: BranchCatalogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
branchCatalog(dc: DataConnect, vars: BranchCatalogVariables, options?: ExecuteQueryOptions): QueryPromise<BranchCatalogData, BranchCatalogVariables>;

interface BranchCatalogRef {
  ...
  (dc: DataConnect, vars: BranchCatalogVariables): QueryRef<BranchCatalogData, BranchCatalogVariables>;
}
export const branchCatalogRef: BranchCatalogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the branchCatalogRef:
```typescript
const name = branchCatalogRef.operationName;
console.log(name);
```

### Variables
The `BranchCatalog` query requires an argument of type `BranchCatalogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface BranchCatalogVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `BranchCatalog` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `BranchCatalogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `BranchCatalog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, branchCatalog, BranchCatalogVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchCatalog` query requires an argument of type `BranchCatalogVariables`:
const branchCatalogVars: BranchCatalogVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchCatalog()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await branchCatalog(branchCatalogVars);
// Variables can be defined inline as well.
const { data } = await branchCatalog({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await branchCatalog(dataConnect, branchCatalogVars);

console.log(data.productBranches);

// Or, you can use the `Promise` API.
branchCatalog(branchCatalogVars).then((response) => {
  const data = response.data;
  console.log(data.productBranches);
});
```

### Using `BranchCatalog`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, branchCatalogRef, BranchCatalogVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchCatalog` query requires an argument of type `BranchCatalogVariables`:
const branchCatalogVars: BranchCatalogVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchCatalogRef()` function to get a reference to the query.
const ref = branchCatalogRef(branchCatalogVars);
// Variables can be defined inline as well.
const ref = branchCatalogRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = branchCatalogRef(dataConnect, branchCatalogVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.productBranches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.productBranches);
});
```

## PublicMenu
You can execute the `PublicMenu` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
publicMenu(vars: PublicMenuVariables, options?: ExecuteQueryOptions): QueryPromise<PublicMenuData, PublicMenuVariables>;

interface PublicMenuRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PublicMenuVariables): QueryRef<PublicMenuData, PublicMenuVariables>;
}
export const publicMenuRef: PublicMenuRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
publicMenu(dc: DataConnect, vars: PublicMenuVariables, options?: ExecuteQueryOptions): QueryPromise<PublicMenuData, PublicMenuVariables>;

interface PublicMenuRef {
  ...
  (dc: DataConnect, vars: PublicMenuVariables): QueryRef<PublicMenuData, PublicMenuVariables>;
}
export const publicMenuRef: PublicMenuRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the publicMenuRef:
```typescript
const name = publicMenuRef.operationName;
console.log(name);
```

### Variables
The `PublicMenu` query requires an argument of type `PublicMenuVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PublicMenuVariables {
  qrPublicId: UUIDString;
}
```
### Return Type
Recall that executing the `PublicMenu` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PublicMenuData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `PublicMenu`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, publicMenu, PublicMenuVariables } from '@tavelyo/dataconnect-sdk';

// The `PublicMenu` query requires an argument of type `PublicMenuVariables`:
const publicMenuVars: PublicMenuVariables = {
  qrPublicId: ..., 
};

// Call the `publicMenu()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await publicMenu(publicMenuVars);
// Variables can be defined inline as well.
const { data } = await publicMenu({ qrPublicId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await publicMenu(dataConnect, publicMenuVars);

console.log(data.diningTables);

// Or, you can use the `Promise` API.
publicMenu(publicMenuVars).then((response) => {
  const data = response.data;
  console.log(data.diningTables);
});
```

### Using `PublicMenu`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, publicMenuRef, PublicMenuVariables } from '@tavelyo/dataconnect-sdk';

// The `PublicMenu` query requires an argument of type `PublicMenuVariables`:
const publicMenuVars: PublicMenuVariables = {
  qrPublicId: ..., 
};

// Call the `publicMenuRef()` function to get a reference to the query.
const ref = publicMenuRef(publicMenuVars);
// Variables can be defined inline as well.
const ref = publicMenuRef({ qrPublicId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = publicMenuRef(dataConnect, publicMenuVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.diningTables);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.diningTables);
});
```

## MyParticipation
You can execute the `MyParticipation` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myParticipation(vars: MyParticipationVariables, options?: ExecuteQueryOptions): QueryPromise<MyParticipationData, MyParticipationVariables>;

interface MyParticipationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: MyParticipationVariables): QueryRef<MyParticipationData, MyParticipationVariables>;
}
export const myParticipationRef: MyParticipationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myParticipation(dc: DataConnect, vars: MyParticipationVariables, options?: ExecuteQueryOptions): QueryPromise<MyParticipationData, MyParticipationVariables>;

interface MyParticipationRef {
  ...
  (dc: DataConnect, vars: MyParticipationVariables): QueryRef<MyParticipationData, MyParticipationVariables>;
}
export const myParticipationRef: MyParticipationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myParticipationRef:
```typescript
const name = myParticipationRef.operationName;
console.log(name);
```

### Variables
The `MyParticipation` query requires an argument of type `MyParticipationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface MyParticipationVariables {
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `MyParticipation` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyParticipationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `MyParticipation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myParticipation, MyParticipationVariables } from '@tavelyo/dataconnect-sdk';

// The `MyParticipation` query requires an argument of type `MyParticipationVariables`:
const myParticipationVars: MyParticipationVariables = {
  sessionId: ..., 
};

// Call the `myParticipation()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myParticipation(myParticipationVars);
// Variables can be defined inline as well.
const { data } = await myParticipation({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myParticipation(dataConnect, myParticipationVars);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
myParticipation(myParticipationVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

### Using `MyParticipation`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myParticipationRef, MyParticipationVariables } from '@tavelyo/dataconnect-sdk';

// The `MyParticipation` query requires an argument of type `MyParticipationVariables`:
const myParticipationVars: MyParticipationVariables = {
  sessionId: ..., 
};

// Call the `myParticipationRef()` function to get a reference to the query.
const ref = myParticipationRef(myParticipationVars);
// Variables can be defined inline as well.
const ref = myParticipationRef({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myParticipationRef(dataConnect, myParticipationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

## MyOrders
You can execute the `MyOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myOrders(vars: MyOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<MyOrdersData, MyOrdersVariables>;

interface MyOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: MyOrdersVariables): QueryRef<MyOrdersData, MyOrdersVariables>;
}
export const myOrdersRef: MyOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myOrders(dc: DataConnect, vars: MyOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<MyOrdersData, MyOrdersVariables>;

interface MyOrdersRef {
  ...
  (dc: DataConnect, vars: MyOrdersVariables): QueryRef<MyOrdersData, MyOrdersVariables>;
}
export const myOrdersRef: MyOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myOrdersRef:
```typescript
const name = myOrdersRef.operationName;
console.log(name);
```

### Variables
The `MyOrders` query requires an argument of type `MyOrdersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface MyOrdersVariables {
  sessionId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `MyOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyOrdersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `MyOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myOrders, MyOrdersVariables } from '@tavelyo/dataconnect-sdk';

// The `MyOrders` query requires an argument of type `MyOrdersVariables`:
const myOrdersVars: MyOrdersVariables = {
  sessionId: ..., 
  branchId: ..., 
};

// Call the `myOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myOrders(myOrdersVars);
// Variables can be defined inline as well.
const { data } = await myOrders({ sessionId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myOrders(dataConnect, myOrdersVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
myOrders(myOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `MyOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myOrdersRef, MyOrdersVariables } from '@tavelyo/dataconnect-sdk';

// The `MyOrders` query requires an argument of type `MyOrdersVariables`:
const myOrdersVars: MyOrdersVariables = {
  sessionId: ..., 
  branchId: ..., 
};

// Call the `myOrdersRef()` function to get a reference to the query.
const ref = myOrdersRef(myOrdersVars);
// Variables can be defined inline as well.
const ref = myOrdersRef({ sessionId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myOrdersRef(dataConnect, myOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## BranchStations
You can execute the `BranchStations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
branchStations(vars: BranchStationsVariables, options?: ExecuteQueryOptions): QueryPromise<BranchStationsData, BranchStationsVariables>;

interface BranchStationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchStationsVariables): QueryRef<BranchStationsData, BranchStationsVariables>;
}
export const branchStationsRef: BranchStationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
branchStations(dc: DataConnect, vars: BranchStationsVariables, options?: ExecuteQueryOptions): QueryPromise<BranchStationsData, BranchStationsVariables>;

interface BranchStationsRef {
  ...
  (dc: DataConnect, vars: BranchStationsVariables): QueryRef<BranchStationsData, BranchStationsVariables>;
}
export const branchStationsRef: BranchStationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the branchStationsRef:
```typescript
const name = branchStationsRef.operationName;
console.log(name);
```

### Variables
The `BranchStations` query requires an argument of type `BranchStationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface BranchStationsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `BranchStations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `BranchStationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface BranchStationsData {
  stations: ({
    id: UUIDString;
    name: string;
    sort: number;
    defaultForBranchId?: UUIDString | null;
    archivedAt?: TimestampString | null;
  } & Station_Key)[];
}
```
### Using `BranchStations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, branchStations, BranchStationsVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchStations` query requires an argument of type `BranchStationsVariables`:
const branchStationsVars: BranchStationsVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchStations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await branchStations(branchStationsVars);
// Variables can be defined inline as well.
const { data } = await branchStations({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await branchStations(dataConnect, branchStationsVars);

console.log(data.stations);

// Or, you can use the `Promise` API.
branchStations(branchStationsVars).then((response) => {
  const data = response.data;
  console.log(data.stations);
});
```

### Using `BranchStations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, branchStationsRef, BranchStationsVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchStations` query requires an argument of type `BranchStationsVariables`:
const branchStationsVars: BranchStationsVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchStationsRef()` function to get a reference to the query.
const ref = branchStationsRef(branchStationsVars);
// Variables can be defined inline as well.
const ref = branchStationsRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = branchStationsRef(dataConnect, branchStationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.stations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.stations);
});
```

## KitchenStations
You can execute the `KitchenStations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
kitchenStations(vars: KitchenStationsVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenStationsData, KitchenStationsVariables>;

interface KitchenStationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: KitchenStationsVariables): QueryRef<KitchenStationsData, KitchenStationsVariables>;
}
export const kitchenStationsRef: KitchenStationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
kitchenStations(dc: DataConnect, vars: KitchenStationsVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenStationsData, KitchenStationsVariables>;

interface KitchenStationsRef {
  ...
  (dc: DataConnect, vars: KitchenStationsVariables): QueryRef<KitchenStationsData, KitchenStationsVariables>;
}
export const kitchenStationsRef: KitchenStationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the kitchenStationsRef:
```typescript
const name = kitchenStationsRef.operationName;
console.log(name);
```

### Variables
The `KitchenStations` query requires an argument of type `KitchenStationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface KitchenStationsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `KitchenStations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `KitchenStationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface KitchenStationsData {
  stations: ({
    id: UUIDString;
    name: string;
    defaultForBranchId?: UUIDString | null;
  } & Station_Key)[];
}
```
### Using `KitchenStations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, kitchenStations, KitchenStationsVariables } from '@tavelyo/dataconnect-sdk';

// The `KitchenStations` query requires an argument of type `KitchenStationsVariables`:
const kitchenStationsVars: KitchenStationsVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `kitchenStations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await kitchenStations(kitchenStationsVars);
// Variables can be defined inline as well.
const { data } = await kitchenStations({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await kitchenStations(dataConnect, kitchenStationsVars);

console.log(data.stations);

// Or, you can use the `Promise` API.
kitchenStations(kitchenStationsVars).then((response) => {
  const data = response.data;
  console.log(data.stations);
});
```

### Using `KitchenStations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, kitchenStationsRef, KitchenStationsVariables } from '@tavelyo/dataconnect-sdk';

// The `KitchenStations` query requires an argument of type `KitchenStationsVariables`:
const kitchenStationsVars: KitchenStationsVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `kitchenStationsRef()` function to get a reference to the query.
const ref = kitchenStationsRef(kitchenStationsVars);
// Variables can be defined inline as well.
const ref = kitchenStationsRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = kitchenStationsRef(dataConnect, kitchenStationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.stations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.stations);
});
```

## KitchenQueue
You can execute the `KitchenQueue` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
kitchenQueue(vars: KitchenQueueVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenQueueData, KitchenQueueVariables>;

interface KitchenQueueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: KitchenQueueVariables): QueryRef<KitchenQueueData, KitchenQueueVariables>;
}
export const kitchenQueueRef: KitchenQueueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
kitchenQueue(dc: DataConnect, vars: KitchenQueueVariables, options?: ExecuteQueryOptions): QueryPromise<KitchenQueueData, KitchenQueueVariables>;

interface KitchenQueueRef {
  ...
  (dc: DataConnect, vars: KitchenQueueVariables): QueryRef<KitchenQueueData, KitchenQueueVariables>;
}
export const kitchenQueueRef: KitchenQueueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the kitchenQueueRef:
```typescript
const name = kitchenQueueRef.operationName;
console.log(name);
```

### Variables
The `KitchenQueue` query requires an argument of type `KitchenQueueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface KitchenQueueVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  stationId: UUIDString;
}
```
### Return Type
Recall that executing the `KitchenQueue` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `KitchenQueueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `KitchenQueue`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, kitchenQueue, KitchenQueueVariables } from '@tavelyo/dataconnect-sdk';

// The `KitchenQueue` query requires an argument of type `KitchenQueueVariables`:
const kitchenQueueVars: KitchenQueueVariables = {
  tenantId: ..., 
  branchId: ..., 
  stationId: ..., 
};

// Call the `kitchenQueue()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await kitchenQueue(kitchenQueueVars);
// Variables can be defined inline as well.
const { data } = await kitchenQueue({ tenantId: ..., branchId: ..., stationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await kitchenQueue(dataConnect, kitchenQueueVars);

console.log(data.orderItems);

// Or, you can use the `Promise` API.
kitchenQueue(kitchenQueueVars).then((response) => {
  const data = response.data;
  console.log(data.orderItems);
});
```

### Using `KitchenQueue`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, kitchenQueueRef, KitchenQueueVariables } from '@tavelyo/dataconnect-sdk';

// The `KitchenQueue` query requires an argument of type `KitchenQueueVariables`:
const kitchenQueueVars: KitchenQueueVariables = {
  tenantId: ..., 
  branchId: ..., 
  stationId: ..., 
};

// Call the `kitchenQueueRef()` function to get a reference to the query.
const ref = kitchenQueueRef(kitchenQueueVars);
// Variables can be defined inline as well.
const ref = kitchenQueueRef({ tenantId: ..., branchId: ..., stationId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = kitchenQueueRef(dataConnect, kitchenQueueVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orderItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItems);
});
```

## StaffOrderDesk
You can execute the `StaffOrderDesk` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
staffOrderDesk(vars: StaffOrderDeskVariables, options?: ExecuteQueryOptions): QueryPromise<StaffOrderDeskData, StaffOrderDeskVariables>;

interface StaffOrderDeskRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: StaffOrderDeskVariables): QueryRef<StaffOrderDeskData, StaffOrderDeskVariables>;
}
export const staffOrderDeskRef: StaffOrderDeskRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
staffOrderDesk(dc: DataConnect, vars: StaffOrderDeskVariables, options?: ExecuteQueryOptions): QueryPromise<StaffOrderDeskData, StaffOrderDeskVariables>;

interface StaffOrderDeskRef {
  ...
  (dc: DataConnect, vars: StaffOrderDeskVariables): QueryRef<StaffOrderDeskData, StaffOrderDeskVariables>;
}
export const staffOrderDeskRef: StaffOrderDeskRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the staffOrderDeskRef:
```typescript
const name = staffOrderDeskRef.operationName;
console.log(name);
```

### Variables
The `StaffOrderDesk` query requires an argument of type `StaffOrderDeskVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface StaffOrderDeskVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `StaffOrderDesk` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `StaffOrderDeskData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface StaffOrderDeskData {
  tableSession?: {
    status: TableSessionStatus;
    tenantId: UUIDString;
    branchId: UUIDString;
    table: {
      sector: {
        branch: {
          status: BranchStatus;
        };
      };
    };
  };
  branch?: {
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
  sessionParticipants: ({
    id: UUIDString;
    guestNumber?: number | null;
    joinedAt: TimestampString;
    expiresAt: TimestampString;
    removedAt?: TimestampString | null;
  } & SessionParticipant_Key)[];
}
```
### Using `StaffOrderDesk`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, staffOrderDesk, StaffOrderDeskVariables } from '@tavelyo/dataconnect-sdk';

// The `StaffOrderDesk` query requires an argument of type `StaffOrderDeskVariables`:
const staffOrderDeskVars: StaffOrderDeskVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `staffOrderDesk()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await staffOrderDesk(staffOrderDeskVars);
// Variables can be defined inline as well.
const { data } = await staffOrderDesk({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await staffOrderDesk(dataConnect, staffOrderDeskVars);

console.log(data.tableSession);
console.log(data.branch);
console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
staffOrderDesk(staffOrderDeskVars).then((response) => {
  const data = response.data;
  console.log(data.tableSession);
  console.log(data.branch);
  console.log(data.sessionParticipants);
});
```

### Using `StaffOrderDesk`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, staffOrderDeskRef, StaffOrderDeskVariables } from '@tavelyo/dataconnect-sdk';

// The `StaffOrderDesk` query requires an argument of type `StaffOrderDeskVariables`:
const staffOrderDeskVars: StaffOrderDeskVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `staffOrderDeskRef()` function to get a reference to the query.
const ref = staffOrderDeskRef(staffOrderDeskVars);
// Variables can be defined inline as well.
const ref = staffOrderDeskRef({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = staffOrderDeskRef(dataConnect, staffOrderDeskVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tableSession);
console.log(data.branch);
console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tableSession);
  console.log(data.branch);
  console.log(data.sessionParticipants);
});
```

## BranchLayout
You can execute the `BranchLayout` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
branchLayout(vars: BranchLayoutVariables, options?: ExecuteQueryOptions): QueryPromise<BranchLayoutData, BranchLayoutVariables>;

interface BranchLayoutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: BranchLayoutVariables): QueryRef<BranchLayoutData, BranchLayoutVariables>;
}
export const branchLayoutRef: BranchLayoutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
branchLayout(dc: DataConnect, vars: BranchLayoutVariables, options?: ExecuteQueryOptions): QueryPromise<BranchLayoutData, BranchLayoutVariables>;

interface BranchLayoutRef {
  ...
  (dc: DataConnect, vars: BranchLayoutVariables): QueryRef<BranchLayoutData, BranchLayoutVariables>;
}
export const branchLayoutRef: BranchLayoutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the branchLayoutRef:
```typescript
const name = branchLayoutRef.operationName;
console.log(name);
```

### Variables
The `BranchLayout` query requires an argument of type `BranchLayoutVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface BranchLayoutVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `BranchLayout` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `BranchLayoutData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `BranchLayout`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, branchLayout, BranchLayoutVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchLayout` query requires an argument of type `BranchLayoutVariables`:
const branchLayoutVars: BranchLayoutVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchLayout()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await branchLayout(branchLayoutVars);
// Variables can be defined inline as well.
const { data } = await branchLayout({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await branchLayout(dataConnect, branchLayoutVars);

console.log(data.sectors);

// Or, you can use the `Promise` API.
branchLayout(branchLayoutVars).then((response) => {
  const data = response.data;
  console.log(data.sectors);
});
```

### Using `BranchLayout`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, branchLayoutRef, BranchLayoutVariables } from '@tavelyo/dataconnect-sdk';

// The `BranchLayout` query requires an argument of type `BranchLayoutVariables`:
const branchLayoutVars: BranchLayoutVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `branchLayoutRef()` function to get a reference to the query.
const ref = branchLayoutRef(branchLayoutVars);
// Variables can be defined inline as well.
const ref = branchLayoutRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = branchLayoutRef(dataConnect, branchLayoutVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sectors);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sectors);
});
```

## ServerPaymentOperationByKey
You can execute the `ServerPaymentOperationByKey` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverPaymentOperationByKey(vars: ServerPaymentOperationByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;

interface ServerPaymentOperationByKeyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerPaymentOperationByKeyVariables): QueryRef<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;
}
export const serverPaymentOperationByKeyRef: ServerPaymentOperationByKeyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverPaymentOperationByKey(dc: DataConnect, vars: ServerPaymentOperationByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;

interface ServerPaymentOperationByKeyRef {
  ...
  (dc: DataConnect, vars: ServerPaymentOperationByKeyVariables): QueryRef<ServerPaymentOperationByKeyData, ServerPaymentOperationByKeyVariables>;
}
export const serverPaymentOperationByKeyRef: ServerPaymentOperationByKeyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverPaymentOperationByKeyRef:
```typescript
const name = serverPaymentOperationByKeyRef.operationName;
console.log(name);
```

### Variables
The `ServerPaymentOperationByKey` query requires an argument of type `ServerPaymentOperationByKeyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerPaymentOperationByKeyVariables {
  idempotencyKey: string;
}
```
### Return Type
Recall that executing the `ServerPaymentOperationByKey` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerPaymentOperationByKeyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerPaymentOperationByKey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverPaymentOperationByKey, ServerPaymentOperationByKeyVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerPaymentOperationByKey` query requires an argument of type `ServerPaymentOperationByKeyVariables`:
const serverPaymentOperationByKeyVars: ServerPaymentOperationByKeyVariables = {
  idempotencyKey: ..., 
};

// Call the `serverPaymentOperationByKey()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverPaymentOperationByKey(serverPaymentOperationByKeyVars);
// Variables can be defined inline as well.
const { data } = await serverPaymentOperationByKey({ idempotencyKey: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverPaymentOperationByKey(dataConnect, serverPaymentOperationByKeyVars);

console.log(data.paymentOperations);

// Or, you can use the `Promise` API.
serverPaymentOperationByKey(serverPaymentOperationByKeyVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperations);
});
```

### Using `ServerPaymentOperationByKey`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverPaymentOperationByKeyRef, ServerPaymentOperationByKeyVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerPaymentOperationByKey` query requires an argument of type `ServerPaymentOperationByKeyVariables`:
const serverPaymentOperationByKeyVars: ServerPaymentOperationByKeyVariables = {
  idempotencyKey: ..., 
};

// Call the `serverPaymentOperationByKeyRef()` function to get a reference to the query.
const ref = serverPaymentOperationByKeyRef(serverPaymentOperationByKeyVars);
// Variables can be defined inline as well.
const ref = serverPaymentOperationByKeyRef({ idempotencyKey: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverPaymentOperationByKeyRef(dataConnect, serverPaymentOperationByKeyVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.paymentOperations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperations);
});
```

## ServerStalePaymentOperations
You can execute the `ServerStalePaymentOperations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverStalePaymentOperations(vars: ServerStalePaymentOperationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;

interface ServerStalePaymentOperationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerStalePaymentOperationsVariables): QueryRef<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;
}
export const serverStalePaymentOperationsRef: ServerStalePaymentOperationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverStalePaymentOperations(dc: DataConnect, vars: ServerStalePaymentOperationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;

interface ServerStalePaymentOperationsRef {
  ...
  (dc: DataConnect, vars: ServerStalePaymentOperationsVariables): QueryRef<ServerStalePaymentOperationsData, ServerStalePaymentOperationsVariables>;
}
export const serverStalePaymentOperationsRef: ServerStalePaymentOperationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverStalePaymentOperationsRef:
```typescript
const name = serverStalePaymentOperationsRef.operationName;
console.log(name);
```

### Variables
The `ServerStalePaymentOperations` query requires an argument of type `ServerStalePaymentOperationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerStalePaymentOperationsVariables {
  before: TimestampString;
  limit: number;
}
```
### Return Type
Recall that executing the `ServerStalePaymentOperations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerStalePaymentOperationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerStalePaymentOperations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverStalePaymentOperations, ServerStalePaymentOperationsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerStalePaymentOperations` query requires an argument of type `ServerStalePaymentOperationsVariables`:
const serverStalePaymentOperationsVars: ServerStalePaymentOperationsVariables = {
  before: ..., 
  limit: ..., 
};

// Call the `serverStalePaymentOperations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverStalePaymentOperations(serverStalePaymentOperationsVars);
// Variables can be defined inline as well.
const { data } = await serverStalePaymentOperations({ before: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverStalePaymentOperations(dataConnect, serverStalePaymentOperationsVars);

console.log(data.paymentOperations);

// Or, you can use the `Promise` API.
serverStalePaymentOperations(serverStalePaymentOperationsVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperations);
});
```

### Using `ServerStalePaymentOperations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverStalePaymentOperationsRef, ServerStalePaymentOperationsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerStalePaymentOperations` query requires an argument of type `ServerStalePaymentOperationsVariables`:
const serverStalePaymentOperationsVars: ServerStalePaymentOperationsVariables = {
  before: ..., 
  limit: ..., 
};

// Call the `serverStalePaymentOperationsRef()` function to get a reference to the query.
const ref = serverStalePaymentOperationsRef(serverStalePaymentOperationsVars);
// Variables can be defined inline as well.
const ref = serverStalePaymentOperationsRef({ before: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverStalePaymentOperationsRef(dataConnect, serverStalePaymentOperationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.paymentOperations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperations);
});
```

## ServerAuthorizationById
You can execute the `ServerAuthorizationById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverAuthorizationById(vars: ServerAuthorizationByIdVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;

interface ServerAuthorizationByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerAuthorizationByIdVariables): QueryRef<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;
}
export const serverAuthorizationByIdRef: ServerAuthorizationByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverAuthorizationById(dc: DataConnect, vars: ServerAuthorizationByIdVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;

interface ServerAuthorizationByIdRef {
  ...
  (dc: DataConnect, vars: ServerAuthorizationByIdVariables): QueryRef<ServerAuthorizationByIdData, ServerAuthorizationByIdVariables>;
}
export const serverAuthorizationByIdRef: ServerAuthorizationByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverAuthorizationByIdRef:
```typescript
const name = serverAuthorizationByIdRef.operationName;
console.log(name);
```

### Variables
The `ServerAuthorizationById` query requires an argument of type `ServerAuthorizationByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerAuthorizationByIdVariables {
  authorizationId: UUIDString;
}
```
### Return Type
Recall that executing the `ServerAuthorizationById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerAuthorizationByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerAuthorizationById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverAuthorizationById, ServerAuthorizationByIdVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerAuthorizationById` query requires an argument of type `ServerAuthorizationByIdVariables`:
const serverAuthorizationByIdVars: ServerAuthorizationByIdVariables = {
  authorizationId: ..., 
};

// Call the `serverAuthorizationById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverAuthorizationById(serverAuthorizationByIdVars);
// Variables can be defined inline as well.
const { data } = await serverAuthorizationById({ authorizationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverAuthorizationById(dataConnect, serverAuthorizationByIdVars);

console.log(data.paymentAuthorization);

// Or, you can use the `Promise` API.
serverAuthorizationById(serverAuthorizationByIdVars).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization);
});
```

### Using `ServerAuthorizationById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverAuthorizationByIdRef, ServerAuthorizationByIdVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerAuthorizationById` query requires an argument of type `ServerAuthorizationByIdVariables`:
const serverAuthorizationByIdVars: ServerAuthorizationByIdVariables = {
  authorizationId: ..., 
};

// Call the `serverAuthorizationByIdRef()` function to get a reference to the query.
const ref = serverAuthorizationByIdRef(serverAuthorizationByIdVars);
// Variables can be defined inline as well.
const ref = serverAuthorizationByIdRef({ authorizationId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverAuthorizationByIdRef(dataConnect, serverAuthorizationByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.paymentAuthorization);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization);
});
```

## ServerAuthorizationsToRelease
You can execute the `ServerAuthorizationsToRelease` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverAuthorizationsToRelease(vars: ServerAuthorizationsToReleaseVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;

interface ServerAuthorizationsToReleaseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerAuthorizationsToReleaseVariables): QueryRef<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;
}
export const serverAuthorizationsToReleaseRef: ServerAuthorizationsToReleaseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverAuthorizationsToRelease(dc: DataConnect, vars: ServerAuthorizationsToReleaseVariables, options?: ExecuteQueryOptions): QueryPromise<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;

interface ServerAuthorizationsToReleaseRef {
  ...
  (dc: DataConnect, vars: ServerAuthorizationsToReleaseVariables): QueryRef<ServerAuthorizationsToReleaseData, ServerAuthorizationsToReleaseVariables>;
}
export const serverAuthorizationsToReleaseRef: ServerAuthorizationsToReleaseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverAuthorizationsToReleaseRef:
```typescript
const name = serverAuthorizationsToReleaseRef.operationName;
console.log(name);
```

### Variables
The `ServerAuthorizationsToRelease` query requires an argument of type `ServerAuthorizationsToReleaseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerAuthorizationsToReleaseVariables {
  limit: number;
}
```
### Return Type
Recall that executing the `ServerAuthorizationsToRelease` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerAuthorizationsToReleaseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerAuthorizationsToRelease`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverAuthorizationsToRelease, ServerAuthorizationsToReleaseVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerAuthorizationsToRelease` query requires an argument of type `ServerAuthorizationsToReleaseVariables`:
const serverAuthorizationsToReleaseVars: ServerAuthorizationsToReleaseVariables = {
  limit: ..., 
};

// Call the `serverAuthorizationsToRelease()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverAuthorizationsToRelease(serverAuthorizationsToReleaseVars);
// Variables can be defined inline as well.
const { data } = await serverAuthorizationsToRelease({ limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverAuthorizationsToRelease(dataConnect, serverAuthorizationsToReleaseVars);

console.log(data.paymentAuthorizations);

// Or, you can use the `Promise` API.
serverAuthorizationsToRelease(serverAuthorizationsToReleaseVars).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorizations);
});
```

### Using `ServerAuthorizationsToRelease`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverAuthorizationsToReleaseRef, ServerAuthorizationsToReleaseVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerAuthorizationsToRelease` query requires an argument of type `ServerAuthorizationsToReleaseVariables`:
const serverAuthorizationsToReleaseVars: ServerAuthorizationsToReleaseVariables = {
  limit: ..., 
};

// Call the `serverAuthorizationsToReleaseRef()` function to get a reference to the query.
const ref = serverAuthorizationsToReleaseRef(serverAuthorizationsToReleaseVars);
// Variables can be defined inline as well.
const ref = serverAuthorizationsToReleaseRef({ limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverAuthorizationsToReleaseRef(dataConnect, serverAuthorizationsToReleaseVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.paymentAuthorizations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorizations);
});
```

## ServerExpiringAuthorizations
You can execute the `ServerExpiringAuthorizations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverExpiringAuthorizations(vars: ServerExpiringAuthorizationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;

interface ServerExpiringAuthorizationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpiringAuthorizationsVariables): QueryRef<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;
}
export const serverExpiringAuthorizationsRef: ServerExpiringAuthorizationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverExpiringAuthorizations(dc: DataConnect, vars: ServerExpiringAuthorizationsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;

interface ServerExpiringAuthorizationsRef {
  ...
  (dc: DataConnect, vars: ServerExpiringAuthorizationsVariables): QueryRef<ServerExpiringAuthorizationsData, ServerExpiringAuthorizationsVariables>;
}
export const serverExpiringAuthorizationsRef: ServerExpiringAuthorizationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverExpiringAuthorizationsRef:
```typescript
const name = serverExpiringAuthorizationsRef.operationName;
console.log(name);
```

### Variables
The `ServerExpiringAuthorizations` query requires an argument of type `ServerExpiringAuthorizationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerExpiringAuthorizationsVariables {
  before: TimestampString;
  limit: number;
}
```
### Return Type
Recall that executing the `ServerExpiringAuthorizations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerExpiringAuthorizationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerExpiringAuthorizationsData {
  paymentAuthorizations: ({
    id: UUIDString;
    tenantId: UUIDString;
    branchId: UUIDString;
    expiresAt?: TimestampString | null;
  } & PaymentAuthorization_Key)[];
}
```
### Using `ServerExpiringAuthorizations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverExpiringAuthorizations, ServerExpiringAuthorizationsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpiringAuthorizations` query requires an argument of type `ServerExpiringAuthorizationsVariables`:
const serverExpiringAuthorizationsVars: ServerExpiringAuthorizationsVariables = {
  before: ..., 
  limit: ..., 
};

// Call the `serverExpiringAuthorizations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverExpiringAuthorizations(serverExpiringAuthorizationsVars);
// Variables can be defined inline as well.
const { data } = await serverExpiringAuthorizations({ before: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverExpiringAuthorizations(dataConnect, serverExpiringAuthorizationsVars);

console.log(data.paymentAuthorizations);

// Or, you can use the `Promise` API.
serverExpiringAuthorizations(serverExpiringAuthorizationsVars).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorizations);
});
```

### Using `ServerExpiringAuthorizations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverExpiringAuthorizationsRef, ServerExpiringAuthorizationsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpiringAuthorizations` query requires an argument of type `ServerExpiringAuthorizationsVariables`:
const serverExpiringAuthorizationsVars: ServerExpiringAuthorizationsVariables = {
  before: ..., 
  limit: ..., 
};

// Call the `serverExpiringAuthorizationsRef()` function to get a reference to the query.
const ref = serverExpiringAuthorizationsRef(serverExpiringAuthorizationsVars);
// Variables can be defined inline as well.
const ref = serverExpiringAuthorizationsRef({ before: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverExpiringAuthorizationsRef(dataConnect, serverExpiringAuthorizationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.paymentAuthorizations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorizations);
});
```

## ServerProviderEvent
You can execute the `ServerProviderEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverProviderEvent(vars: ServerProviderEventVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProviderEventData, ServerProviderEventVariables>;

interface ServerProviderEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerProviderEventVariables): QueryRef<ServerProviderEventData, ServerProviderEventVariables>;
}
export const serverProviderEventRef: ServerProviderEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverProviderEvent(dc: DataConnect, vars: ServerProviderEventVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProviderEventData, ServerProviderEventVariables>;

interface ServerProviderEventRef {
  ...
  (dc: DataConnect, vars: ServerProviderEventVariables): QueryRef<ServerProviderEventData, ServerProviderEventVariables>;
}
export const serverProviderEventRef: ServerProviderEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverProviderEventRef:
```typescript
const name = serverProviderEventRef.operationName;
console.log(name);
```

### Variables
The `ServerProviderEvent` query requires an argument of type `ServerProviderEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerProviderEventVariables {
  provider: string;
  externalEventId: string;
}
```
### Return Type
Recall that executing the `ServerProviderEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerProviderEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerProviderEventData {
  providerEvents: ({
    id: UUIDString;
    payloadHash: string;
    processedAt?: TimestampString | null;
  } & ProviderEvent_Key)[];
}
```
### Using `ServerProviderEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverProviderEvent, ServerProviderEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerProviderEvent` query requires an argument of type `ServerProviderEventVariables`:
const serverProviderEventVars: ServerProviderEventVariables = {
  provider: ..., 
  externalEventId: ..., 
};

// Call the `serverProviderEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverProviderEvent(serverProviderEventVars);
// Variables can be defined inline as well.
const { data } = await serverProviderEvent({ provider: ..., externalEventId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverProviderEvent(dataConnect, serverProviderEventVars);

console.log(data.providerEvents);

// Or, you can use the `Promise` API.
serverProviderEvent(serverProviderEventVars).then((response) => {
  const data = response.data;
  console.log(data.providerEvents);
});
```

### Using `ServerProviderEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverProviderEventRef, ServerProviderEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerProviderEvent` query requires an argument of type `ServerProviderEventVariables`:
const serverProviderEventVars: ServerProviderEventVariables = {
  provider: ..., 
  externalEventId: ..., 
};

// Call the `serverProviderEventRef()` function to get a reference to the query.
const ref = serverProviderEventRef(serverProviderEventVars);
// Variables can be defined inline as well.
const ref = serverProviderEventRef({ provider: ..., externalEventId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverProviderEventRef(dataConnect, serverProviderEventVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.providerEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.providerEvents);
});
```

## ServerDueOutboxEvents
You can execute the `ServerDueOutboxEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverDueOutboxEvents(vars: ServerDueOutboxEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;

interface ServerDueOutboxEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerDueOutboxEventsVariables): QueryRef<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;
}
export const serverDueOutboxEventsRef: ServerDueOutboxEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverDueOutboxEvents(dc: DataConnect, vars: ServerDueOutboxEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;

interface ServerDueOutboxEventsRef {
  ...
  (dc: DataConnect, vars: ServerDueOutboxEventsVariables): QueryRef<ServerDueOutboxEventsData, ServerDueOutboxEventsVariables>;
}
export const serverDueOutboxEventsRef: ServerDueOutboxEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverDueOutboxEventsRef:
```typescript
const name = serverDueOutboxEventsRef.operationName;
console.log(name);
```

### Variables
The `ServerDueOutboxEvents` query requires an argument of type `ServerDueOutboxEventsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerDueOutboxEventsVariables {
  now: TimestampString;
  limit: number;
}
```
### Return Type
Recall that executing the `ServerDueOutboxEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerDueOutboxEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerDueOutboxEventsData {
  outboxEvents: ({
    id: UUIDString;
    kind: string;
    payload: string;
    attempts: number;
  } & OutboxEvent_Key)[];
}
```
### Using `ServerDueOutboxEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverDueOutboxEvents, ServerDueOutboxEventsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerDueOutboxEvents` query requires an argument of type `ServerDueOutboxEventsVariables`:
const serverDueOutboxEventsVars: ServerDueOutboxEventsVariables = {
  now: ..., 
  limit: ..., 
};

// Call the `serverDueOutboxEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverDueOutboxEvents(serverDueOutboxEventsVars);
// Variables can be defined inline as well.
const { data } = await serverDueOutboxEvents({ now: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverDueOutboxEvents(dataConnect, serverDueOutboxEventsVars);

console.log(data.outboxEvents);

// Or, you can use the `Promise` API.
serverDueOutboxEvents(serverDueOutboxEventsVars).then((response) => {
  const data = response.data;
  console.log(data.outboxEvents);
});
```

### Using `ServerDueOutboxEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverDueOutboxEventsRef, ServerDueOutboxEventsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerDueOutboxEvents` query requires an argument of type `ServerDueOutboxEventsVariables`:
const serverDueOutboxEventsVars: ServerDueOutboxEventsVariables = {
  now: ..., 
  limit: ..., 
};

// Call the `serverDueOutboxEventsRef()` function to get a reference to the query.
const ref = serverDueOutboxEventsRef(serverDueOutboxEventsVars);
// Variables can be defined inline as well.
const ref = serverDueOutboxEventsRef({ now: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverDueOutboxEventsRef(dataConnect, serverDueOutboxEventsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.outboxEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.outboxEvents);
});
```

## PickupQueue
You can execute the `PickupQueue` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
pickupQueue(vars: PickupQueueVariables, options?: ExecuteQueryOptions): QueryPromise<PickupQueueData, PickupQueueVariables>;

interface PickupQueueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PickupQueueVariables): QueryRef<PickupQueueData, PickupQueueVariables>;
}
export const pickupQueueRef: PickupQueueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
pickupQueue(dc: DataConnect, vars: PickupQueueVariables, options?: ExecuteQueryOptions): QueryPromise<PickupQueueData, PickupQueueVariables>;

interface PickupQueueRef {
  ...
  (dc: DataConnect, vars: PickupQueueVariables): QueryRef<PickupQueueData, PickupQueueVariables>;
}
export const pickupQueueRef: PickupQueueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the pickupQueueRef:
```typescript
const name = pickupQueueRef.operationName;
console.log(name);
```

### Variables
The `PickupQueue` query requires an argument of type `PickupQueueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PickupQueueVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `PickupQueue` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PickupQueueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `PickupQueue`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, pickupQueue, PickupQueueVariables } from '@tavelyo/dataconnect-sdk';

// The `PickupQueue` query requires an argument of type `PickupQueueVariables`:
const pickupQueueVars: PickupQueueVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `pickupQueue()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await pickupQueue(pickupQueueVars);
// Variables can be defined inline as well.
const { data } = await pickupQueue({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await pickupQueue(dataConnect, pickupQueueVars);

console.log(data.orderItems);

// Or, you can use the `Promise` API.
pickupQueue(pickupQueueVars).then((response) => {
  const data = response.data;
  console.log(data.orderItems);
});
```

### Using `PickupQueue`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, pickupQueueRef, PickupQueueVariables } from '@tavelyo/dataconnect-sdk';

// The `PickupQueue` query requires an argument of type `PickupQueueVariables`:
const pickupQueueVars: PickupQueueVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `pickupQueueRef()` function to get a reference to the query.
const ref = pickupQueueRef(pickupQueueVars);
// Variables can be defined inline as well.
const ref = pickupQueueRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = pickupQueueRef(dataConnect, pickupQueueVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orderItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItems);
});
```

## SessionOrders
You can execute the `SessionOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
sessionOrders(vars: SessionOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<SessionOrdersData, SessionOrdersVariables>;

interface SessionOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SessionOrdersVariables): QueryRef<SessionOrdersData, SessionOrdersVariables>;
}
export const sessionOrdersRef: SessionOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
sessionOrders(dc: DataConnect, vars: SessionOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<SessionOrdersData, SessionOrdersVariables>;

interface SessionOrdersRef {
  ...
  (dc: DataConnect, vars: SessionOrdersVariables): QueryRef<SessionOrdersData, SessionOrdersVariables>;
}
export const sessionOrdersRef: SessionOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the sessionOrdersRef:
```typescript
const name = sessionOrdersRef.operationName;
console.log(name);
```

### Variables
The `SessionOrders` query requires an argument of type `SessionOrdersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SessionOrdersVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `SessionOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SessionOrdersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `SessionOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, sessionOrders, SessionOrdersVariables } from '@tavelyo/dataconnect-sdk';

// The `SessionOrders` query requires an argument of type `SessionOrdersVariables`:
const sessionOrdersVars: SessionOrdersVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `sessionOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await sessionOrders(sessionOrdersVars);
// Variables can be defined inline as well.
const { data } = await sessionOrders({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await sessionOrders(dataConnect, sessionOrdersVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
sessionOrders(sessionOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `SessionOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, sessionOrdersRef, SessionOrdersVariables } from '@tavelyo/dataconnect-sdk';

// The `SessionOrders` query requires an argument of type `SessionOrdersVariables`:
const sessionOrdersVars: SessionOrdersVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `sessionOrdersRef()` function to get a reference to the query.
const ref = sessionOrdersRef(sessionOrdersVars);
// Variables can be defined inline as well.
const ref = sessionOrdersRef({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = sessionOrdersRef(dataConnect, sessionOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## PendingServiceRequests
You can execute the `PendingServiceRequests` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
pendingServiceRequests(vars: PendingServiceRequestsVariables, options?: ExecuteQueryOptions): QueryPromise<PendingServiceRequestsData, PendingServiceRequestsVariables>;

interface PendingServiceRequestsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PendingServiceRequestsVariables): QueryRef<PendingServiceRequestsData, PendingServiceRequestsVariables>;
}
export const pendingServiceRequestsRef: PendingServiceRequestsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
pendingServiceRequests(dc: DataConnect, vars: PendingServiceRequestsVariables, options?: ExecuteQueryOptions): QueryPromise<PendingServiceRequestsData, PendingServiceRequestsVariables>;

interface PendingServiceRequestsRef {
  ...
  (dc: DataConnect, vars: PendingServiceRequestsVariables): QueryRef<PendingServiceRequestsData, PendingServiceRequestsVariables>;
}
export const pendingServiceRequestsRef: PendingServiceRequestsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the pendingServiceRequestsRef:
```typescript
const name = pendingServiceRequestsRef.operationName;
console.log(name);
```

### Variables
The `PendingServiceRequests` query requires an argument of type `PendingServiceRequestsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PendingServiceRequestsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `PendingServiceRequests` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PendingServiceRequestsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `PendingServiceRequests`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, pendingServiceRequests, PendingServiceRequestsVariables } from '@tavelyo/dataconnect-sdk';

// The `PendingServiceRequests` query requires an argument of type `PendingServiceRequestsVariables`:
const pendingServiceRequestsVars: PendingServiceRequestsVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `pendingServiceRequests()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await pendingServiceRequests(pendingServiceRequestsVars);
// Variables can be defined inline as well.
const { data } = await pendingServiceRequests({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await pendingServiceRequests(dataConnect, pendingServiceRequestsVars);

console.log(data.serviceRequests);

// Or, you can use the `Promise` API.
pendingServiceRequests(pendingServiceRequestsVars).then((response) => {
  const data = response.data;
  console.log(data.serviceRequests);
});
```

### Using `PendingServiceRequests`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, pendingServiceRequestsRef, PendingServiceRequestsVariables } from '@tavelyo/dataconnect-sdk';

// The `PendingServiceRequests` query requires an argument of type `PendingServiceRequestsVariables`:
const pendingServiceRequestsVars: PendingServiceRequestsVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `pendingServiceRequestsRef()` function to get a reference to the query.
const ref = pendingServiceRequestsRef(pendingServiceRequestsVars);
// Variables can be defined inline as well.
const ref = pendingServiceRequestsRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = pendingServiceRequestsRef(dataConnect, pendingServiceRequestsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.serviceRequests);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.serviceRequests);
});
```

## MyProfile
You can execute the `MyProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myProfile(options?: ExecuteQueryOptions): QueryPromise<MyProfileData, undefined>;

interface MyProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyProfileData, undefined>;
}
export const myProfileRef: MyProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyProfileData, undefined>;

interface MyProfileRef {
  ...
  (dc: DataConnect): QueryRef<MyProfileData, undefined>;
}
export const myProfileRef: MyProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myProfileRef:
```typescript
const name = myProfileRef.operationName;
console.log(name);
```

### Variables
The `MyProfile` query has no variables.
### Return Type
Recall that executing the `MyProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MyProfileData {
  userProfile?: {
    id: string;
    displayName: string;
  } & UserProfile_Key;
}
```
### Using `MyProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myProfile } from '@tavelyo/dataconnect-sdk';


// Call the `myProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myProfile(dataConnect);

console.log(data.userProfile);

// Or, you can use the `Promise` API.
myProfile().then((response) => {
  const data = response.data;
  console.log(data.userProfile);
});
```

### Using `MyProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myProfileRef } from '@tavelyo/dataconnect-sdk';


// Call the `myProfileRef()` function to get a reference to the query.
const ref = myProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userProfile);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfile);
});
```

## MyMemberships
You can execute the `MyMemberships` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myMemberships(options?: ExecuteQueryOptions): QueryPromise<MyMembershipsData, undefined>;

interface MyMembershipsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyMembershipsData, undefined>;
}
export const myMembershipsRef: MyMembershipsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myMemberships(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyMembershipsData, undefined>;

interface MyMembershipsRef {
  ...
  (dc: DataConnect): QueryRef<MyMembershipsData, undefined>;
}
export const myMembershipsRef: MyMembershipsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myMembershipsRef:
```typescript
const name = myMembershipsRef.operationName;
console.log(name);
```

### Variables
The `MyMemberships` query has no variables.
### Return Type
Recall that executing the `MyMemberships` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyMembershipsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `MyMemberships`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myMemberships } from '@tavelyo/dataconnect-sdk';


// Call the `myMemberships()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myMemberships();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myMemberships(dataConnect);

console.log(data.memberships);

// Or, you can use the `Promise` API.
myMemberships().then((response) => {
  const data = response.data;
  console.log(data.memberships);
});
```

### Using `MyMemberships`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myMembershipsRef } from '@tavelyo/dataconnect-sdk';


// Call the `myMembershipsRef()` function to get a reference to the query.
const ref = myMembershipsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myMembershipsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.memberships);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.memberships);
});
```

## MyBranches
You can execute the `MyBranches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myBranches(vars: MyBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<MyBranchesData, MyBranchesVariables>;

interface MyBranchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: MyBranchesVariables): QueryRef<MyBranchesData, MyBranchesVariables>;
}
export const myBranchesRef: MyBranchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myBranches(dc: DataConnect, vars: MyBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<MyBranchesData, MyBranchesVariables>;

interface MyBranchesRef {
  ...
  (dc: DataConnect, vars: MyBranchesVariables): QueryRef<MyBranchesData, MyBranchesVariables>;
}
export const myBranchesRef: MyBranchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myBranchesRef:
```typescript
const name = myBranchesRef.operationName;
console.log(name);
```

### Variables
The `MyBranches` query requires an argument of type `MyBranchesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface MyBranchesVariables {
  tenantId: UUIDString;
}
```
### Return Type
Recall that executing the `MyBranches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyBranchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MyBranchesData {
  branches: ({
    id: UUIDString;
    name: string;
    currency: string;
    timezone: string;
  } & Branch_Key)[];
}
```
### Using `MyBranches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myBranches, MyBranchesVariables } from '@tavelyo/dataconnect-sdk';

// The `MyBranches` query requires an argument of type `MyBranchesVariables`:
const myBranchesVars: MyBranchesVariables = {
  tenantId: ..., 
};

// Call the `myBranches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myBranches(myBranchesVars);
// Variables can be defined inline as well.
const { data } = await myBranches({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myBranches(dataConnect, myBranchesVars);

console.log(data.branches);

// Or, you can use the `Promise` API.
myBranches(myBranchesVars).then((response) => {
  const data = response.data;
  console.log(data.branches);
});
```

### Using `MyBranches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myBranchesRef, MyBranchesVariables } from '@tavelyo/dataconnect-sdk';

// The `MyBranches` query requires an argument of type `MyBranchesVariables`:
const myBranchesVars: MyBranchesVariables = {
  tenantId: ..., 
};

// Call the `myBranchesRef()` function to get a reference to the query.
const ref = myBranchesRef(myBranchesVars);
// Variables can be defined inline as well.
const ref = myBranchesRef({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myBranchesRef(dataConnect, myBranchesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.branches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.branches);
});
```

## TenantMembers
You can execute the `TenantMembers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
tenantMembers(vars: TenantMembersVariables, options?: ExecuteQueryOptions): QueryPromise<TenantMembersData, TenantMembersVariables>;

interface TenantMembersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TenantMembersVariables): QueryRef<TenantMembersData, TenantMembersVariables>;
}
export const tenantMembersRef: TenantMembersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
tenantMembers(dc: DataConnect, vars: TenantMembersVariables, options?: ExecuteQueryOptions): QueryPromise<TenantMembersData, TenantMembersVariables>;

interface TenantMembersRef {
  ...
  (dc: DataConnect, vars: TenantMembersVariables): QueryRef<TenantMembersData, TenantMembersVariables>;
}
export const tenantMembersRef: TenantMembersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the tenantMembersRef:
```typescript
const name = tenantMembersRef.operationName;
console.log(name);
```

### Variables
The `TenantMembers` query requires an argument of type `TenantMembersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TenantMembersVariables {
  tenantId: UUIDString;
}
```
### Return Type
Recall that executing the `TenantMembers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TenantMembersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `TenantMembers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, tenantMembers, TenantMembersVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantMembers` query requires an argument of type `TenantMembersVariables`:
const tenantMembersVars: TenantMembersVariables = {
  tenantId: ..., 
};

// Call the `tenantMembers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await tenantMembers(tenantMembersVars);
// Variables can be defined inline as well.
const { data } = await tenantMembers({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await tenantMembers(dataConnect, tenantMembersVars);

console.log(data.memberships);

// Or, you can use the `Promise` API.
tenantMembers(tenantMembersVars).then((response) => {
  const data = response.data;
  console.log(data.memberships);
});
```

### Using `TenantMembers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, tenantMembersRef, TenantMembersVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantMembers` query requires an argument of type `TenantMembersVariables`:
const tenantMembersVars: TenantMembersVariables = {
  tenantId: ..., 
};

// Call the `tenantMembersRef()` function to get a reference to the query.
const ref = tenantMembersRef(tenantMembersVars);
// Variables can be defined inline as well.
const ref = tenantMembersRef({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = tenantMembersRef(dataConnect, tenantMembersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.memberships);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.memberships);
});
```

## TenantAuditEvents
You can execute the `TenantAuditEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
tenantAuditEvents(vars: TenantAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<TenantAuditEventsData, TenantAuditEventsVariables>;

interface TenantAuditEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TenantAuditEventsVariables): QueryRef<TenantAuditEventsData, TenantAuditEventsVariables>;
}
export const tenantAuditEventsRef: TenantAuditEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
tenantAuditEvents(dc: DataConnect, vars: TenantAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<TenantAuditEventsData, TenantAuditEventsVariables>;

interface TenantAuditEventsRef {
  ...
  (dc: DataConnect, vars: TenantAuditEventsVariables): QueryRef<TenantAuditEventsData, TenantAuditEventsVariables>;
}
export const tenantAuditEventsRef: TenantAuditEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the tenantAuditEventsRef:
```typescript
const name = tenantAuditEventsRef.operationName;
console.log(name);
```

### Variables
The `TenantAuditEvents` query requires an argument of type `TenantAuditEventsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TenantAuditEventsVariables {
  tenantId: UUIDString;
}
```
### Return Type
Recall that executing the `TenantAuditEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TenantAuditEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `TenantAuditEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, tenantAuditEvents, TenantAuditEventsVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantAuditEvents` query requires an argument of type `TenantAuditEventsVariables`:
const tenantAuditEventsVars: TenantAuditEventsVariables = {
  tenantId: ..., 
};

// Call the `tenantAuditEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await tenantAuditEvents(tenantAuditEventsVars);
// Variables can be defined inline as well.
const { data } = await tenantAuditEvents({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await tenantAuditEvents(dataConnect, tenantAuditEventsVars);

console.log(data.auditEvents);

// Or, you can use the `Promise` API.
tenantAuditEvents(tenantAuditEventsVars).then((response) => {
  const data = response.data;
  console.log(data.auditEvents);
});
```

### Using `TenantAuditEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, tenantAuditEventsRef, TenantAuditEventsVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantAuditEvents` query requires an argument of type `TenantAuditEventsVariables`:
const tenantAuditEventsVars: TenantAuditEventsVariables = {
  tenantId: ..., 
};

// Call the `tenantAuditEventsRef()` function to get a reference to the query.
const ref = tenantAuditEventsRef(tenantAuditEventsVars);
// Variables can be defined inline as well.
const ref = tenantAuditEventsRef({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = tenantAuditEventsRef(dataConnect, tenantAuditEventsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.auditEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.auditEvents);
});
```

## FloorView
You can execute the `FloorView` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
floorView(vars: FloorViewVariables, options?: ExecuteQueryOptions): QueryPromise<FloorViewData, FloorViewVariables>;

interface FloorViewRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: FloorViewVariables): QueryRef<FloorViewData, FloorViewVariables>;
}
export const floorViewRef: FloorViewRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
floorView(dc: DataConnect, vars: FloorViewVariables, options?: ExecuteQueryOptions): QueryPromise<FloorViewData, FloorViewVariables>;

interface FloorViewRef {
  ...
  (dc: DataConnect, vars: FloorViewVariables): QueryRef<FloorViewData, FloorViewVariables>;
}
export const floorViewRef: FloorViewRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the floorViewRef:
```typescript
const name = floorViewRef.operationName;
console.log(name);
```

### Variables
The `FloorView` query requires an argument of type `FloorViewVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface FloorViewVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `FloorView` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `FloorViewData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `FloorView`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, floorView, FloorViewVariables } from '@tavelyo/dataconnect-sdk';

// The `FloorView` query requires an argument of type `FloorViewVariables`:
const floorViewVars: FloorViewVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `floorView()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await floorView(floorViewVars);
// Variables can be defined inline as well.
const { data } = await floorView({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await floorView(dataConnect, floorViewVars);

console.log(data.sectors);

// Or, you can use the `Promise` API.
floorView(floorViewVars).then((response) => {
  const data = response.data;
  console.log(data.sectors);
});
```

### Using `FloorView`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, floorViewRef, FloorViewVariables } from '@tavelyo/dataconnect-sdk';

// The `FloorView` query requires an argument of type `FloorViewVariables`:
const floorViewVars: FloorViewVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `floorViewRef()` function to get a reference to the query.
const ref = floorViewRef(floorViewVars);
// Variables can be defined inline as well.
const ref = floorViewRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = floorViewRef(dataConnect, floorViewVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sectors);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sectors);
});
```

## SessionParticipants
You can execute the `SessionParticipants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
sessionParticipants(vars: SessionParticipantsVariables, options?: ExecuteQueryOptions): QueryPromise<SessionParticipantsData, SessionParticipantsVariables>;

interface SessionParticipantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SessionParticipantsVariables): QueryRef<SessionParticipantsData, SessionParticipantsVariables>;
}
export const sessionParticipantsRef: SessionParticipantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
sessionParticipants(dc: DataConnect, vars: SessionParticipantsVariables, options?: ExecuteQueryOptions): QueryPromise<SessionParticipantsData, SessionParticipantsVariables>;

interface SessionParticipantsRef {
  ...
  (dc: DataConnect, vars: SessionParticipantsVariables): QueryRef<SessionParticipantsData, SessionParticipantsVariables>;
}
export const sessionParticipantsRef: SessionParticipantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the sessionParticipantsRef:
```typescript
const name = sessionParticipantsRef.operationName;
console.log(name);
```

### Variables
The `SessionParticipants` query requires an argument of type `SessionParticipantsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SessionParticipantsVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `SessionParticipants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SessionParticipantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SessionParticipantsData {
  sessionParticipants: ({
    id: UUIDString;
    guestNumber?: number | null;
    joinedAt: TimestampString;
    expiresAt: TimestampString;
    removedAt?: TimestampString | null;
  } & SessionParticipant_Key)[];
}
```
### Using `SessionParticipants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, sessionParticipants, SessionParticipantsVariables } from '@tavelyo/dataconnect-sdk';

// The `SessionParticipants` query requires an argument of type `SessionParticipantsVariables`:
const sessionParticipantsVars: SessionParticipantsVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `sessionParticipants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await sessionParticipants(sessionParticipantsVars);
// Variables can be defined inline as well.
const { data } = await sessionParticipants({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await sessionParticipants(dataConnect, sessionParticipantsVars);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
sessionParticipants(sessionParticipantsVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

### Using `SessionParticipants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, sessionParticipantsRef, SessionParticipantsVariables } from '@tavelyo/dataconnect-sdk';

// The `SessionParticipants` query requires an argument of type `SessionParticipantsVariables`:
const sessionParticipantsVars: SessionParticipantsVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `sessionParticipantsRef()` function to get a reference to the query.
const ref = sessionParticipantsRef(sessionParticipantsVars);
// Variables can be defined inline as well.
const ref = sessionParticipantsRef({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = sessionParticipantsRef(dataConnect, sessionParticipantsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

## ServerOpenSessionByQr
You can execute the `ServerOpenSessionByQr` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverOpenSessionByQr(vars: ServerOpenSessionByQrVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;

interface ServerOpenSessionByQrRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerOpenSessionByQrVariables): QueryRef<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;
}
export const serverOpenSessionByQrRef: ServerOpenSessionByQrRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverOpenSessionByQr(dc: DataConnect, vars: ServerOpenSessionByQrVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;

interface ServerOpenSessionByQrRef {
  ...
  (dc: DataConnect, vars: ServerOpenSessionByQrVariables): QueryRef<ServerOpenSessionByQrData, ServerOpenSessionByQrVariables>;
}
export const serverOpenSessionByQrRef: ServerOpenSessionByQrRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverOpenSessionByQrRef:
```typescript
const name = serverOpenSessionByQrRef.operationName;
console.log(name);
```

### Variables
The `ServerOpenSessionByQr` query requires an argument of type `ServerOpenSessionByQrVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerOpenSessionByQrVariables {
  qrPublicId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerOpenSessionByQr` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerOpenSessionByQrData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerOpenSessionByQr`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverOpenSessionByQr, ServerOpenSessionByQrVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerOpenSessionByQr` query requires an argument of type `ServerOpenSessionByQrVariables`:
const serverOpenSessionByQrVars: ServerOpenSessionByQrVariables = {
  qrPublicId: ..., 
  authUid: ..., 
};

// Call the `serverOpenSessionByQr()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverOpenSessionByQr(serverOpenSessionByQrVars);
// Variables can be defined inline as well.
const { data } = await serverOpenSessionByQr({ qrPublicId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverOpenSessionByQr(dataConnect, serverOpenSessionByQrVars);

console.log(data.diningTables);

// Or, you can use the `Promise` API.
serverOpenSessionByQr(serverOpenSessionByQrVars).then((response) => {
  const data = response.data;
  console.log(data.diningTables);
});
```

### Using `ServerOpenSessionByQr`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverOpenSessionByQrRef, ServerOpenSessionByQrVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerOpenSessionByQr` query requires an argument of type `ServerOpenSessionByQrVariables`:
const serverOpenSessionByQrVars: ServerOpenSessionByQrVariables = {
  qrPublicId: ..., 
  authUid: ..., 
};

// Call the `serverOpenSessionByQrRef()` function to get a reference to the query.
const ref = serverOpenSessionByQrRef(serverOpenSessionByQrVars);
// Variables can be defined inline as well.
const ref = serverOpenSessionByQrRef({ qrPublicId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverOpenSessionByQrRef(dataConnect, serverOpenSessionByQrVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.diningTables);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.diningTables);
});
```

## ServerMyOpenParticipation
You can execute the `ServerMyOpenParticipation` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverMyOpenParticipation(vars: ServerMyOpenParticipationVariables, options?: ExecuteQueryOptions): QueryPromise<ServerMyOpenParticipationData, ServerMyOpenParticipationVariables>;

interface ServerMyOpenParticipationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerMyOpenParticipationVariables): QueryRef<ServerMyOpenParticipationData, ServerMyOpenParticipationVariables>;
}
export const serverMyOpenParticipationRef: ServerMyOpenParticipationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverMyOpenParticipation(dc: DataConnect, vars: ServerMyOpenParticipationVariables, options?: ExecuteQueryOptions): QueryPromise<ServerMyOpenParticipationData, ServerMyOpenParticipationVariables>;

interface ServerMyOpenParticipationRef {
  ...
  (dc: DataConnect, vars: ServerMyOpenParticipationVariables): QueryRef<ServerMyOpenParticipationData, ServerMyOpenParticipationVariables>;
}
export const serverMyOpenParticipationRef: ServerMyOpenParticipationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverMyOpenParticipationRef:
```typescript
const name = serverMyOpenParticipationRef.operationName;
console.log(name);
```

### Variables
The `ServerMyOpenParticipation` query requires an argument of type `ServerMyOpenParticipationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerMyOpenParticipationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerMyOpenParticipation` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerMyOpenParticipationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerMyOpenParticipationData {
  sessionParticipants: ({
    id: UUIDString;
    expiresAt: TimestampString;
    session: {
      id: UUIDString;
      table: {
        code: string;
      };
    } & TableSession_Key;
  } & SessionParticipant_Key)[];
}
```
### Using `ServerMyOpenParticipation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverMyOpenParticipation, ServerMyOpenParticipationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerMyOpenParticipation` query requires an argument of type `ServerMyOpenParticipationVariables`:
const serverMyOpenParticipationVars: ServerMyOpenParticipationVariables = {
  tenantId: ..., 
  branchId: ..., 
  authUid: ..., 
};

// Call the `serverMyOpenParticipation()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverMyOpenParticipation(serverMyOpenParticipationVars);
// Variables can be defined inline as well.
const { data } = await serverMyOpenParticipation({ tenantId: ..., branchId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverMyOpenParticipation(dataConnect, serverMyOpenParticipationVars);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
serverMyOpenParticipation(serverMyOpenParticipationVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

### Using `ServerMyOpenParticipation`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverMyOpenParticipationRef, ServerMyOpenParticipationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerMyOpenParticipation` query requires an argument of type `ServerMyOpenParticipationVariables`:
const serverMyOpenParticipationVars: ServerMyOpenParticipationVariables = {
  tenantId: ..., 
  branchId: ..., 
  authUid: ..., 
};

// Call the `serverMyOpenParticipationRef()` function to get a reference to the query.
const ref = serverMyOpenParticipationRef(serverMyOpenParticipationVars);
// Variables can be defined inline as well.
const ref = serverMyOpenParticipationRef({ tenantId: ..., branchId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverMyOpenParticipationRef(dataConnect, serverMyOpenParticipationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

## ServerQuoteContext
You can execute the `ServerQuoteContext` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverQuoteContext(vars: ServerQuoteContextVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteContextData, ServerQuoteContextVariables>;

interface ServerQuoteContextRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteContextVariables): QueryRef<ServerQuoteContextData, ServerQuoteContextVariables>;
}
export const serverQuoteContextRef: ServerQuoteContextRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverQuoteContext(dc: DataConnect, vars: ServerQuoteContextVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteContextData, ServerQuoteContextVariables>;

interface ServerQuoteContextRef {
  ...
  (dc: DataConnect, vars: ServerQuoteContextVariables): QueryRef<ServerQuoteContextData, ServerQuoteContextVariables>;
}
export const serverQuoteContextRef: ServerQuoteContextRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverQuoteContextRef:
```typescript
const name = serverQuoteContextRef.operationName;
console.log(name);
```

### Variables
The `ServerQuoteContext` query requires an argument of type `ServerQuoteContextVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerQuoteContextVariables {
  sessionId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerQuoteContext` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerQuoteContextData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerQuoteContext`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverQuoteContext, ServerQuoteContextVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteContext` query requires an argument of type `ServerQuoteContextVariables`:
const serverQuoteContextVars: ServerQuoteContextVariables = {
  sessionId: ..., 
  authUid: ..., 
};

// Call the `serverQuoteContext()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverQuoteContext(serverQuoteContextVars);
// Variables can be defined inline as well.
const { data } = await serverQuoteContext({ sessionId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverQuoteContext(dataConnect, serverQuoteContextVars);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
serverQuoteContext(serverQuoteContextVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

### Using `ServerQuoteContext`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverQuoteContextRef, ServerQuoteContextVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteContext` query requires an argument of type `ServerQuoteContextVariables`:
const serverQuoteContextVars: ServerQuoteContextVariables = {
  sessionId: ..., 
  authUid: ..., 
};

// Call the `serverQuoteContextRef()` function to get a reference to the query.
const ref = serverQuoteContextRef(serverQuoteContextVars);
// Variables can be defined inline as well.
const ref = serverQuoteContextRef({ sessionId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverQuoteContextRef(dataConnect, serverQuoteContextVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.sessionParticipants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipants);
});
```

## ServerProductsForQuote
You can execute the `ServerProductsForQuote` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverProductsForQuote(vars: ServerProductsForQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;

interface ServerProductsForQuoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerProductsForQuoteVariables): QueryRef<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;
}
export const serverProductsForQuoteRef: ServerProductsForQuoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverProductsForQuote(dc: DataConnect, vars: ServerProductsForQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;

interface ServerProductsForQuoteRef {
  ...
  (dc: DataConnect, vars: ServerProductsForQuoteVariables): QueryRef<ServerProductsForQuoteData, ServerProductsForQuoteVariables>;
}
export const serverProductsForQuoteRef: ServerProductsForQuoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverProductsForQuoteRef:
```typescript
const name = serverProductsForQuoteRef.operationName;
console.log(name);
```

### Variables
The `ServerProductsForQuote` query requires an argument of type `ServerProductsForQuoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerProductsForQuoteVariables {
  branchId: UUIDString;
  productIds: UUIDString[];
}
```
### Return Type
Recall that executing the `ServerProductsForQuote` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerProductsForQuoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerProductsForQuote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverProductsForQuote, ServerProductsForQuoteVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerProductsForQuote` query requires an argument of type `ServerProductsForQuoteVariables`:
const serverProductsForQuoteVars: ServerProductsForQuoteVariables = {
  branchId: ..., 
  productIds: ..., 
};

// Call the `serverProductsForQuote()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverProductsForQuote(serverProductsForQuoteVars);
// Variables can be defined inline as well.
const { data } = await serverProductsForQuote({ branchId: ..., productIds: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverProductsForQuote(dataConnect, serverProductsForQuoteVars);

console.log(data.productBranches);

// Or, you can use the `Promise` API.
serverProductsForQuote(serverProductsForQuoteVars).then((response) => {
  const data = response.data;
  console.log(data.productBranches);
});
```

### Using `ServerProductsForQuote`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverProductsForQuoteRef, ServerProductsForQuoteVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerProductsForQuote` query requires an argument of type `ServerProductsForQuoteVariables`:
const serverProductsForQuoteVars: ServerProductsForQuoteVariables = {
  branchId: ..., 
  productIds: ..., 
};

// Call the `serverProductsForQuoteRef()` function to get a reference to the query.
const ref = serverProductsForQuoteRef(serverProductsForQuoteVars);
// Variables can be defined inline as well.
const ref = serverProductsForQuoteRef({ branchId: ..., productIds: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverProductsForQuoteRef(dataConnect, serverProductsForQuoteVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.productBranches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.productBranches);
});
```

## ServerQuoteByKey
You can execute the `ServerQuoteByKey` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverQuoteByKey(vars: ServerQuoteByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;

interface ServerQuoteByKeyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteByKeyVariables): QueryRef<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;
}
export const serverQuoteByKeyRef: ServerQuoteByKeyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverQuoteByKey(dc: DataConnect, vars: ServerQuoteByKeyVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;

interface ServerQuoteByKeyRef {
  ...
  (dc: DataConnect, vars: ServerQuoteByKeyVariables): QueryRef<ServerQuoteByKeyData, ServerQuoteByKeyVariables>;
}
export const serverQuoteByKeyRef: ServerQuoteByKeyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverQuoteByKeyRef:
```typescript
const name = serverQuoteByKeyRef.operationName;
console.log(name);
```

### Variables
The `ServerQuoteByKey` query requires an argument of type `ServerQuoteByKeyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerQuoteByKeyVariables {
  participantId: UUIDString;
  idempotencyKey: string;
}
```
### Return Type
Recall that executing the `ServerQuoteByKey` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerQuoteByKeyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerQuoteByKey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverQuoteByKey, ServerQuoteByKeyVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteByKey` query requires an argument of type `ServerQuoteByKeyVariables`:
const serverQuoteByKeyVars: ServerQuoteByKeyVariables = {
  participantId: ..., 
  idempotencyKey: ..., 
};

// Call the `serverQuoteByKey()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverQuoteByKey(serverQuoteByKeyVars);
// Variables can be defined inline as well.
const { data } = await serverQuoteByKey({ participantId: ..., idempotencyKey: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverQuoteByKey(dataConnect, serverQuoteByKeyVars);

console.log(data.orderQuotes);

// Or, you can use the `Promise` API.
serverQuoteByKey(serverQuoteByKeyVars).then((response) => {
  const data = response.data;
  console.log(data.orderQuotes);
});
```

### Using `ServerQuoteByKey`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverQuoteByKeyRef, ServerQuoteByKeyVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteByKey` query requires an argument of type `ServerQuoteByKeyVariables`:
const serverQuoteByKeyVars: ServerQuoteByKeyVariables = {
  participantId: ..., 
  idempotencyKey: ..., 
};

// Call the `serverQuoteByKeyRef()` function to get a reference to the query.
const ref = serverQuoteByKeyRef(serverQuoteByKeyVars);
// Variables can be defined inline as well.
const ref = serverQuoteByKeyRef({ participantId: ..., idempotencyKey: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverQuoteByKeyRef(dataConnect, serverQuoteByKeyVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orderQuotes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orderQuotes);
});
```

## ServerQuoteForSubmit
You can execute the `ServerQuoteForSubmit` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverQuoteForSubmit(vars: ServerQuoteForSubmitVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;

interface ServerQuoteForSubmitRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteForSubmitVariables): QueryRef<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;
}
export const serverQuoteForSubmitRef: ServerQuoteForSubmitRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverQuoteForSubmit(dc: DataConnect, vars: ServerQuoteForSubmitVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;

interface ServerQuoteForSubmitRef {
  ...
  (dc: DataConnect, vars: ServerQuoteForSubmitVariables): QueryRef<ServerQuoteForSubmitData, ServerQuoteForSubmitVariables>;
}
export const serverQuoteForSubmitRef: ServerQuoteForSubmitRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverQuoteForSubmitRef:
```typescript
const name = serverQuoteForSubmitRef.operationName;
console.log(name);
```

### Variables
The `ServerQuoteForSubmit` query requires an argument of type `ServerQuoteForSubmitVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerQuoteForSubmitVariables {
  quoteId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerQuoteForSubmit` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerQuoteForSubmitData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerQuoteForSubmit`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverQuoteForSubmit, ServerQuoteForSubmitVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteForSubmit` query requires an argument of type `ServerQuoteForSubmitVariables`:
const serverQuoteForSubmitVars: ServerQuoteForSubmitVariables = {
  quoteId: ..., 
  authUid: ..., 
};

// Call the `serverQuoteForSubmit()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverQuoteForSubmit(serverQuoteForSubmitVars);
// Variables can be defined inline as well.
const { data } = await serverQuoteForSubmit({ quoteId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverQuoteForSubmit(dataConnect, serverQuoteForSubmitVars);

console.log(data.orderQuotes);

// Or, you can use the `Promise` API.
serverQuoteForSubmit(serverQuoteForSubmitVars).then((response) => {
  const data = response.data;
  console.log(data.orderQuotes);
});
```

### Using `ServerQuoteForSubmit`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverQuoteForSubmitRef, ServerQuoteForSubmitVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteForSubmit` query requires an argument of type `ServerQuoteForSubmitVariables`:
const serverQuoteForSubmitVars: ServerQuoteForSubmitVariables = {
  quoteId: ..., 
  authUid: ..., 
};

// Call the `serverQuoteForSubmitRef()` function to get a reference to the query.
const ref = serverQuoteForSubmitRef(serverQuoteForSubmitVars);
// Variables can be defined inline as well.
const ref = serverQuoteForSubmitRef({ quoteId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverQuoteForSubmitRef(dataConnect, serverQuoteForSubmitVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orderQuotes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orderQuotes);
});
```

## ServerOrderByQuote
You can execute the `ServerOrderByQuote` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverOrderByQuote(vars: ServerOrderByQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;

interface ServerOrderByQuoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerOrderByQuoteVariables): QueryRef<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;
}
export const serverOrderByQuoteRef: ServerOrderByQuoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverOrderByQuote(dc: DataConnect, vars: ServerOrderByQuoteVariables, options?: ExecuteQueryOptions): QueryPromise<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;

interface ServerOrderByQuoteRef {
  ...
  (dc: DataConnect, vars: ServerOrderByQuoteVariables): QueryRef<ServerOrderByQuoteData, ServerOrderByQuoteVariables>;
}
export const serverOrderByQuoteRef: ServerOrderByQuoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverOrderByQuoteRef:
```typescript
const name = serverOrderByQuoteRef.operationName;
console.log(name);
```

### Variables
The `ServerOrderByQuote` query requires an argument of type `ServerOrderByQuoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerOrderByQuoteVariables {
  quoteId: UUIDString;
}
```
### Return Type
Recall that executing the `ServerOrderByQuote` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerOrderByQuoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerOrderByQuoteData {
  orders: ({
    id: UUIDString;
    sentToKitchenAt?: TimestampString | null;
    approval: OrderApproval;
  } & Order_Key)[];
}
```
### Using `ServerOrderByQuote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverOrderByQuote, ServerOrderByQuoteVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerOrderByQuote` query requires an argument of type `ServerOrderByQuoteVariables`:
const serverOrderByQuoteVars: ServerOrderByQuoteVariables = {
  quoteId: ..., 
};

// Call the `serverOrderByQuote()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverOrderByQuote(serverOrderByQuoteVars);
// Variables can be defined inline as well.
const { data } = await serverOrderByQuote({ quoteId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverOrderByQuote(dataConnect, serverOrderByQuoteVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
serverOrderByQuote(serverOrderByQuoteVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `ServerOrderByQuote`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverOrderByQuoteRef, ServerOrderByQuoteVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerOrderByQuote` query requires an argument of type `ServerOrderByQuoteVariables`:
const serverOrderByQuoteVars: ServerOrderByQuoteVariables = {
  quoteId: ..., 
};

// Call the `serverOrderByQuoteRef()` function to get a reference to the query.
const ref = serverOrderByQuoteRef(serverOrderByQuoteVars);
// Variables can be defined inline as well.
const ref = serverOrderByQuoteRef({ quoteId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverOrderByQuoteRef(dataConnect, serverOrderByQuoteVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## ServerProductsForOrder
You can execute the `ServerProductsForOrder` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverProductsForOrder(vars: ServerProductsForOrderVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForOrderData, ServerProductsForOrderVariables>;

interface ServerProductsForOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerProductsForOrderVariables): QueryRef<ServerProductsForOrderData, ServerProductsForOrderVariables>;
}
export const serverProductsForOrderRef: ServerProductsForOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverProductsForOrder(dc: DataConnect, vars: ServerProductsForOrderVariables, options?: ExecuteQueryOptions): QueryPromise<ServerProductsForOrderData, ServerProductsForOrderVariables>;

interface ServerProductsForOrderRef {
  ...
  (dc: DataConnect, vars: ServerProductsForOrderVariables): QueryRef<ServerProductsForOrderData, ServerProductsForOrderVariables>;
}
export const serverProductsForOrderRef: ServerProductsForOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverProductsForOrderRef:
```typescript
const name = serverProductsForOrderRef.operationName;
console.log(name);
```

### Variables
The `ServerProductsForOrder` query requires an argument of type `ServerProductsForOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerProductsForOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productIds: UUIDString[];
}
```
### Return Type
Recall that executing the `ServerProductsForOrder` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerProductsForOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerProductsForOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverProductsForOrder, ServerProductsForOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerProductsForOrder` query requires an argument of type `ServerProductsForOrderVariables`:
const serverProductsForOrderVars: ServerProductsForOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  productIds: ..., 
};

// Call the `serverProductsForOrder()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverProductsForOrder(serverProductsForOrderVars);
// Variables can be defined inline as well.
const { data } = await serverProductsForOrder({ tenantId: ..., branchId: ..., productIds: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverProductsForOrder(dataConnect, serverProductsForOrderVars);

console.log(data.productBranches);
console.log(data.defaultStation);

// Or, you can use the `Promise` API.
serverProductsForOrder(serverProductsForOrderVars).then((response) => {
  const data = response.data;
  console.log(data.productBranches);
  console.log(data.defaultStation);
});
```

### Using `ServerProductsForOrder`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverProductsForOrderRef, ServerProductsForOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerProductsForOrder` query requires an argument of type `ServerProductsForOrderVariables`:
const serverProductsForOrderVars: ServerProductsForOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  productIds: ..., 
};

// Call the `serverProductsForOrderRef()` function to get a reference to the query.
const ref = serverProductsForOrderRef(serverProductsForOrderVars);
// Variables can be defined inline as well.
const ref = serverProductsForOrderRef({ tenantId: ..., branchId: ..., productIds: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverProductsForOrderRef(dataConnect, serverProductsForOrderVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.productBranches);
console.log(data.defaultStation);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.productBranches);
  console.log(data.defaultStation);
});
```

## TenantBranches
You can execute the `TenantBranches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
tenantBranches(vars: TenantBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<TenantBranchesData, TenantBranchesVariables>;

interface TenantBranchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TenantBranchesVariables): QueryRef<TenantBranchesData, TenantBranchesVariables>;
}
export const tenantBranchesRef: TenantBranchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
tenantBranches(dc: DataConnect, vars: TenantBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<TenantBranchesData, TenantBranchesVariables>;

interface TenantBranchesRef {
  ...
  (dc: DataConnect, vars: TenantBranchesVariables): QueryRef<TenantBranchesData, TenantBranchesVariables>;
}
export const tenantBranchesRef: TenantBranchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the tenantBranchesRef:
```typescript
const name = tenantBranchesRef.operationName;
console.log(name);
```

### Variables
The `TenantBranches` query requires an argument of type `TenantBranchesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TenantBranchesVariables {
  tenantId: UUIDString;
}
```
### Return Type
Recall that executing the `TenantBranches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TenantBranchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface TenantBranchesData {
  branches: ({
    id: UUIDString;
    name: string;
    currency: string;
    timezone: string;
    status: BranchStatus;
  } & Branch_Key)[];
}
```
### Using `TenantBranches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, tenantBranches, TenantBranchesVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantBranches` query requires an argument of type `TenantBranchesVariables`:
const tenantBranchesVars: TenantBranchesVariables = {
  tenantId: ..., 
};

// Call the `tenantBranches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await tenantBranches(tenantBranchesVars);
// Variables can be defined inline as well.
const { data } = await tenantBranches({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await tenantBranches(dataConnect, tenantBranchesVars);

console.log(data.branches);

// Or, you can use the `Promise` API.
tenantBranches(tenantBranchesVars).then((response) => {
  const data = response.data;
  console.log(data.branches);
});
```

### Using `TenantBranches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, tenantBranchesRef, TenantBranchesVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantBranches` query requires an argument of type `TenantBranchesVariables`:
const tenantBranchesVars: TenantBranchesVariables = {
  tenantId: ..., 
};

// Call the `tenantBranchesRef()` function to get a reference to the query.
const ref = tenantBranchesRef(tenantBranchesVars);
// Variables can be defined inline as well.
const ref = tenantBranchesRef({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = tenantBranchesRef(dataConnect, tenantBranchesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.branches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.branches);
});
```

## TenantProfile
You can execute the `TenantProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
tenantProfile(vars: TenantProfileVariables, options?: ExecuteQueryOptions): QueryPromise<TenantProfileData, TenantProfileVariables>;

interface TenantProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TenantProfileVariables): QueryRef<TenantProfileData, TenantProfileVariables>;
}
export const tenantProfileRef: TenantProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
tenantProfile(dc: DataConnect, vars: TenantProfileVariables, options?: ExecuteQueryOptions): QueryPromise<TenantProfileData, TenantProfileVariables>;

interface TenantProfileRef {
  ...
  (dc: DataConnect, vars: TenantProfileVariables): QueryRef<TenantProfileData, TenantProfileVariables>;
}
export const tenantProfileRef: TenantProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the tenantProfileRef:
```typescript
const name = tenantProfileRef.operationName;
console.log(name);
```

### Variables
The `TenantProfile` query requires an argument of type `TenantProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TenantProfileVariables {
  tenantId: UUIDString;
}
```
### Return Type
Recall that executing the `TenantProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TenantProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface TenantProfileData {
  tenant?: {
    name: string;
    taxId?: string | null;
  };
}
```
### Using `TenantProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, tenantProfile, TenantProfileVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantProfile` query requires an argument of type `TenantProfileVariables`:
const tenantProfileVars: TenantProfileVariables = {
  tenantId: ..., 
};

// Call the `tenantProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await tenantProfile(tenantProfileVars);
// Variables can be defined inline as well.
const { data } = await tenantProfile({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await tenantProfile(dataConnect, tenantProfileVars);

console.log(data.tenant);

// Or, you can use the `Promise` API.
tenantProfile(tenantProfileVars).then((response) => {
  const data = response.data;
  console.log(data.tenant);
});
```

### Using `TenantProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, tenantProfileRef, TenantProfileVariables } from '@tavelyo/dataconnect-sdk';

// The `TenantProfile` query requires an argument of type `TenantProfileVariables`:
const tenantProfileVars: TenantProfileVariables = {
  tenantId: ..., 
};

// Call the `tenantProfileRef()` function to get a reference to the query.
const ref = tenantProfileRef(tenantProfileVars);
// Variables can be defined inline as well.
const ref = tenantProfileRef({ tenantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = tenantProfileRef(dataConnect, tenantProfileVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tenant);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tenant);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `tavelyo` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## SetBranchOrderApproval
You can execute the `SetBranchOrderApproval` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setBranchOrderApproval(vars: SetBranchOrderApprovalVariables): MutationPromise<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;

interface SetBranchOrderApprovalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetBranchOrderApprovalVariables): MutationRef<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;
}
export const setBranchOrderApprovalRef: SetBranchOrderApprovalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setBranchOrderApproval(dc: DataConnect, vars: SetBranchOrderApprovalVariables): MutationPromise<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;

interface SetBranchOrderApprovalRef {
  ...
  (dc: DataConnect, vars: SetBranchOrderApprovalVariables): MutationRef<SetBranchOrderApprovalData, SetBranchOrderApprovalVariables>;
}
export const setBranchOrderApprovalRef: SetBranchOrderApprovalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setBranchOrderApprovalRef:
```typescript
const name = setBranchOrderApprovalRef.operationName;
console.log(name);
```

### Variables
The `SetBranchOrderApproval` mutation requires an argument of type `SetBranchOrderApprovalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetBranchOrderApprovalVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  mode: OrderApprovalMode;
}
```
### Return Type
Recall that executing the `SetBranchOrderApproval` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetBranchOrderApprovalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetBranchOrderApprovalData {
  branch_update?: Branch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `SetBranchOrderApproval`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setBranchOrderApproval, SetBranchOrderApprovalVariables } from '@tavelyo/dataconnect-sdk';

// The `SetBranchOrderApproval` mutation requires an argument of type `SetBranchOrderApprovalVariables`:
const setBranchOrderApprovalVars: SetBranchOrderApprovalVariables = {
  tenantId: ..., 
  branchId: ..., 
  mode: ..., 
};

// Call the `setBranchOrderApproval()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setBranchOrderApproval(setBranchOrderApprovalVars);
// Variables can be defined inline as well.
const { data } = await setBranchOrderApproval({ tenantId: ..., branchId: ..., mode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setBranchOrderApproval(dataConnect, setBranchOrderApprovalVars);

console.log(data.branch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
setBranchOrderApproval(setBranchOrderApprovalVars).then((response) => {
  const data = response.data;
  console.log(data.branch_update);
  console.log(data.auditEvent_insert);
});
```

### Using `SetBranchOrderApproval`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setBranchOrderApprovalRef, SetBranchOrderApprovalVariables } from '@tavelyo/dataconnect-sdk';

// The `SetBranchOrderApproval` mutation requires an argument of type `SetBranchOrderApprovalVariables`:
const setBranchOrderApprovalVars: SetBranchOrderApprovalVariables = {
  tenantId: ..., 
  branchId: ..., 
  mode: ..., 
};

// Call the `setBranchOrderApprovalRef()` function to get a reference to the mutation.
const ref = setBranchOrderApprovalRef(setBranchOrderApprovalVars);
// Variables can be defined inline as well.
const ref = setBranchOrderApprovalRef({ tenantId: ..., branchId: ..., mode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setBranchOrderApprovalRef(dataConnect, setBranchOrderApprovalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.branch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.branch_update);
  console.log(data.auditEvent_insert);
});
```

## ApproveOrder
You can execute the `ApproveOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
approveOrder(vars: ApproveOrderVariables): MutationPromise<ApproveOrderData, ApproveOrderVariables>;

interface ApproveOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ApproveOrderVariables): MutationRef<ApproveOrderData, ApproveOrderVariables>;
}
export const approveOrderRef: ApproveOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
approveOrder(dc: DataConnect, vars: ApproveOrderVariables): MutationPromise<ApproveOrderData, ApproveOrderVariables>;

interface ApproveOrderRef {
  ...
  (dc: DataConnect, vars: ApproveOrderVariables): MutationRef<ApproveOrderData, ApproveOrderVariables>;
}
export const approveOrderRef: ApproveOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the approveOrderRef:
```typescript
const name = approveOrderRef.operationName;
console.log(name);
```

### Variables
The `ApproveOrder` mutation requires an argument of type `ApproveOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ApproveOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
}
```
### Return Type
Recall that executing the `ApproveOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ApproveOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ApproveOrderData {
  sessionLock: number;
  order_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ApproveOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, approveOrder, ApproveOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `ApproveOrder` mutation requires an argument of type `ApproveOrderVariables`:
const approveOrderVars: ApproveOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
};

// Call the `approveOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await approveOrder(approveOrderVars);
// Variables can be defined inline as well.
const { data } = await approveOrder({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await approveOrder(dataConnect, approveOrderVars);

console.log(data.sessionLock);
console.log(data.order_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
approveOrder(approveOrderVars).then((response) => {
  const data = response.data;
  console.log(data.sessionLock);
  console.log(data.order_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `ApproveOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, approveOrderRef, ApproveOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `ApproveOrder` mutation requires an argument of type `ApproveOrderVariables`:
const approveOrderVars: ApproveOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
};

// Call the `approveOrderRef()` function to get a reference to the mutation.
const ref = approveOrderRef(approveOrderVars);
// Variables can be defined inline as well.
const ref = approveOrderRef({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = approveOrderRef(dataConnect, approveOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sessionLock);
console.log(data.order_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionLock);
  console.log(data.order_updateMany);
  console.log(data.auditEvent_insert);
});
```

## RejectOrder
You can execute the `RejectOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
rejectOrder(vars: RejectOrderVariables): MutationPromise<RejectOrderData, RejectOrderVariables>;

interface RejectOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RejectOrderVariables): MutationRef<RejectOrderData, RejectOrderVariables>;
}
export const rejectOrderRef: RejectOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
rejectOrder(dc: DataConnect, vars: RejectOrderVariables): MutationPromise<RejectOrderData, RejectOrderVariables>;

interface RejectOrderRef {
  ...
  (dc: DataConnect, vars: RejectOrderVariables): MutationRef<RejectOrderData, RejectOrderVariables>;
}
export const rejectOrderRef: RejectOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the rejectOrderRef:
```typescript
const name = rejectOrderRef.operationName;
console.log(name);
```

### Variables
The `RejectOrder` mutation requires an argument of type `RejectOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RejectOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
  reason: string;
}
```
### Return Type
Recall that executing the `RejectOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RejectOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RejectOrderData {
  order_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `RejectOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, rejectOrder, RejectOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `RejectOrder` mutation requires an argument of type `RejectOrderVariables`:
const rejectOrderVars: RejectOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  reason: ..., 
};

// Call the `rejectOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await rejectOrder(rejectOrderVars);
// Variables can be defined inline as well.
const { data } = await rejectOrder({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await rejectOrder(dataConnect, rejectOrderVars);

console.log(data.order_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
rejectOrder(rejectOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `RejectOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, rejectOrderRef, RejectOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `RejectOrder` mutation requires an argument of type `RejectOrderVariables`:
const rejectOrderVars: RejectOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  reason: ..., 
};

// Call the `rejectOrderRef()` function to get a reference to the mutation.
const ref = rejectOrderRef(rejectOrderVars);
// Variables can be defined inline as well.
const ref = rejectOrderRef({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = rejectOrderRef(dataConnect, rejectOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_updateMany);
  console.log(data.auditEvent_insert);
});
```

## WithdrawMyOrder
You can execute the `WithdrawMyOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
withdrawMyOrder(vars: WithdrawMyOrderVariables): MutationPromise<WithdrawMyOrderData, WithdrawMyOrderVariables>;

interface WithdrawMyOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: WithdrawMyOrderVariables): MutationRef<WithdrawMyOrderData, WithdrawMyOrderVariables>;
}
export const withdrawMyOrderRef: WithdrawMyOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
withdrawMyOrder(dc: DataConnect, vars: WithdrawMyOrderVariables): MutationPromise<WithdrawMyOrderData, WithdrawMyOrderVariables>;

interface WithdrawMyOrderRef {
  ...
  (dc: DataConnect, vars: WithdrawMyOrderVariables): MutationRef<WithdrawMyOrderData, WithdrawMyOrderVariables>;
}
export const withdrawMyOrderRef: WithdrawMyOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the withdrawMyOrderRef:
```typescript
const name = withdrawMyOrderRef.operationName;
console.log(name);
```

### Variables
The `WithdrawMyOrder` mutation requires an argument of type `WithdrawMyOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface WithdrawMyOrderVariables {
  sessionId: UUIDString;
  branchId: UUIDString;
  orderId: UUIDString;
}
```
### Return Type
Recall that executing the `WithdrawMyOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `WithdrawMyOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface WithdrawMyOrderData {
  order_updateMany: number;
}
```
### Using `WithdrawMyOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, withdrawMyOrder, WithdrawMyOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `WithdrawMyOrder` mutation requires an argument of type `WithdrawMyOrderVariables`:
const withdrawMyOrderVars: WithdrawMyOrderVariables = {
  sessionId: ..., 
  branchId: ..., 
  orderId: ..., 
};

// Call the `withdrawMyOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await withdrawMyOrder(withdrawMyOrderVars);
// Variables can be defined inline as well.
const { data } = await withdrawMyOrder({ sessionId: ..., branchId: ..., orderId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await withdrawMyOrder(dataConnect, withdrawMyOrderVars);

console.log(data.order_updateMany);

// Or, you can use the `Promise` API.
withdrawMyOrder(withdrawMyOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_updateMany);
});
```

### Using `WithdrawMyOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, withdrawMyOrderRef, WithdrawMyOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `WithdrawMyOrder` mutation requires an argument of type `WithdrawMyOrderVariables`:
const withdrawMyOrderVars: WithdrawMyOrderVariables = {
  sessionId: ..., 
  branchId: ..., 
  orderId: ..., 
};

// Call the `withdrawMyOrderRef()` function to get a reference to the mutation.
const ref = withdrawMyOrderRef(withdrawMyOrderVars);
// Variables can be defined inline as well.
const ref = withdrawMyOrderRef({ sessionId: ..., branchId: ..., orderId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = withdrawMyOrderRef(dataConnect, withdrawMyOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_updateMany);
});
```

## CreateRegister
You can execute the `CreateRegister` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRegister(vars: CreateRegisterVariables): MutationPromise<CreateRegisterData, CreateRegisterVariables>;

interface CreateRegisterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRegisterVariables): MutationRef<CreateRegisterData, CreateRegisterVariables>;
}
export const createRegisterRef: CreateRegisterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRegister(dc: DataConnect, vars: CreateRegisterVariables): MutationPromise<CreateRegisterData, CreateRegisterVariables>;

interface CreateRegisterRef {
  ...
  (dc: DataConnect, vars: CreateRegisterVariables): MutationRef<CreateRegisterData, CreateRegisterVariables>;
}
export const createRegisterRef: CreateRegisterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRegisterRef:
```typescript
const name = createRegisterRef.operationName;
console.log(name);
```

### Variables
The `CreateRegister` mutation requires an argument of type `CreateRegisterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateRegisterVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  name: string;
}
```
### Return Type
Recall that executing the `CreateRegister` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRegisterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRegisterData {
  register_insert: Register_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateRegister`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRegister, CreateRegisterVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateRegister` mutation requires an argument of type `CreateRegisterVariables`:
const createRegisterVars: CreateRegisterVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
};

// Call the `createRegister()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRegister(createRegisterVars);
// Variables can be defined inline as well.
const { data } = await createRegister({ tenantId: ..., branchId: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRegister(dataConnect, createRegisterVars);

console.log(data.register_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createRegister(createRegisterVars).then((response) => {
  const data = response.data;
  console.log(data.register_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateRegister`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRegisterRef, CreateRegisterVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateRegister` mutation requires an argument of type `CreateRegisterVariables`:
const createRegisterVars: CreateRegisterVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
};

// Call the `createRegisterRef()` function to get a reference to the mutation.
const ref = createRegisterRef(createRegisterVars);
// Variables can be defined inline as well.
const ref = createRegisterRef({ tenantId: ..., branchId: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRegisterRef(dataConnect, createRegisterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.register_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.register_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateRegister
You can execute the `UpdateRegister` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateRegister(vars: UpdateRegisterVariables): MutationPromise<UpdateRegisterData, UpdateRegisterVariables>;

interface UpdateRegisterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRegisterVariables): MutationRef<UpdateRegisterData, UpdateRegisterVariables>;
}
export const updateRegisterRef: UpdateRegisterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRegister(dc: DataConnect, vars: UpdateRegisterVariables): MutationPromise<UpdateRegisterData, UpdateRegisterVariables>;

interface UpdateRegisterRef {
  ...
  (dc: DataConnect, vars: UpdateRegisterVariables): MutationRef<UpdateRegisterData, UpdateRegisterVariables>;
}
export const updateRegisterRef: UpdateRegisterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRegisterRef:
```typescript
const name = updateRegisterRef.operationName;
console.log(name);
```

### Variables
The `UpdateRegister` mutation requires an argument of type `UpdateRegisterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateRegisterVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  registerId: UUIDString;
  name: string;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateRegister` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRegisterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRegisterData {
  register_update?: Register_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateRegister`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRegister, UpdateRegisterVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateRegister` mutation requires an argument of type `UpdateRegisterVariables`:
const updateRegisterVars: UpdateRegisterVariables = {
  tenantId: ..., 
  branchId: ..., 
  registerId: ..., 
  name: ..., 
  archived: ..., 
};

// Call the `updateRegister()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRegister(updateRegisterVars);
// Variables can be defined inline as well.
const { data } = await updateRegister({ tenantId: ..., branchId: ..., registerId: ..., name: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRegister(dataConnect, updateRegisterVars);

console.log(data.register_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateRegister(updateRegisterVars).then((response) => {
  const data = response.data;
  console.log(data.register_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateRegister`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRegisterRef, UpdateRegisterVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateRegister` mutation requires an argument of type `UpdateRegisterVariables`:
const updateRegisterVars: UpdateRegisterVariables = {
  tenantId: ..., 
  branchId: ..., 
  registerId: ..., 
  name: ..., 
  archived: ..., 
};

// Call the `updateRegisterRef()` function to get a reference to the mutation.
const ref = updateRegisterRef(updateRegisterVars);
// Variables can be defined inline as well.
const ref = updateRegisterRef({ tenantId: ..., branchId: ..., registerId: ..., name: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRegisterRef(dataConnect, updateRegisterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.register_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.register_update);
  console.log(data.auditEvent_insert);
});
```

## CreateTaxRule
You can execute the `CreateTaxRule` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTaxRule(vars: CreateTaxRuleVariables): MutationPromise<CreateTaxRuleData, CreateTaxRuleVariables>;

interface CreateTaxRuleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaxRuleVariables): MutationRef<CreateTaxRuleData, CreateTaxRuleVariables>;
}
export const createTaxRuleRef: CreateTaxRuleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTaxRule(dc: DataConnect, vars: CreateTaxRuleVariables): MutationPromise<CreateTaxRuleData, CreateTaxRuleVariables>;

interface CreateTaxRuleRef {
  ...
  (dc: DataConnect, vars: CreateTaxRuleVariables): MutationRef<CreateTaxRuleData, CreateTaxRuleVariables>;
}
export const createTaxRuleRef: CreateTaxRuleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTaxRuleRef:
```typescript
const name = createTaxRuleRef.operationName;
console.log(name);
```

### Variables
The `CreateTaxRule` mutation requires an argument of type `CreateTaxRuleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTaxRuleVariables {
  tenantId: UUIDString;
  name: string;
  rateBp: number;
}
```
### Return Type
Recall that executing the `CreateTaxRule` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTaxRuleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTaxRuleData {
  taxRule_insert: TaxRule_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateTaxRule`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTaxRule, CreateTaxRuleVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateTaxRule` mutation requires an argument of type `CreateTaxRuleVariables`:
const createTaxRuleVars: CreateTaxRuleVariables = {
  tenantId: ..., 
  name: ..., 
  rateBp: ..., 
};

// Call the `createTaxRule()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTaxRule(createTaxRuleVars);
// Variables can be defined inline as well.
const { data } = await createTaxRule({ tenantId: ..., name: ..., rateBp: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTaxRule(dataConnect, createTaxRuleVars);

console.log(data.taxRule_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createTaxRule(createTaxRuleVars).then((response) => {
  const data = response.data;
  console.log(data.taxRule_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateTaxRule`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTaxRuleRef, CreateTaxRuleVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateTaxRule` mutation requires an argument of type `CreateTaxRuleVariables`:
const createTaxRuleVars: CreateTaxRuleVariables = {
  tenantId: ..., 
  name: ..., 
  rateBp: ..., 
};

// Call the `createTaxRuleRef()` function to get a reference to the mutation.
const ref = createTaxRuleRef(createTaxRuleVars);
// Variables can be defined inline as well.
const ref = createTaxRuleRef({ tenantId: ..., name: ..., rateBp: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTaxRuleRef(dataConnect, createTaxRuleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.taxRule_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.taxRule_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateTaxRule
You can execute the `UpdateTaxRule` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTaxRule(vars: UpdateTaxRuleVariables): MutationPromise<UpdateTaxRuleData, UpdateTaxRuleVariables>;

interface UpdateTaxRuleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaxRuleVariables): MutationRef<UpdateTaxRuleData, UpdateTaxRuleVariables>;
}
export const updateTaxRuleRef: UpdateTaxRuleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTaxRule(dc: DataConnect, vars: UpdateTaxRuleVariables): MutationPromise<UpdateTaxRuleData, UpdateTaxRuleVariables>;

interface UpdateTaxRuleRef {
  ...
  (dc: DataConnect, vars: UpdateTaxRuleVariables): MutationRef<UpdateTaxRuleData, UpdateTaxRuleVariables>;
}
export const updateTaxRuleRef: UpdateTaxRuleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTaxRuleRef:
```typescript
const name = updateTaxRuleRef.operationName;
console.log(name);
```

### Variables
The `UpdateTaxRule` mutation requires an argument of type `UpdateTaxRuleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTaxRuleVariables {
  tenantId: UUIDString;
  taxRuleId: UUIDString;
  name: string;
  rateBp: number;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateTaxRule` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTaxRuleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTaxRuleData {
  taxRule_update?: TaxRule_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateTaxRule`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTaxRule, UpdateTaxRuleVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateTaxRule` mutation requires an argument of type `UpdateTaxRuleVariables`:
const updateTaxRuleVars: UpdateTaxRuleVariables = {
  tenantId: ..., 
  taxRuleId: ..., 
  name: ..., 
  rateBp: ..., 
  archived: ..., 
};

// Call the `updateTaxRule()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTaxRule(updateTaxRuleVars);
// Variables can be defined inline as well.
const { data } = await updateTaxRule({ tenantId: ..., taxRuleId: ..., name: ..., rateBp: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTaxRule(dataConnect, updateTaxRuleVars);

console.log(data.taxRule_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateTaxRule(updateTaxRuleVars).then((response) => {
  const data = response.data;
  console.log(data.taxRule_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateTaxRule`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTaxRuleRef, UpdateTaxRuleVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateTaxRule` mutation requires an argument of type `UpdateTaxRuleVariables`:
const updateTaxRuleVars: UpdateTaxRuleVariables = {
  tenantId: ..., 
  taxRuleId: ..., 
  name: ..., 
  rateBp: ..., 
  archived: ..., 
};

// Call the `updateTaxRuleRef()` function to get a reference to the mutation.
const ref = updateTaxRuleRef(updateTaxRuleVars);
// Variables can be defined inline as well.
const ref = updateTaxRuleRef({ tenantId: ..., taxRuleId: ..., name: ..., rateBp: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTaxRuleRef(dataConnect, updateTaxRuleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.taxRule_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.taxRule_update);
  console.log(data.auditEvent_insert);
});
```

## CreateCategory
You can execute the `CreateCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCategory(vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface CreateCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
}
export const createCategoryRef: CreateCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCategory(dc: DataConnect, vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface CreateCategoryRef {
  ...
  (dc: DataConnect, vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
}
export const createCategoryRef: CreateCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCategoryRef:
```typescript
const name = createCategoryRef.operationName;
console.log(name);
```

### Variables
The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCategoryVariables {
  tenantId: UUIDString;
  name: string;
  sort: number;
}
```
### Return Type
Recall that executing the `CreateCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCategoryData {
  category_insert: Category_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCategory, CreateCategoryVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`:
const createCategoryVars: CreateCategoryVariables = {
  tenantId: ..., 
  name: ..., 
  sort: ..., 
};

// Call the `createCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCategory(createCategoryVars);
// Variables can be defined inline as well.
const { data } = await createCategory({ tenantId: ..., name: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCategory(dataConnect, createCategoryVars);

console.log(data.category_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createCategory(createCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCategoryRef, CreateCategoryVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`:
const createCategoryVars: CreateCategoryVariables = {
  tenantId: ..., 
  name: ..., 
  sort: ..., 
};

// Call the `createCategoryRef()` function to get a reference to the mutation.
const ref = createCategoryRef(createCategoryVars);
// Variables can be defined inline as well.
const ref = createCategoryRef({ tenantId: ..., name: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCategoryRef(dataConnect, createCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateCategory
You can execute the `UpdateCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateCategory(vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;

interface UpdateCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
}
export const updateCategoryRef: UpdateCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCategory(dc: DataConnect, vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;

interface UpdateCategoryRef {
  ...
  (dc: DataConnect, vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
}
export const updateCategoryRef: UpdateCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCategoryRef:
```typescript
const name = updateCategoryRef.operationName;
console.log(name);
```

### Variables
The `UpdateCategory` mutation requires an argument of type `UpdateCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCategoryVariables {
  tenantId: UUIDString;
  categoryId: UUIDString;
  name: string;
  sort: number;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCategoryData {
  category_update?: Category_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCategory, UpdateCategoryVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateCategory` mutation requires an argument of type `UpdateCategoryVariables`:
const updateCategoryVars: UpdateCategoryVariables = {
  tenantId: ..., 
  categoryId: ..., 
  name: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCategory(updateCategoryVars);
// Variables can be defined inline as well.
const { data } = await updateCategory({ tenantId: ..., categoryId: ..., name: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCategory(dataConnect, updateCategoryVars);

console.log(data.category_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateCategory(updateCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCategoryRef, UpdateCategoryVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateCategory` mutation requires an argument of type `UpdateCategoryVariables`:
const updateCategoryVars: UpdateCategoryVariables = {
  tenantId: ..., 
  categoryId: ..., 
  name: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateCategoryRef()` function to get a reference to the mutation.
const ref = updateCategoryRef(updateCategoryVars);
// Variables can be defined inline as well.
const ref = updateCategoryRef({ tenantId: ..., categoryId: ..., name: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCategoryRef(dataConnect, updateCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_update);
  console.log(data.auditEvent_insert);
});
```

## CreateProduct
You can execute the `CreateProduct` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createProduct(vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface CreateProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
}
export const createProductRef: CreateProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProduct(dc: DataConnect, vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface CreateProductRef {
  ...
  (dc: DataConnect, vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
}
export const createProductRef: CreateProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProductRef:
```typescript
const name = createProductRef.operationName;
console.log(name);
```

### Variables
The `CreateProduct` mutation requires an argument of type `CreateProductVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProductVariables {
  tenantId: UUIDString;
  categoryId: UUIDString;
  taxRuleId?: UUIDString | null;
  name: string;
  description?: string | null;
  allergensDeclared?: string[] | null;
  sort: number;
}
```
### Return Type
Recall that executing the `CreateProduct` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProductData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProductData {
  product_insert: Product_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProduct, CreateProductVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateProduct` mutation requires an argument of type `CreateProductVariables`:
const createProductVars: CreateProductVariables = {
  tenantId: ..., 
  categoryId: ..., 
  taxRuleId: ..., // optional
  name: ..., 
  description: ..., // optional
  allergensDeclared: ..., // optional
  sort: ..., 
};

// Call the `createProduct()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProduct(createProductVars);
// Variables can be defined inline as well.
const { data } = await createProduct({ tenantId: ..., categoryId: ..., taxRuleId: ..., name: ..., description: ..., allergensDeclared: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProduct(dataConnect, createProductVars);

console.log(data.product_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createProduct(createProductVars).then((response) => {
  const data = response.data;
  console.log(data.product_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateProduct`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProductRef, CreateProductVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateProduct` mutation requires an argument of type `CreateProductVariables`:
const createProductVars: CreateProductVariables = {
  tenantId: ..., 
  categoryId: ..., 
  taxRuleId: ..., // optional
  name: ..., 
  description: ..., // optional
  allergensDeclared: ..., // optional
  sort: ..., 
};

// Call the `createProductRef()` function to get a reference to the mutation.
const ref = createProductRef(createProductVars);
// Variables can be defined inline as well.
const ref = createProductRef({ tenantId: ..., categoryId: ..., taxRuleId: ..., name: ..., description: ..., allergensDeclared: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProductRef(dataConnect, createProductVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.product_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.product_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateProduct
You can execute the `UpdateProduct` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProduct(vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;

interface UpdateProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
}
export const updateProductRef: UpdateProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProduct(dc: DataConnect, vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;

interface UpdateProductRef {
  ...
  (dc: DataConnect, vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
}
export const updateProductRef: UpdateProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProductRef:
```typescript
const name = updateProductRef.operationName;
console.log(name);
```

### Variables
The `UpdateProduct` mutation requires an argument of type `UpdateProductVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateProduct` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProductData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProductData {
  product_update?: Product_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProduct, UpdateProductVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateProduct` mutation requires an argument of type `UpdateProductVariables`:
const updateProductVars: UpdateProductVariables = {
  tenantId: ..., 
  productId: ..., 
  categoryId: ..., 
  taxRuleId: ..., // optional
  name: ..., 
  description: ..., // optional
  allergensDeclared: ..., // optional
  sort: ..., 
  archived: ..., 
};

// Call the `updateProduct()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProduct(updateProductVars);
// Variables can be defined inline as well.
const { data } = await updateProduct({ tenantId: ..., productId: ..., categoryId: ..., taxRuleId: ..., name: ..., description: ..., allergensDeclared: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProduct(dataConnect, updateProductVars);

console.log(data.product_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateProduct(updateProductVars).then((response) => {
  const data = response.data;
  console.log(data.product_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateProduct`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProductRef, UpdateProductVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateProduct` mutation requires an argument of type `UpdateProductVariables`:
const updateProductVars: UpdateProductVariables = {
  tenantId: ..., 
  productId: ..., 
  categoryId: ..., 
  taxRuleId: ..., // optional
  name: ..., 
  description: ..., // optional
  allergensDeclared: ..., // optional
  sort: ..., 
  archived: ..., 
};

// Call the `updateProductRef()` function to get a reference to the mutation.
const ref = updateProductRef(updateProductVars);
// Variables can be defined inline as well.
const ref = updateProductRef({ tenantId: ..., productId: ..., categoryId: ..., taxRuleId: ..., name: ..., description: ..., allergensDeclared: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProductRef(dataConnect, updateProductVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.product_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.product_update);
  console.log(data.auditEvent_insert);
});
```

## CreateModifierGroup
You can execute the `CreateModifierGroup` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createModifierGroup(vars: CreateModifierGroupVariables): MutationPromise<CreateModifierGroupData, CreateModifierGroupVariables>;

interface CreateModifierGroupRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateModifierGroupVariables): MutationRef<CreateModifierGroupData, CreateModifierGroupVariables>;
}
export const createModifierGroupRef: CreateModifierGroupRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createModifierGroup(dc: DataConnect, vars: CreateModifierGroupVariables): MutationPromise<CreateModifierGroupData, CreateModifierGroupVariables>;

interface CreateModifierGroupRef {
  ...
  (dc: DataConnect, vars: CreateModifierGroupVariables): MutationRef<CreateModifierGroupData, CreateModifierGroupVariables>;
}
export const createModifierGroupRef: CreateModifierGroupRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createModifierGroupRef:
```typescript
const name = createModifierGroupRef.operationName;
console.log(name);
```

### Variables
The `CreateModifierGroup` mutation requires an argument of type `CreateModifierGroupVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateModifierGroupVariables {
  tenantId: UUIDString;
  productId: UUIDString;
  name: string;
  minSelect: number;
  maxSelect: number;
  sort: number;
}
```
### Return Type
Recall that executing the `CreateModifierGroup` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateModifierGroupData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateModifierGroupData {
  modifierGroup_insert: ModifierGroup_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateModifierGroup`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createModifierGroup, CreateModifierGroupVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateModifierGroup` mutation requires an argument of type `CreateModifierGroupVariables`:
const createModifierGroupVars: CreateModifierGroupVariables = {
  tenantId: ..., 
  productId: ..., 
  name: ..., 
  minSelect: ..., 
  maxSelect: ..., 
  sort: ..., 
};

// Call the `createModifierGroup()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createModifierGroup(createModifierGroupVars);
// Variables can be defined inline as well.
const { data } = await createModifierGroup({ tenantId: ..., productId: ..., name: ..., minSelect: ..., maxSelect: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createModifierGroup(dataConnect, createModifierGroupVars);

console.log(data.modifierGroup_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createModifierGroup(createModifierGroupVars).then((response) => {
  const data = response.data;
  console.log(data.modifierGroup_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateModifierGroup`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createModifierGroupRef, CreateModifierGroupVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateModifierGroup` mutation requires an argument of type `CreateModifierGroupVariables`:
const createModifierGroupVars: CreateModifierGroupVariables = {
  tenantId: ..., 
  productId: ..., 
  name: ..., 
  minSelect: ..., 
  maxSelect: ..., 
  sort: ..., 
};

// Call the `createModifierGroupRef()` function to get a reference to the mutation.
const ref = createModifierGroupRef(createModifierGroupVars);
// Variables can be defined inline as well.
const ref = createModifierGroupRef({ tenantId: ..., productId: ..., name: ..., minSelect: ..., maxSelect: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createModifierGroupRef(dataConnect, createModifierGroupVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.modifierGroup_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.modifierGroup_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateModifierGroup
You can execute the `UpdateModifierGroup` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateModifierGroup(vars: UpdateModifierGroupVariables): MutationPromise<UpdateModifierGroupData, UpdateModifierGroupVariables>;

interface UpdateModifierGroupRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateModifierGroupVariables): MutationRef<UpdateModifierGroupData, UpdateModifierGroupVariables>;
}
export const updateModifierGroupRef: UpdateModifierGroupRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateModifierGroup(dc: DataConnect, vars: UpdateModifierGroupVariables): MutationPromise<UpdateModifierGroupData, UpdateModifierGroupVariables>;

interface UpdateModifierGroupRef {
  ...
  (dc: DataConnect, vars: UpdateModifierGroupVariables): MutationRef<UpdateModifierGroupData, UpdateModifierGroupVariables>;
}
export const updateModifierGroupRef: UpdateModifierGroupRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateModifierGroupRef:
```typescript
const name = updateModifierGroupRef.operationName;
console.log(name);
```

### Variables
The `UpdateModifierGroup` mutation requires an argument of type `UpdateModifierGroupVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateModifierGroupVariables {
  tenantId: UUIDString;
  groupId: UUIDString;
  name: string;
  minSelect: number;
  maxSelect: number;
  sort: number;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateModifierGroup` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateModifierGroupData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateModifierGroupData {
  modifierGroup_update?: ModifierGroup_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateModifierGroup`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateModifierGroup, UpdateModifierGroupVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateModifierGroup` mutation requires an argument of type `UpdateModifierGroupVariables`:
const updateModifierGroupVars: UpdateModifierGroupVariables = {
  tenantId: ..., 
  groupId: ..., 
  name: ..., 
  minSelect: ..., 
  maxSelect: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateModifierGroup()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateModifierGroup(updateModifierGroupVars);
// Variables can be defined inline as well.
const { data } = await updateModifierGroup({ tenantId: ..., groupId: ..., name: ..., minSelect: ..., maxSelect: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateModifierGroup(dataConnect, updateModifierGroupVars);

console.log(data.modifierGroup_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateModifierGroup(updateModifierGroupVars).then((response) => {
  const data = response.data;
  console.log(data.modifierGroup_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateModifierGroup`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateModifierGroupRef, UpdateModifierGroupVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateModifierGroup` mutation requires an argument of type `UpdateModifierGroupVariables`:
const updateModifierGroupVars: UpdateModifierGroupVariables = {
  tenantId: ..., 
  groupId: ..., 
  name: ..., 
  minSelect: ..., 
  maxSelect: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateModifierGroupRef()` function to get a reference to the mutation.
const ref = updateModifierGroupRef(updateModifierGroupVars);
// Variables can be defined inline as well.
const ref = updateModifierGroupRef({ tenantId: ..., groupId: ..., name: ..., minSelect: ..., maxSelect: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateModifierGroupRef(dataConnect, updateModifierGroupVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.modifierGroup_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.modifierGroup_update);
  console.log(data.auditEvent_insert);
});
```

## CreateModifierOption
You can execute the `CreateModifierOption` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createModifierOption(vars: CreateModifierOptionVariables): MutationPromise<CreateModifierOptionData, CreateModifierOptionVariables>;

interface CreateModifierOptionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateModifierOptionVariables): MutationRef<CreateModifierOptionData, CreateModifierOptionVariables>;
}
export const createModifierOptionRef: CreateModifierOptionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createModifierOption(dc: DataConnect, vars: CreateModifierOptionVariables): MutationPromise<CreateModifierOptionData, CreateModifierOptionVariables>;

interface CreateModifierOptionRef {
  ...
  (dc: DataConnect, vars: CreateModifierOptionVariables): MutationRef<CreateModifierOptionData, CreateModifierOptionVariables>;
}
export const createModifierOptionRef: CreateModifierOptionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createModifierOptionRef:
```typescript
const name = createModifierOptionRef.operationName;
console.log(name);
```

### Variables
The `CreateModifierOption` mutation requires an argument of type `CreateModifierOptionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateModifierOptionVariables {
  tenantId: UUIDString;
  groupId: UUIDString;
  name: string;
  priceDeltaMinor: Int64String;
  sort: number;
}
```
### Return Type
Recall that executing the `CreateModifierOption` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateModifierOptionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateModifierOptionData {
  modifierOption_insert: ModifierOption_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateModifierOption`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createModifierOption, CreateModifierOptionVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateModifierOption` mutation requires an argument of type `CreateModifierOptionVariables`:
const createModifierOptionVars: CreateModifierOptionVariables = {
  tenantId: ..., 
  groupId: ..., 
  name: ..., 
  priceDeltaMinor: ..., 
  sort: ..., 
};

// Call the `createModifierOption()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createModifierOption(createModifierOptionVars);
// Variables can be defined inline as well.
const { data } = await createModifierOption({ tenantId: ..., groupId: ..., name: ..., priceDeltaMinor: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createModifierOption(dataConnect, createModifierOptionVars);

console.log(data.modifierOption_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createModifierOption(createModifierOptionVars).then((response) => {
  const data = response.data;
  console.log(data.modifierOption_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateModifierOption`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createModifierOptionRef, CreateModifierOptionVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateModifierOption` mutation requires an argument of type `CreateModifierOptionVariables`:
const createModifierOptionVars: CreateModifierOptionVariables = {
  tenantId: ..., 
  groupId: ..., 
  name: ..., 
  priceDeltaMinor: ..., 
  sort: ..., 
};

// Call the `createModifierOptionRef()` function to get a reference to the mutation.
const ref = createModifierOptionRef(createModifierOptionVars);
// Variables can be defined inline as well.
const ref = createModifierOptionRef({ tenantId: ..., groupId: ..., name: ..., priceDeltaMinor: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createModifierOptionRef(dataConnect, createModifierOptionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.modifierOption_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.modifierOption_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateModifierOption
You can execute the `UpdateModifierOption` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateModifierOption(vars: UpdateModifierOptionVariables): MutationPromise<UpdateModifierOptionData, UpdateModifierOptionVariables>;

interface UpdateModifierOptionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateModifierOptionVariables): MutationRef<UpdateModifierOptionData, UpdateModifierOptionVariables>;
}
export const updateModifierOptionRef: UpdateModifierOptionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateModifierOption(dc: DataConnect, vars: UpdateModifierOptionVariables): MutationPromise<UpdateModifierOptionData, UpdateModifierOptionVariables>;

interface UpdateModifierOptionRef {
  ...
  (dc: DataConnect, vars: UpdateModifierOptionVariables): MutationRef<UpdateModifierOptionData, UpdateModifierOptionVariables>;
}
export const updateModifierOptionRef: UpdateModifierOptionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateModifierOptionRef:
```typescript
const name = updateModifierOptionRef.operationName;
console.log(name);
```

### Variables
The `UpdateModifierOption` mutation requires an argument of type `UpdateModifierOptionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateModifierOptionVariables {
  tenantId: UUIDString;
  optionId: UUIDString;
  name: string;
  priceDeltaMinor: Int64String;
  sort: number;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateModifierOption` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateModifierOptionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateModifierOptionData {
  modifierOption_update?: ModifierOption_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateModifierOption`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateModifierOption, UpdateModifierOptionVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateModifierOption` mutation requires an argument of type `UpdateModifierOptionVariables`:
const updateModifierOptionVars: UpdateModifierOptionVariables = {
  tenantId: ..., 
  optionId: ..., 
  name: ..., 
  priceDeltaMinor: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateModifierOption()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateModifierOption(updateModifierOptionVars);
// Variables can be defined inline as well.
const { data } = await updateModifierOption({ tenantId: ..., optionId: ..., name: ..., priceDeltaMinor: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateModifierOption(dataConnect, updateModifierOptionVars);

console.log(data.modifierOption_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateModifierOption(updateModifierOptionVars).then((response) => {
  const data = response.data;
  console.log(data.modifierOption_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateModifierOption`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateModifierOptionRef, UpdateModifierOptionVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateModifierOption` mutation requires an argument of type `UpdateModifierOptionVariables`:
const updateModifierOptionVars: UpdateModifierOptionVariables = {
  tenantId: ..., 
  optionId: ..., 
  name: ..., 
  priceDeltaMinor: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateModifierOptionRef()` function to get a reference to the mutation.
const ref = updateModifierOptionRef(updateModifierOptionVars);
// Variables can be defined inline as well.
const ref = updateModifierOptionRef({ tenantId: ..., optionId: ..., name: ..., priceDeltaMinor: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateModifierOptionRef(dataConnect, updateModifierOptionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.modifierOption_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.modifierOption_update);
  console.log(data.auditEvent_insert);
});
```

## SetProductAvailability
You can execute the `SetProductAvailability` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setProductAvailability(vars: SetProductAvailabilityVariables): MutationPromise<SetProductAvailabilityData, SetProductAvailabilityVariables>;

interface SetProductAvailabilityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetProductAvailabilityVariables): MutationRef<SetProductAvailabilityData, SetProductAvailabilityVariables>;
}
export const setProductAvailabilityRef: SetProductAvailabilityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setProductAvailability(dc: DataConnect, vars: SetProductAvailabilityVariables): MutationPromise<SetProductAvailabilityData, SetProductAvailabilityVariables>;

interface SetProductAvailabilityRef {
  ...
  (dc: DataConnect, vars: SetProductAvailabilityVariables): MutationRef<SetProductAvailabilityData, SetProductAvailabilityVariables>;
}
export const setProductAvailabilityRef: SetProductAvailabilityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setProductAvailabilityRef:
```typescript
const name = setProductAvailabilityRef.operationName;
console.log(name);
```

### Variables
The `SetProductAvailability` mutation requires an argument of type `SetProductAvailabilityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetProductAvailabilityVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productId: UUIDString;
  available: boolean;
  daysMask?: number | null;
  startMinute?: number | null;
  endMinute?: number | null;
}
```
### Return Type
Recall that executing the `SetProductAvailability` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetProductAvailabilityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetProductAvailabilityData {
  productBranch_upsert: ProductBranch_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `SetProductAvailability`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setProductAvailability, SetProductAvailabilityVariables } from '@tavelyo/dataconnect-sdk';

// The `SetProductAvailability` mutation requires an argument of type `SetProductAvailabilityVariables`:
const setProductAvailabilityVars: SetProductAvailabilityVariables = {
  tenantId: ..., 
  branchId: ..., 
  productId: ..., 
  available: ..., 
  daysMask: ..., // optional
  startMinute: ..., // optional
  endMinute: ..., // optional
};

// Call the `setProductAvailability()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setProductAvailability(setProductAvailabilityVars);
// Variables can be defined inline as well.
const { data } = await setProductAvailability({ tenantId: ..., branchId: ..., productId: ..., available: ..., daysMask: ..., startMinute: ..., endMinute: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setProductAvailability(dataConnect, setProductAvailabilityVars);

console.log(data.productBranch_upsert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
setProductAvailability(setProductAvailabilityVars).then((response) => {
  const data = response.data;
  console.log(data.productBranch_upsert);
  console.log(data.auditEvent_insert);
});
```

### Using `SetProductAvailability`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setProductAvailabilityRef, SetProductAvailabilityVariables } from '@tavelyo/dataconnect-sdk';

// The `SetProductAvailability` mutation requires an argument of type `SetProductAvailabilityVariables`:
const setProductAvailabilityVars: SetProductAvailabilityVariables = {
  tenantId: ..., 
  branchId: ..., 
  productId: ..., 
  available: ..., 
  daysMask: ..., // optional
  startMinute: ..., // optional
  endMinute: ..., // optional
};

// Call the `setProductAvailabilityRef()` function to get a reference to the mutation.
const ref = setProductAvailabilityRef(setProductAvailabilityVars);
// Variables can be defined inline as well.
const ref = setProductAvailabilityRef({ tenantId: ..., branchId: ..., productId: ..., available: ..., daysMask: ..., startMinute: ..., endMinute: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setProductAvailabilityRef(dataConnect, setProductAvailabilityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.productBranch_upsert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.productBranch_upsert);
  console.log(data.auditEvent_insert);
});
```

## ChangePrice
You can execute the `ChangePrice` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
changePrice(vars: ChangePriceVariables): MutationPromise<ChangePriceData, ChangePriceVariables>;

interface ChangePriceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ChangePriceVariables): MutationRef<ChangePriceData, ChangePriceVariables>;
}
export const changePriceRef: ChangePriceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
changePrice(dc: DataConnect, vars: ChangePriceVariables): MutationPromise<ChangePriceData, ChangePriceVariables>;

interface ChangePriceRef {
  ...
  (dc: DataConnect, vars: ChangePriceVariables): MutationRef<ChangePriceData, ChangePriceVariables>;
}
export const changePriceRef: ChangePriceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the changePriceRef:
```typescript
const name = changePriceRef.operationName;
console.log(name);
```

### Variables
The `ChangePrice` mutation requires an argument of type `ChangePriceVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ChangePriceVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productId: UUIDString;
  amountMinor: Int64String;
  currency: string;
}
```
### Return Type
Recall that executing the `ChangePrice` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ChangePriceData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ChangePriceData {
  price_insert: Price_Key;
  productBranch_update?: ProductBranch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ChangePrice`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, changePrice, ChangePriceVariables } from '@tavelyo/dataconnect-sdk';

// The `ChangePrice` mutation requires an argument of type `ChangePriceVariables`:
const changePriceVars: ChangePriceVariables = {
  tenantId: ..., 
  branchId: ..., 
  productId: ..., 
  amountMinor: ..., 
  currency: ..., 
};

// Call the `changePrice()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await changePrice(changePriceVars);
// Variables can be defined inline as well.
const { data } = await changePrice({ tenantId: ..., branchId: ..., productId: ..., amountMinor: ..., currency: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await changePrice(dataConnect, changePriceVars);

console.log(data.price_insert);
console.log(data.productBranch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
changePrice(changePriceVars).then((response) => {
  const data = response.data;
  console.log(data.price_insert);
  console.log(data.productBranch_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ChangePrice`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, changePriceRef, ChangePriceVariables } from '@tavelyo/dataconnect-sdk';

// The `ChangePrice` mutation requires an argument of type `ChangePriceVariables`:
const changePriceVars: ChangePriceVariables = {
  tenantId: ..., 
  branchId: ..., 
  productId: ..., 
  amountMinor: ..., 
  currency: ..., 
};

// Call the `changePriceRef()` function to get a reference to the mutation.
const ref = changePriceRef(changePriceVars);
// Variables can be defined inline as well.
const ref = changePriceRef({ tenantId: ..., branchId: ..., productId: ..., amountMinor: ..., currency: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = changePriceRef(dataConnect, changePriceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.price_insert);
console.log(data.productBranch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.price_insert);
  console.log(data.productBranch_update);
  console.log(data.auditEvent_insert);
});
```

## CreateStation
You can execute the `CreateStation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createStation(vars: CreateStationVariables): MutationPromise<CreateStationData, CreateStationVariables>;

interface CreateStationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateStationVariables): MutationRef<CreateStationData, CreateStationVariables>;
}
export const createStationRef: CreateStationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createStation(dc: DataConnect, vars: CreateStationVariables): MutationPromise<CreateStationData, CreateStationVariables>;

interface CreateStationRef {
  ...
  (dc: DataConnect, vars: CreateStationVariables): MutationRef<CreateStationData, CreateStationVariables>;
}
export const createStationRef: CreateStationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createStationRef:
```typescript
const name = createStationRef.operationName;
console.log(name);
```

### Variables
The `CreateStation` mutation requires an argument of type `CreateStationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  name: string;
  sort: number;
}
```
### Return Type
Recall that executing the `CreateStation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateStationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateStationData {
  station_insert: Station_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateStation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createStation, CreateStationVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateStation` mutation requires an argument of type `CreateStationVariables`:
const createStationVars: CreateStationVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
  sort: ..., 
};

// Call the `createStation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createStation(createStationVars);
// Variables can be defined inline as well.
const { data } = await createStation({ tenantId: ..., branchId: ..., name: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createStation(dataConnect, createStationVars);

console.log(data.station_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createStation(createStationVars).then((response) => {
  const data = response.data;
  console.log(data.station_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateStation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createStationRef, CreateStationVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateStation` mutation requires an argument of type `CreateStationVariables`:
const createStationVars: CreateStationVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
  sort: ..., 
};

// Call the `createStationRef()` function to get a reference to the mutation.
const ref = createStationRef(createStationVars);
// Variables can be defined inline as well.
const ref = createStationRef({ tenantId: ..., branchId: ..., name: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createStationRef(dataConnect, createStationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.station_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.station_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateStation
You can execute the `UpdateStation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateStation(vars: UpdateStationVariables): MutationPromise<UpdateStationData, UpdateStationVariables>;

interface UpdateStationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateStationVariables): MutationRef<UpdateStationData, UpdateStationVariables>;
}
export const updateStationRef: UpdateStationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateStation(dc: DataConnect, vars: UpdateStationVariables): MutationPromise<UpdateStationData, UpdateStationVariables>;

interface UpdateStationRef {
  ...
  (dc: DataConnect, vars: UpdateStationVariables): MutationRef<UpdateStationData, UpdateStationVariables>;
}
export const updateStationRef: UpdateStationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateStationRef:
```typescript
const name = updateStationRef.operationName;
console.log(name);
```

### Variables
The `UpdateStation` mutation requires an argument of type `UpdateStationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  stationId: UUIDString;
  name: string;
  sort: number;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateStation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateStationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateStationData {
  station_update?: Station_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateStation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateStation, UpdateStationVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateStation` mutation requires an argument of type `UpdateStationVariables`:
const updateStationVars: UpdateStationVariables = {
  tenantId: ..., 
  branchId: ..., 
  stationId: ..., 
  name: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateStation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateStation(updateStationVars);
// Variables can be defined inline as well.
const { data } = await updateStation({ tenantId: ..., branchId: ..., stationId: ..., name: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateStation(dataConnect, updateStationVars);

console.log(data.station_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateStation(updateStationVars).then((response) => {
  const data = response.data;
  console.log(data.station_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateStation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateStationRef, UpdateStationVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateStation` mutation requires an argument of type `UpdateStationVariables`:
const updateStationVars: UpdateStationVariables = {
  tenantId: ..., 
  branchId: ..., 
  stationId: ..., 
  name: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateStationRef()` function to get a reference to the mutation.
const ref = updateStationRef(updateStationVars);
// Variables can be defined inline as well.
const ref = updateStationRef({ tenantId: ..., branchId: ..., stationId: ..., name: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateStationRef(dataConnect, updateStationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.station_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.station_update);
  console.log(data.auditEvent_insert);
});
```

## SetProductStation
You can execute the `SetProductStation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setProductStation(vars: SetProductStationVariables): MutationPromise<SetProductStationData, SetProductStationVariables>;

interface SetProductStationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetProductStationVariables): MutationRef<SetProductStationData, SetProductStationVariables>;
}
export const setProductStationRef: SetProductStationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setProductStation(dc: DataConnect, vars: SetProductStationVariables): MutationPromise<SetProductStationData, SetProductStationVariables>;

interface SetProductStationRef {
  ...
  (dc: DataConnect, vars: SetProductStationVariables): MutationRef<SetProductStationData, SetProductStationVariables>;
}
export const setProductStationRef: SetProductStationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setProductStationRef:
```typescript
const name = setProductStationRef.operationName;
console.log(name);
```

### Variables
The `SetProductStation` mutation requires an argument of type `SetProductStationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetProductStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  productId: UUIDString;
  stationId: UUIDString;
}
```
### Return Type
Recall that executing the `SetProductStation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetProductStationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetProductStationData {
  productBranch_update?: ProductBranch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `SetProductStation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setProductStation, SetProductStationVariables } from '@tavelyo/dataconnect-sdk';

// The `SetProductStation` mutation requires an argument of type `SetProductStationVariables`:
const setProductStationVars: SetProductStationVariables = {
  tenantId: ..., 
  branchId: ..., 
  productId: ..., 
  stationId: ..., 
};

// Call the `setProductStation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setProductStation(setProductStationVars);
// Variables can be defined inline as well.
const { data } = await setProductStation({ tenantId: ..., branchId: ..., productId: ..., stationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setProductStation(dataConnect, setProductStationVars);

console.log(data.productBranch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
setProductStation(setProductStationVars).then((response) => {
  const data = response.data;
  console.log(data.productBranch_update);
  console.log(data.auditEvent_insert);
});
```

### Using `SetProductStation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setProductStationRef, SetProductStationVariables } from '@tavelyo/dataconnect-sdk';

// The `SetProductStation` mutation requires an argument of type `SetProductStationVariables`:
const setProductStationVars: SetProductStationVariables = {
  tenantId: ..., 
  branchId: ..., 
  productId: ..., 
  stationId: ..., 
};

// Call the `setProductStationRef()` function to get a reference to the mutation.
const ref = setProductStationRef(setProductStationVars);
// Variables can be defined inline as well.
const ref = setProductStationRef({ tenantId: ..., branchId: ..., productId: ..., stationId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setProductStationRef(dataConnect, setProductStationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.productBranch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.productBranch_update);
  console.log(data.auditEvent_insert);
});
```

## StartOrderItem
You can execute the `StartOrderItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
startOrderItem(vars: StartOrderItemVariables): MutationPromise<StartOrderItemData, StartOrderItemVariables>;

interface StartOrderItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: StartOrderItemVariables): MutationRef<StartOrderItemData, StartOrderItemVariables>;
}
export const startOrderItemRef: StartOrderItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
startOrderItem(dc: DataConnect, vars: StartOrderItemVariables): MutationPromise<StartOrderItemData, StartOrderItemVariables>;

interface StartOrderItemRef {
  ...
  (dc: DataConnect, vars: StartOrderItemVariables): MutationRef<StartOrderItemData, StartOrderItemVariables>;
}
export const startOrderItemRef: StartOrderItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the startOrderItemRef:
```typescript
const name = startOrderItemRef.operationName;
console.log(name);
```

### Variables
The `StartOrderItem` mutation requires an argument of type `StartOrderItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface StartOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}
```
### Return Type
Recall that executing the `StartOrderItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `StartOrderItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface StartOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `StartOrderItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, startOrderItem, StartOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `StartOrderItem` mutation requires an argument of type `StartOrderItemVariables`:
const startOrderItemVars: StartOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `startOrderItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await startOrderItem(startOrderItemVars);
// Variables can be defined inline as well.
const { data } = await startOrderItem({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await startOrderItem(dataConnect, startOrderItemVars);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
startOrderItem(startOrderItemVars).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `StartOrderItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, startOrderItemRef, StartOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `StartOrderItem` mutation requires an argument of type `StartOrderItemVariables`:
const startOrderItemVars: StartOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `startOrderItemRef()` function to get a reference to the mutation.
const ref = startOrderItemRef(startOrderItemVars);
// Variables can be defined inline as well.
const ref = startOrderItemRef({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = startOrderItemRef(dataConnect, startOrderItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

## FinishOrderItem
You can execute the `FinishOrderItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
finishOrderItem(vars: FinishOrderItemVariables): MutationPromise<FinishOrderItemData, FinishOrderItemVariables>;

interface FinishOrderItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: FinishOrderItemVariables): MutationRef<FinishOrderItemData, FinishOrderItemVariables>;
}
export const finishOrderItemRef: FinishOrderItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
finishOrderItem(dc: DataConnect, vars: FinishOrderItemVariables): MutationPromise<FinishOrderItemData, FinishOrderItemVariables>;

interface FinishOrderItemRef {
  ...
  (dc: DataConnect, vars: FinishOrderItemVariables): MutationRef<FinishOrderItemData, FinishOrderItemVariables>;
}
export const finishOrderItemRef: FinishOrderItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the finishOrderItemRef:
```typescript
const name = finishOrderItemRef.operationName;
console.log(name);
```

### Variables
The `FinishOrderItem` mutation requires an argument of type `FinishOrderItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface FinishOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}
```
### Return Type
Recall that executing the `FinishOrderItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `FinishOrderItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface FinishOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `FinishOrderItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, finishOrderItem, FinishOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `FinishOrderItem` mutation requires an argument of type `FinishOrderItemVariables`:
const finishOrderItemVars: FinishOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `finishOrderItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await finishOrderItem(finishOrderItemVars);
// Variables can be defined inline as well.
const { data } = await finishOrderItem({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await finishOrderItem(dataConnect, finishOrderItemVars);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
finishOrderItem(finishOrderItemVars).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `FinishOrderItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, finishOrderItemRef, FinishOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `FinishOrderItem` mutation requires an argument of type `FinishOrderItemVariables`:
const finishOrderItemVars: FinishOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `finishOrderItemRef()` function to get a reference to the mutation.
const ref = finishOrderItemRef(finishOrderItemVars);
// Variables can be defined inline as well.
const ref = finishOrderItemRef({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = finishOrderItemRef(dataConnect, finishOrderItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

## AddTableGuest
You can execute the `AddTableGuest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addTableGuest(vars: AddTableGuestVariables): MutationPromise<AddTableGuestData, AddTableGuestVariables>;

interface AddTableGuestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddTableGuestVariables): MutationRef<AddTableGuestData, AddTableGuestVariables>;
}
export const addTableGuestRef: AddTableGuestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addTableGuest(dc: DataConnect, vars: AddTableGuestVariables): MutationPromise<AddTableGuestData, AddTableGuestVariables>;

interface AddTableGuestRef {
  ...
  (dc: DataConnect, vars: AddTableGuestVariables): MutationRef<AddTableGuestData, AddTableGuestVariables>;
}
export const addTableGuestRef: AddTableGuestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addTableGuestRef:
```typescript
const name = addTableGuestRef.operationName;
console.log(name);
```

### Variables
The `AddTableGuest` mutation requires an argument of type `AddTableGuestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddTableGuestVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  number: number;
}
```
### Return Type
Recall that executing the `AddTableGuest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddTableGuestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddTableGuestData {
  locked: number;
  sessionParticipant_insert: SessionParticipant_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `AddTableGuest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addTableGuest, AddTableGuestVariables } from '@tavelyo/dataconnect-sdk';

// The `AddTableGuest` mutation requires an argument of type `AddTableGuestVariables`:
const addTableGuestVars: AddTableGuestVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  number: ..., 
};

// Call the `addTableGuest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addTableGuest(addTableGuestVars);
// Variables can be defined inline as well.
const { data } = await addTableGuest({ tenantId: ..., branchId: ..., sessionId: ..., number: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addTableGuest(dataConnect, addTableGuestVars);

console.log(data.locked);
console.log(data.sessionParticipant_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
addTableGuest(addTableGuestVars).then((response) => {
  const data = response.data;
  console.log(data.locked);
  console.log(data.sessionParticipant_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `AddTableGuest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addTableGuestRef, AddTableGuestVariables } from '@tavelyo/dataconnect-sdk';

// The `AddTableGuest` mutation requires an argument of type `AddTableGuestVariables`:
const addTableGuestVars: AddTableGuestVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  number: ..., 
};

// Call the `addTableGuestRef()` function to get a reference to the mutation.
const ref = addTableGuestRef(addTableGuestVars);
// Variables can be defined inline as well.
const ref = addTableGuestRef({ tenantId: ..., branchId: ..., sessionId: ..., number: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addTableGuestRef(dataConnect, addTableGuestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.locked);
console.log(data.sessionParticipant_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.locked);
  console.log(data.sessionParticipant_insert);
  console.log(data.auditEvent_insert);
});
```

## ServerSendStaffOrder
You can execute the `ServerSendStaffOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverSendStaffOrder(vars: ServerSendStaffOrderVariables): MutationPromise<ServerSendStaffOrderData, ServerSendStaffOrderVariables>;

interface ServerSendStaffOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSendStaffOrderVariables): MutationRef<ServerSendStaffOrderData, ServerSendStaffOrderVariables>;
}
export const serverSendStaffOrderRef: ServerSendStaffOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverSendStaffOrder(dc: DataConnect, vars: ServerSendStaffOrderVariables): MutationPromise<ServerSendStaffOrderData, ServerSendStaffOrderVariables>;

interface ServerSendStaffOrderRef {
  ...
  (dc: DataConnect, vars: ServerSendStaffOrderVariables): MutationRef<ServerSendStaffOrderData, ServerSendStaffOrderVariables>;
}
export const serverSendStaffOrderRef: ServerSendStaffOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverSendStaffOrderRef:
```typescript
const name = serverSendStaffOrderRef.operationName;
console.log(name);
```

### Variables
The `ServerSendStaffOrder` mutation requires an argument of type `ServerSendStaffOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerSendStaffOrderVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerSendStaffOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerSendStaffOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerSendStaffOrderData {
  locked: number;
  sent: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerSendStaffOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverSendStaffOrder, ServerSendStaffOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSendStaffOrder` mutation requires an argument of type `ServerSendStaffOrderVariables`:
const serverSendStaffOrderVars: ServerSendStaffOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  authUid: ..., 
};

// Call the `serverSendStaffOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverSendStaffOrder(serverSendStaffOrderVars);
// Variables can be defined inline as well.
const { data } = await serverSendStaffOrder({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverSendStaffOrder(dataConnect, serverSendStaffOrderVars);

console.log(data.locked);
console.log(data.sent);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverSendStaffOrder(serverSendStaffOrderVars).then((response) => {
  const data = response.data;
  console.log(data.locked);
  console.log(data.sent);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerSendStaffOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverSendStaffOrderRef, ServerSendStaffOrderVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSendStaffOrder` mutation requires an argument of type `ServerSendStaffOrderVariables`:
const serverSendStaffOrderVars: ServerSendStaffOrderVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  authUid: ..., 
};

// Call the `serverSendStaffOrderRef()` function to get a reference to the mutation.
const ref = serverSendStaffOrderRef(serverSendStaffOrderVars);
// Variables can be defined inline as well.
const ref = serverSendStaffOrderRef({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverSendStaffOrderRef(dataConnect, serverSendStaffOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.locked);
console.log(data.sent);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.locked);
  console.log(data.sent);
  console.log(data.auditEvent_insert);
});
```

## CreateSector
You can execute the `CreateSector` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createSector(vars: CreateSectorVariables): MutationPromise<CreateSectorData, CreateSectorVariables>;

interface CreateSectorRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSectorVariables): MutationRef<CreateSectorData, CreateSectorVariables>;
}
export const createSectorRef: CreateSectorRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSector(dc: DataConnect, vars: CreateSectorVariables): MutationPromise<CreateSectorData, CreateSectorVariables>;

interface CreateSectorRef {
  ...
  (dc: DataConnect, vars: CreateSectorVariables): MutationRef<CreateSectorData, CreateSectorVariables>;
}
export const createSectorRef: CreateSectorRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSectorRef:
```typescript
const name = createSectorRef.operationName;
console.log(name);
```

### Variables
The `CreateSector` mutation requires an argument of type `CreateSectorVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSectorVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  name: string;
  sort: number;
}
```
### Return Type
Recall that executing the `CreateSector` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSectorData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSectorData {
  sector_insert: Sector_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateSector`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSector, CreateSectorVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateSector` mutation requires an argument of type `CreateSectorVariables`:
const createSectorVars: CreateSectorVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
  sort: ..., 
};

// Call the `createSector()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSector(createSectorVars);
// Variables can be defined inline as well.
const { data } = await createSector({ tenantId: ..., branchId: ..., name: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSector(dataConnect, createSectorVars);

console.log(data.sector_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createSector(createSectorVars).then((response) => {
  const data = response.data;
  console.log(data.sector_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateSector`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSectorRef, CreateSectorVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateSector` mutation requires an argument of type `CreateSectorVariables`:
const createSectorVars: CreateSectorVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
  sort: ..., 
};

// Call the `createSectorRef()` function to get a reference to the mutation.
const ref = createSectorRef(createSectorVars);
// Variables can be defined inline as well.
const ref = createSectorRef({ tenantId: ..., branchId: ..., name: ..., sort: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSectorRef(dataConnect, createSectorVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sector_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sector_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateSector
You can execute the `UpdateSector` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateSector(vars: UpdateSectorVariables): MutationPromise<UpdateSectorData, UpdateSectorVariables>;

interface UpdateSectorRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSectorVariables): MutationRef<UpdateSectorData, UpdateSectorVariables>;
}
export const updateSectorRef: UpdateSectorRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSector(dc: DataConnect, vars: UpdateSectorVariables): MutationPromise<UpdateSectorData, UpdateSectorVariables>;

interface UpdateSectorRef {
  ...
  (dc: DataConnect, vars: UpdateSectorVariables): MutationRef<UpdateSectorData, UpdateSectorVariables>;
}
export const updateSectorRef: UpdateSectorRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSectorRef:
```typescript
const name = updateSectorRef.operationName;
console.log(name);
```

### Variables
The `UpdateSector` mutation requires an argument of type `UpdateSectorVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSectorVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sectorId: UUIDString;
  name: string;
  sort: number;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateSector` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSectorData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSectorData {
  sector_update?: Sector_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateSector`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSector, UpdateSectorVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateSector` mutation requires an argument of type `UpdateSectorVariables`:
const updateSectorVars: UpdateSectorVariables = {
  tenantId: ..., 
  branchId: ..., 
  sectorId: ..., 
  name: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateSector()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSector(updateSectorVars);
// Variables can be defined inline as well.
const { data } = await updateSector({ tenantId: ..., branchId: ..., sectorId: ..., name: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSector(dataConnect, updateSectorVars);

console.log(data.sector_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateSector(updateSectorVars).then((response) => {
  const data = response.data;
  console.log(data.sector_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateSector`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSectorRef, UpdateSectorVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateSector` mutation requires an argument of type `UpdateSectorVariables`:
const updateSectorVars: UpdateSectorVariables = {
  tenantId: ..., 
  branchId: ..., 
  sectorId: ..., 
  name: ..., 
  sort: ..., 
  archived: ..., 
};

// Call the `updateSectorRef()` function to get a reference to the mutation.
const ref = updateSectorRef(updateSectorVars);
// Variables can be defined inline as well.
const ref = updateSectorRef({ tenantId: ..., branchId: ..., sectorId: ..., name: ..., sort: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSectorRef(dataConnect, updateSectorVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sector_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sector_update);
  console.log(data.auditEvent_insert);
});
```

## CreateTable
You can execute the `CreateTable` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTable(vars: CreateTableVariables): MutationPromise<CreateTableData, CreateTableVariables>;

interface CreateTableRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTableVariables): MutationRef<CreateTableData, CreateTableVariables>;
}
export const createTableRef: CreateTableRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTable(dc: DataConnect, vars: CreateTableVariables): MutationPromise<CreateTableData, CreateTableVariables>;

interface CreateTableRef {
  ...
  (dc: DataConnect, vars: CreateTableVariables): MutationRef<CreateTableData, CreateTableVariables>;
}
export const createTableRef: CreateTableRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTableRef:
```typescript
const name = createTableRef.operationName;
console.log(name);
```

### Variables
The `CreateTable` mutation requires an argument of type `CreateTableVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTableVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sectorId: UUIDString;
  code: string;
  seats: number;
}
```
### Return Type
Recall that executing the `CreateTable` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTableData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTableData {
  diningTable_insert: DiningTable_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateTable`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTable, CreateTableVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateTable` mutation requires an argument of type `CreateTableVariables`:
const createTableVars: CreateTableVariables = {
  tenantId: ..., 
  branchId: ..., 
  sectorId: ..., 
  code: ..., 
  seats: ..., 
};

// Call the `createTable()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTable(createTableVars);
// Variables can be defined inline as well.
const { data } = await createTable({ tenantId: ..., branchId: ..., sectorId: ..., code: ..., seats: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTable(dataConnect, createTableVars);

console.log(data.diningTable_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createTable(createTableVars).then((response) => {
  const data = response.data;
  console.log(data.diningTable_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateTable`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTableRef, CreateTableVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateTable` mutation requires an argument of type `CreateTableVariables`:
const createTableVars: CreateTableVariables = {
  tenantId: ..., 
  branchId: ..., 
  sectorId: ..., 
  code: ..., 
  seats: ..., 
};

// Call the `createTableRef()` function to get a reference to the mutation.
const ref = createTableRef(createTableVars);
// Variables can be defined inline as well.
const ref = createTableRef({ tenantId: ..., branchId: ..., sectorId: ..., code: ..., seats: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTableRef(dataConnect, createTableVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.diningTable_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.diningTable_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateTable
You can execute the `UpdateTable` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTable(vars: UpdateTableVariables): MutationPromise<UpdateTableData, UpdateTableVariables>;

interface UpdateTableRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTableVariables): MutationRef<UpdateTableData, UpdateTableVariables>;
}
export const updateTableRef: UpdateTableRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTable(dc: DataConnect, vars: UpdateTableVariables): MutationPromise<UpdateTableData, UpdateTableVariables>;

interface UpdateTableRef {
  ...
  (dc: DataConnect, vars: UpdateTableVariables): MutationRef<UpdateTableData, UpdateTableVariables>;
}
export const updateTableRef: UpdateTableRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTableRef:
```typescript
const name = updateTableRef.operationName;
console.log(name);
```

### Variables
The `UpdateTable` mutation requires an argument of type `UpdateTableVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTableVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  tableId: UUIDString;
  sectorId: UUIDString;
  code: string;
  seats: number;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateTable` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTableData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTableData {
  diningTable_update?: DiningTable_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateTable`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTable, UpdateTableVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateTable` mutation requires an argument of type `UpdateTableVariables`:
const updateTableVars: UpdateTableVariables = {
  tenantId: ..., 
  branchId: ..., 
  tableId: ..., 
  sectorId: ..., 
  code: ..., 
  seats: ..., 
  archived: ..., 
};

// Call the `updateTable()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTable(updateTableVars);
// Variables can be defined inline as well.
const { data } = await updateTable({ tenantId: ..., branchId: ..., tableId: ..., sectorId: ..., code: ..., seats: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTable(dataConnect, updateTableVars);

console.log(data.diningTable_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateTable(updateTableVars).then((response) => {
  const data = response.data;
  console.log(data.diningTable_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateTable`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTableRef, UpdateTableVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateTable` mutation requires an argument of type `UpdateTableVariables`:
const updateTableVars: UpdateTableVariables = {
  tenantId: ..., 
  branchId: ..., 
  tableId: ..., 
  sectorId: ..., 
  code: ..., 
  seats: ..., 
  archived: ..., 
};

// Call the `updateTableRef()` function to get a reference to the mutation.
const ref = updateTableRef(updateTableVars);
// Variables can be defined inline as well.
const ref = updateTableRef({ tenantId: ..., branchId: ..., tableId: ..., sectorId: ..., code: ..., seats: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTableRef(dataConnect, updateTableVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.diningTable_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.diningTable_update);
  console.log(data.auditEvent_insert);
});
```

## RotateTableQr
You can execute the `RotateTableQr` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
rotateTableQr(vars: RotateTableQrVariables): MutationPromise<RotateTableQrData, RotateTableQrVariables>;

interface RotateTableQrRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RotateTableQrVariables): MutationRef<RotateTableQrData, RotateTableQrVariables>;
}
export const rotateTableQrRef: RotateTableQrRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
rotateTableQr(dc: DataConnect, vars: RotateTableQrVariables): MutationPromise<RotateTableQrData, RotateTableQrVariables>;

interface RotateTableQrRef {
  ...
  (dc: DataConnect, vars: RotateTableQrVariables): MutationRef<RotateTableQrData, RotateTableQrVariables>;
}
export const rotateTableQrRef: RotateTableQrRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the rotateTableQrRef:
```typescript
const name = rotateTableQrRef.operationName;
console.log(name);
```

### Variables
The `RotateTableQr` mutation requires an argument of type `RotateTableQrVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RotateTableQrVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  tableId: UUIDString;
}
```
### Return Type
Recall that executing the `RotateTableQr` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RotateTableQrData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RotateTableQrData {
  diningTable_update?: DiningTable_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `RotateTableQr`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, rotateTableQr, RotateTableQrVariables } from '@tavelyo/dataconnect-sdk';

// The `RotateTableQr` mutation requires an argument of type `RotateTableQrVariables`:
const rotateTableQrVars: RotateTableQrVariables = {
  tenantId: ..., 
  branchId: ..., 
  tableId: ..., 
};

// Call the `rotateTableQr()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await rotateTableQr(rotateTableQrVars);
// Variables can be defined inline as well.
const { data } = await rotateTableQr({ tenantId: ..., branchId: ..., tableId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await rotateTableQr(dataConnect, rotateTableQrVars);

console.log(data.diningTable_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
rotateTableQr(rotateTableQrVars).then((response) => {
  const data = response.data;
  console.log(data.diningTable_update);
  console.log(data.auditEvent_insert);
});
```

### Using `RotateTableQr`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, rotateTableQrRef, RotateTableQrVariables } from '@tavelyo/dataconnect-sdk';

// The `RotateTableQr` mutation requires an argument of type `RotateTableQrVariables`:
const rotateTableQrVars: RotateTableQrVariables = {
  tenantId: ..., 
  branchId: ..., 
  tableId: ..., 
};

// Call the `rotateTableQrRef()` function to get a reference to the mutation.
const ref = rotateTableQrRef(rotateTableQrVars);
// Variables can be defined inline as well.
const ref = rotateTableQrRef({ tenantId: ..., branchId: ..., tableId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = rotateTableQrRef(dataConnect, rotateTableQrVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.diningTable_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.diningTable_update);
  console.log(data.auditEvent_insert);
});
```

## UpsertMyProfile
You can execute the `UpsertMyProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertMyProfile(vars: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;

interface UpsertMyProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
}
export const upsertMyProfileRef: UpsertMyProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertMyProfile(dc: DataConnect, vars: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;

interface UpsertMyProfileRef {
  ...
  (dc: DataConnect, vars: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
}
export const upsertMyProfileRef: UpsertMyProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertMyProfileRef:
```typescript
const name = upsertMyProfileRef.operationName;
console.log(name);
```

### Variables
The `UpsertMyProfile` mutation requires an argument of type `UpsertMyProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertMyProfileVariables {
  displayName: string;
}
```
### Return Type
Recall that executing the `UpsertMyProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertMyProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertMyProfileData {
  userProfile_upsert: UserProfile_Key;
}
```
### Using `UpsertMyProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertMyProfile, UpsertMyProfileVariables } from '@tavelyo/dataconnect-sdk';

// The `UpsertMyProfile` mutation requires an argument of type `UpsertMyProfileVariables`:
const upsertMyProfileVars: UpsertMyProfileVariables = {
  displayName: ..., 
};

// Call the `upsertMyProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertMyProfile(upsertMyProfileVars);
// Variables can be defined inline as well.
const { data } = await upsertMyProfile({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertMyProfile(dataConnect, upsertMyProfileVars);

console.log(data.userProfile_upsert);

// Or, you can use the `Promise` API.
upsertMyProfile(upsertMyProfileVars).then((response) => {
  const data = response.data;
  console.log(data.userProfile_upsert);
});
```

### Using `UpsertMyProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertMyProfileRef, UpsertMyProfileVariables } from '@tavelyo/dataconnect-sdk';

// The `UpsertMyProfile` mutation requires an argument of type `UpsertMyProfileVariables`:
const upsertMyProfileVars: UpsertMyProfileVariables = {
  displayName: ..., 
};

// Call the `upsertMyProfileRef()` function to get a reference to the mutation.
const ref = upsertMyProfileRef(upsertMyProfileVars);
// Variables can be defined inline as well.
const ref = upsertMyProfileRef({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertMyProfileRef(dataConnect, upsertMyProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProfile_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfile_upsert);
});
```

## AddMember
You can execute the `AddMember` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addMember(vars: AddMemberVariables): MutationPromise<AddMemberData, AddMemberVariables>;

interface AddMemberRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddMemberVariables): MutationRef<AddMemberData, AddMemberVariables>;
}
export const addMemberRef: AddMemberRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addMember(dc: DataConnect, vars: AddMemberVariables): MutationPromise<AddMemberData, AddMemberVariables>;

interface AddMemberRef {
  ...
  (dc: DataConnect, vars: AddMemberVariables): MutationRef<AddMemberData, AddMemberVariables>;
}
export const addMemberRef: AddMemberRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addMemberRef:
```typescript
const name = addMemberRef.operationName;
console.log(name);
```

### Variables
The `AddMember` mutation requires an argument of type `AddMemberVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddMemberVariables {
  tenantId: UUIDString;
  userId: string;
  roleCode: string;
}
```
### Return Type
Recall that executing the `AddMember` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddMemberData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddMemberData {
  membership_insert: Membership_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `AddMember`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addMember, AddMemberVariables } from '@tavelyo/dataconnect-sdk';

// The `AddMember` mutation requires an argument of type `AddMemberVariables`:
const addMemberVars: AddMemberVariables = {
  tenantId: ..., 
  userId: ..., 
  roleCode: ..., 
};

// Call the `addMember()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addMember(addMemberVars);
// Variables can be defined inline as well.
const { data } = await addMember({ tenantId: ..., userId: ..., roleCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addMember(dataConnect, addMemberVars);

console.log(data.membership_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
addMember(addMemberVars).then((response) => {
  const data = response.data;
  console.log(data.membership_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `AddMember`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addMemberRef, AddMemberVariables } from '@tavelyo/dataconnect-sdk';

// The `AddMember` mutation requires an argument of type `AddMemberVariables`:
const addMemberVars: AddMemberVariables = {
  tenantId: ..., 
  userId: ..., 
  roleCode: ..., 
};

// Call the `addMemberRef()` function to get a reference to the mutation.
const ref = addMemberRef(addMemberVars);
// Variables can be defined inline as well.
const ref = addMemberRef({ tenantId: ..., userId: ..., roleCode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addMemberRef(dataConnect, addMemberVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.membership_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.membership_insert);
  console.log(data.auditEvent_insert);
});
```

## ChangeMemberRole
You can execute the `ChangeMemberRole` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
changeMemberRole(vars: ChangeMemberRoleVariables): MutationPromise<ChangeMemberRoleData, ChangeMemberRoleVariables>;

interface ChangeMemberRoleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ChangeMemberRoleVariables): MutationRef<ChangeMemberRoleData, ChangeMemberRoleVariables>;
}
export const changeMemberRoleRef: ChangeMemberRoleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
changeMemberRole(dc: DataConnect, vars: ChangeMemberRoleVariables): MutationPromise<ChangeMemberRoleData, ChangeMemberRoleVariables>;

interface ChangeMemberRoleRef {
  ...
  (dc: DataConnect, vars: ChangeMemberRoleVariables): MutationRef<ChangeMemberRoleData, ChangeMemberRoleVariables>;
}
export const changeMemberRoleRef: ChangeMemberRoleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the changeMemberRoleRef:
```typescript
const name = changeMemberRoleRef.operationName;
console.log(name);
```

### Variables
The `ChangeMemberRole` mutation requires an argument of type `ChangeMemberRoleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ChangeMemberRoleVariables {
  tenantId: UUIDString;
  userId: string;
  roleCode: string;
}
```
### Return Type
Recall that executing the `ChangeMemberRole` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ChangeMemberRoleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ChangeMemberRoleData {
  membership_update?: Membership_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ChangeMemberRole`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, changeMemberRole, ChangeMemberRoleVariables } from '@tavelyo/dataconnect-sdk';

// The `ChangeMemberRole` mutation requires an argument of type `ChangeMemberRoleVariables`:
const changeMemberRoleVars: ChangeMemberRoleVariables = {
  tenantId: ..., 
  userId: ..., 
  roleCode: ..., 
};

// Call the `changeMemberRole()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await changeMemberRole(changeMemberRoleVars);
// Variables can be defined inline as well.
const { data } = await changeMemberRole({ tenantId: ..., userId: ..., roleCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await changeMemberRole(dataConnect, changeMemberRoleVars);

console.log(data.membership_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
changeMemberRole(changeMemberRoleVars).then((response) => {
  const data = response.data;
  console.log(data.membership_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ChangeMemberRole`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, changeMemberRoleRef, ChangeMemberRoleVariables } from '@tavelyo/dataconnect-sdk';

// The `ChangeMemberRole` mutation requires an argument of type `ChangeMemberRoleVariables`:
const changeMemberRoleVars: ChangeMemberRoleVariables = {
  tenantId: ..., 
  userId: ..., 
  roleCode: ..., 
};

// Call the `changeMemberRoleRef()` function to get a reference to the mutation.
const ref = changeMemberRoleRef(changeMemberRoleVars);
// Variables can be defined inline as well.
const ref = changeMemberRoleRef({ tenantId: ..., userId: ..., roleCode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = changeMemberRoleRef(dataConnect, changeMemberRoleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.membership_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.membership_update);
  console.log(data.auditEvent_insert);
});
```

## RevokeMember
You can execute the `RevokeMember` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
revokeMember(vars: RevokeMemberVariables): MutationPromise<RevokeMemberData, RevokeMemberVariables>;

interface RevokeMemberRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RevokeMemberVariables): MutationRef<RevokeMemberData, RevokeMemberVariables>;
}
export const revokeMemberRef: RevokeMemberRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
revokeMember(dc: DataConnect, vars: RevokeMemberVariables): MutationPromise<RevokeMemberData, RevokeMemberVariables>;

interface RevokeMemberRef {
  ...
  (dc: DataConnect, vars: RevokeMemberVariables): MutationRef<RevokeMemberData, RevokeMemberVariables>;
}
export const revokeMemberRef: RevokeMemberRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the revokeMemberRef:
```typescript
const name = revokeMemberRef.operationName;
console.log(name);
```

### Variables
The `RevokeMember` mutation requires an argument of type `RevokeMemberVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RevokeMemberVariables {
  tenantId: UUIDString;
  userId: string;
  reason?: string | null;
}
```
### Return Type
Recall that executing the `RevokeMember` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RevokeMemberData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RevokeMemberData {
  membership_update?: Membership_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `RevokeMember`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, revokeMember, RevokeMemberVariables } from '@tavelyo/dataconnect-sdk';

// The `RevokeMember` mutation requires an argument of type `RevokeMemberVariables`:
const revokeMemberVars: RevokeMemberVariables = {
  tenantId: ..., 
  userId: ..., 
  reason: ..., // optional
};

// Call the `revokeMember()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await revokeMember(revokeMemberVars);
// Variables can be defined inline as well.
const { data } = await revokeMember({ tenantId: ..., userId: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await revokeMember(dataConnect, revokeMemberVars);

console.log(data.membership_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
revokeMember(revokeMemberVars).then((response) => {
  const data = response.data;
  console.log(data.membership_update);
  console.log(data.auditEvent_insert);
});
```

### Using `RevokeMember`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, revokeMemberRef, RevokeMemberVariables } from '@tavelyo/dataconnect-sdk';

// The `RevokeMember` mutation requires an argument of type `RevokeMemberVariables`:
const revokeMemberVars: RevokeMemberVariables = {
  tenantId: ..., 
  userId: ..., 
  reason: ..., // optional
};

// Call the `revokeMemberRef()` function to get a reference to the mutation.
const ref = revokeMemberRef(revokeMemberVars);
// Variables can be defined inline as well.
const ref = revokeMemberRef({ tenantId: ..., userId: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = revokeMemberRef(dataConnect, revokeMemberVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.membership_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.membership_update);
  console.log(data.auditEvent_insert);
});
```

## AssignMemberBranch
You can execute the `AssignMemberBranch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
assignMemberBranch(vars: AssignMemberBranchVariables): MutationPromise<AssignMemberBranchData, AssignMemberBranchVariables>;

interface AssignMemberBranchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignMemberBranchVariables): MutationRef<AssignMemberBranchData, AssignMemberBranchVariables>;
}
export const assignMemberBranchRef: AssignMemberBranchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
assignMemberBranch(dc: DataConnect, vars: AssignMemberBranchVariables): MutationPromise<AssignMemberBranchData, AssignMemberBranchVariables>;

interface AssignMemberBranchRef {
  ...
  (dc: DataConnect, vars: AssignMemberBranchVariables): MutationRef<AssignMemberBranchData, AssignMemberBranchVariables>;
}
export const assignMemberBranchRef: AssignMemberBranchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the assignMemberBranchRef:
```typescript
const name = assignMemberBranchRef.operationName;
console.log(name);
```

### Variables
The `AssignMemberBranch` mutation requires an argument of type `AssignMemberBranchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AssignMemberBranchVariables {
  tenantId: UUIDString;
  userId: string;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `AssignMemberBranch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AssignMemberBranchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AssignMemberBranchData {
  membershipBranch_insert: MembershipBranch_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `AssignMemberBranch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, assignMemberBranch, AssignMemberBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `AssignMemberBranch` mutation requires an argument of type `AssignMemberBranchVariables`:
const assignMemberBranchVars: AssignMemberBranchVariables = {
  tenantId: ..., 
  userId: ..., 
  branchId: ..., 
};

// Call the `assignMemberBranch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await assignMemberBranch(assignMemberBranchVars);
// Variables can be defined inline as well.
const { data } = await assignMemberBranch({ tenantId: ..., userId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await assignMemberBranch(dataConnect, assignMemberBranchVars);

console.log(data.membershipBranch_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
assignMemberBranch(assignMemberBranchVars).then((response) => {
  const data = response.data;
  console.log(data.membershipBranch_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `AssignMemberBranch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, assignMemberBranchRef, AssignMemberBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `AssignMemberBranch` mutation requires an argument of type `AssignMemberBranchVariables`:
const assignMemberBranchVars: AssignMemberBranchVariables = {
  tenantId: ..., 
  userId: ..., 
  branchId: ..., 
};

// Call the `assignMemberBranchRef()` function to get a reference to the mutation.
const ref = assignMemberBranchRef(assignMemberBranchVars);
// Variables can be defined inline as well.
const ref = assignMemberBranchRef({ tenantId: ..., userId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = assignMemberBranchRef(dataConnect, assignMemberBranchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.membershipBranch_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.membershipBranch_insert);
  console.log(data.auditEvent_insert);
});
```

## UnassignMemberBranch
You can execute the `UnassignMemberBranch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
unassignMemberBranch(vars: UnassignMemberBranchVariables): MutationPromise<UnassignMemberBranchData, UnassignMemberBranchVariables>;

interface UnassignMemberBranchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UnassignMemberBranchVariables): MutationRef<UnassignMemberBranchData, UnassignMemberBranchVariables>;
}
export const unassignMemberBranchRef: UnassignMemberBranchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
unassignMemberBranch(dc: DataConnect, vars: UnassignMemberBranchVariables): MutationPromise<UnassignMemberBranchData, UnassignMemberBranchVariables>;

interface UnassignMemberBranchRef {
  ...
  (dc: DataConnect, vars: UnassignMemberBranchVariables): MutationRef<UnassignMemberBranchData, UnassignMemberBranchVariables>;
}
export const unassignMemberBranchRef: UnassignMemberBranchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the unassignMemberBranchRef:
```typescript
const name = unassignMemberBranchRef.operationName;
console.log(name);
```

### Variables
The `UnassignMemberBranch` mutation requires an argument of type `UnassignMemberBranchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UnassignMemberBranchVariables {
  tenantId: UUIDString;
  userId: string;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `UnassignMemberBranch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UnassignMemberBranchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UnassignMemberBranchData {
  membershipBranch_delete?: MembershipBranch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UnassignMemberBranch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, unassignMemberBranch, UnassignMemberBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `UnassignMemberBranch` mutation requires an argument of type `UnassignMemberBranchVariables`:
const unassignMemberBranchVars: UnassignMemberBranchVariables = {
  tenantId: ..., 
  userId: ..., 
  branchId: ..., 
};

// Call the `unassignMemberBranch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await unassignMemberBranch(unassignMemberBranchVars);
// Variables can be defined inline as well.
const { data } = await unassignMemberBranch({ tenantId: ..., userId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await unassignMemberBranch(dataConnect, unassignMemberBranchVars);

console.log(data.membershipBranch_delete);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
unassignMemberBranch(unassignMemberBranchVars).then((response) => {
  const data = response.data;
  console.log(data.membershipBranch_delete);
  console.log(data.auditEvent_insert);
});
```

### Using `UnassignMemberBranch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, unassignMemberBranchRef, UnassignMemberBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `UnassignMemberBranch` mutation requires an argument of type `UnassignMemberBranchVariables`:
const unassignMemberBranchVars: UnassignMemberBranchVariables = {
  tenantId: ..., 
  userId: ..., 
  branchId: ..., 
};

// Call the `unassignMemberBranchRef()` function to get a reference to the mutation.
const ref = unassignMemberBranchRef(unassignMemberBranchVars);
// Variables can be defined inline as well.
const ref = unassignMemberBranchRef({ tenantId: ..., userId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = unassignMemberBranchRef(dataConnect, unassignMemberBranchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.membershipBranch_delete);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.membershipBranch_delete);
  console.log(data.auditEvent_insert);
});
```

## ServerBeginPaymentOperation
You can execute the `ServerBeginPaymentOperation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverBeginPaymentOperation(vars: ServerBeginPaymentOperationVariables): MutationPromise<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;

interface ServerBeginPaymentOperationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerBeginPaymentOperationVariables): MutationRef<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;
}
export const serverBeginPaymentOperationRef: ServerBeginPaymentOperationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverBeginPaymentOperation(dc: DataConnect, vars: ServerBeginPaymentOperationVariables): MutationPromise<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;

interface ServerBeginPaymentOperationRef {
  ...
  (dc: DataConnect, vars: ServerBeginPaymentOperationVariables): MutationRef<ServerBeginPaymentOperationData, ServerBeginPaymentOperationVariables>;
}
export const serverBeginPaymentOperationRef: ServerBeginPaymentOperationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverBeginPaymentOperationRef:
```typescript
const name = serverBeginPaymentOperationRef.operationName;
console.log(name);
```

### Variables
The `ServerBeginPaymentOperation` mutation requires an argument of type `ServerBeginPaymentOperationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `ServerBeginPaymentOperation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerBeginPaymentOperationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerBeginPaymentOperationData {
  paymentOperation_insert: PaymentOperation_Key;
}
```
### Using `ServerBeginPaymentOperation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverBeginPaymentOperation, ServerBeginPaymentOperationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerBeginPaymentOperation` mutation requires an argument of type `ServerBeginPaymentOperationVariables`:
const serverBeginPaymentOperationVars: ServerBeginPaymentOperationVariables = {
  tenantId: ..., 
  branchId: ..., 
  kind: ..., 
  idempotencyKey: ..., 
  currency: ..., 
  amountMinor: ..., 
  providerRef: ..., // optional
  authorizationId: ..., // optional
  paymentId: ..., // optional
  refundId: ..., // optional
  quoteId: ..., // optional
};

// Call the `serverBeginPaymentOperation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverBeginPaymentOperation(serverBeginPaymentOperationVars);
// Variables can be defined inline as well.
const { data } = await serverBeginPaymentOperation({ tenantId: ..., branchId: ..., kind: ..., idempotencyKey: ..., currency: ..., amountMinor: ..., providerRef: ..., authorizationId: ..., paymentId: ..., refundId: ..., quoteId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverBeginPaymentOperation(dataConnect, serverBeginPaymentOperationVars);

console.log(data.paymentOperation_insert);

// Or, you can use the `Promise` API.
serverBeginPaymentOperation(serverBeginPaymentOperationVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_insert);
});
```

### Using `ServerBeginPaymentOperation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverBeginPaymentOperationRef, ServerBeginPaymentOperationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerBeginPaymentOperation` mutation requires an argument of type `ServerBeginPaymentOperationVariables`:
const serverBeginPaymentOperationVars: ServerBeginPaymentOperationVariables = {
  tenantId: ..., 
  branchId: ..., 
  kind: ..., 
  idempotencyKey: ..., 
  currency: ..., 
  amountMinor: ..., 
  providerRef: ..., // optional
  authorizationId: ..., // optional
  paymentId: ..., // optional
  refundId: ..., // optional
  quoteId: ..., // optional
};

// Call the `serverBeginPaymentOperationRef()` function to get a reference to the mutation.
const ref = serverBeginPaymentOperationRef(serverBeginPaymentOperationVars);
// Variables can be defined inline as well.
const ref = serverBeginPaymentOperationRef({ tenantId: ..., branchId: ..., kind: ..., idempotencyKey: ..., currency: ..., amountMinor: ..., providerRef: ..., authorizationId: ..., paymentId: ..., refundId: ..., quoteId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverBeginPaymentOperationRef(dataConnect, serverBeginPaymentOperationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_insert);
});
```

## ServerRetryPaymentOperation
You can execute the `ServerRetryPaymentOperation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverRetryPaymentOperation(vars: ServerRetryPaymentOperationVariables): MutationPromise<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;

interface ServerRetryPaymentOperationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRetryPaymentOperationVariables): MutationRef<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;
}
export const serverRetryPaymentOperationRef: ServerRetryPaymentOperationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverRetryPaymentOperation(dc: DataConnect, vars: ServerRetryPaymentOperationVariables): MutationPromise<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;

interface ServerRetryPaymentOperationRef {
  ...
  (dc: DataConnect, vars: ServerRetryPaymentOperationVariables): MutationRef<ServerRetryPaymentOperationData, ServerRetryPaymentOperationVariables>;
}
export const serverRetryPaymentOperationRef: ServerRetryPaymentOperationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverRetryPaymentOperationRef:
```typescript
const name = serverRetryPaymentOperationRef.operationName;
console.log(name);
```

### Variables
The `ServerRetryPaymentOperation` mutation requires an argument of type `ServerRetryPaymentOperationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerRetryPaymentOperationVariables {
  operationId: UUIDString;
}
```
### Return Type
Recall that executing the `ServerRetryPaymentOperation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerRetryPaymentOperationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerRetryPaymentOperationData {
  paymentOperation_updateMany: number;
}
```
### Using `ServerRetryPaymentOperation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverRetryPaymentOperation, ServerRetryPaymentOperationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRetryPaymentOperation` mutation requires an argument of type `ServerRetryPaymentOperationVariables`:
const serverRetryPaymentOperationVars: ServerRetryPaymentOperationVariables = {
  operationId: ..., 
};

// Call the `serverRetryPaymentOperation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverRetryPaymentOperation(serverRetryPaymentOperationVars);
// Variables can be defined inline as well.
const { data } = await serverRetryPaymentOperation({ operationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverRetryPaymentOperation(dataConnect, serverRetryPaymentOperationVars);

console.log(data.paymentOperation_updateMany);

// Or, you can use the `Promise` API.
serverRetryPaymentOperation(serverRetryPaymentOperationVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
});
```

### Using `ServerRetryPaymentOperation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverRetryPaymentOperationRef, ServerRetryPaymentOperationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRetryPaymentOperation` mutation requires an argument of type `ServerRetryPaymentOperationVariables`:
const serverRetryPaymentOperationVars: ServerRetryPaymentOperationVariables = {
  operationId: ..., 
};

// Call the `serverRetryPaymentOperationRef()` function to get a reference to the mutation.
const ref = serverRetryPaymentOperationRef(serverRetryPaymentOperationVars);
// Variables can be defined inline as well.
const ref = serverRetryPaymentOperationRef({ operationId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverRetryPaymentOperationRef(dataConnect, serverRetryPaymentOperationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
});
```

## ServerMarkPaymentOperationUnknown
You can execute the `ServerMarkPaymentOperationUnknown` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverMarkPaymentOperationUnknown(vars: ServerMarkPaymentOperationUnknownVariables): MutationPromise<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;

interface ServerMarkPaymentOperationUnknownRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerMarkPaymentOperationUnknownVariables): MutationRef<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;
}
export const serverMarkPaymentOperationUnknownRef: ServerMarkPaymentOperationUnknownRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverMarkPaymentOperationUnknown(dc: DataConnect, vars: ServerMarkPaymentOperationUnknownVariables): MutationPromise<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;

interface ServerMarkPaymentOperationUnknownRef {
  ...
  (dc: DataConnect, vars: ServerMarkPaymentOperationUnknownVariables): MutationRef<ServerMarkPaymentOperationUnknownData, ServerMarkPaymentOperationUnknownVariables>;
}
export const serverMarkPaymentOperationUnknownRef: ServerMarkPaymentOperationUnknownRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverMarkPaymentOperationUnknownRef:
```typescript
const name = serverMarkPaymentOperationUnknownRef.operationName;
console.log(name);
```

### Variables
The `ServerMarkPaymentOperationUnknown` mutation requires an argument of type `ServerMarkPaymentOperationUnknownVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerMarkPaymentOperationUnknownVariables {
  operationId: UUIDString;
}
```
### Return Type
Recall that executing the `ServerMarkPaymentOperationUnknown` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerMarkPaymentOperationUnknownData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerMarkPaymentOperationUnknownData {
  paymentOperation_updateMany: number;
}
```
### Using `ServerMarkPaymentOperationUnknown`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverMarkPaymentOperationUnknown, ServerMarkPaymentOperationUnknownVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerMarkPaymentOperationUnknown` mutation requires an argument of type `ServerMarkPaymentOperationUnknownVariables`:
const serverMarkPaymentOperationUnknownVars: ServerMarkPaymentOperationUnknownVariables = {
  operationId: ..., 
};

// Call the `serverMarkPaymentOperationUnknown()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverMarkPaymentOperationUnknown(serverMarkPaymentOperationUnknownVars);
// Variables can be defined inline as well.
const { data } = await serverMarkPaymentOperationUnknown({ operationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverMarkPaymentOperationUnknown(dataConnect, serverMarkPaymentOperationUnknownVars);

console.log(data.paymentOperation_updateMany);

// Or, you can use the `Promise` API.
serverMarkPaymentOperationUnknown(serverMarkPaymentOperationUnknownVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
});
```

### Using `ServerMarkPaymentOperationUnknown`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverMarkPaymentOperationUnknownRef, ServerMarkPaymentOperationUnknownVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerMarkPaymentOperationUnknown` mutation requires an argument of type `ServerMarkPaymentOperationUnknownVariables`:
const serverMarkPaymentOperationUnknownVars: ServerMarkPaymentOperationUnknownVariables = {
  operationId: ..., 
};

// Call the `serverMarkPaymentOperationUnknownRef()` function to get a reference to the mutation.
const ref = serverMarkPaymentOperationUnknownRef(serverMarkPaymentOperationUnknownVars);
// Variables can be defined inline as well.
const ref = serverMarkPaymentOperationUnknownRef({ operationId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverMarkPaymentOperationUnknownRef(dataConnect, serverMarkPaymentOperationUnknownVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
});
```

## ServerFailPaymentOperation
You can execute the `ServerFailPaymentOperation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverFailPaymentOperation(vars: ServerFailPaymentOperationVariables): MutationPromise<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;

interface ServerFailPaymentOperationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFailPaymentOperationVariables): MutationRef<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;
}
export const serverFailPaymentOperationRef: ServerFailPaymentOperationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverFailPaymentOperation(dc: DataConnect, vars: ServerFailPaymentOperationVariables): MutationPromise<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;

interface ServerFailPaymentOperationRef {
  ...
  (dc: DataConnect, vars: ServerFailPaymentOperationVariables): MutationRef<ServerFailPaymentOperationData, ServerFailPaymentOperationVariables>;
}
export const serverFailPaymentOperationRef: ServerFailPaymentOperationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverFailPaymentOperationRef:
```typescript
const name = serverFailPaymentOperationRef.operationName;
console.log(name);
```

### Variables
The `ServerFailPaymentOperation` mutation requires an argument of type `ServerFailPaymentOperationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerFailPaymentOperationVariables {
  operationId: UUIDString;
  failureCode: string;
}
```
### Return Type
Recall that executing the `ServerFailPaymentOperation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerFailPaymentOperationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerFailPaymentOperationData {
  paymentOperation_updateMany: number;
}
```
### Using `ServerFailPaymentOperation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverFailPaymentOperation, ServerFailPaymentOperationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFailPaymentOperation` mutation requires an argument of type `ServerFailPaymentOperationVariables`:
const serverFailPaymentOperationVars: ServerFailPaymentOperationVariables = {
  operationId: ..., 
  failureCode: ..., 
};

// Call the `serverFailPaymentOperation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverFailPaymentOperation(serverFailPaymentOperationVars);
// Variables can be defined inline as well.
const { data } = await serverFailPaymentOperation({ operationId: ..., failureCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverFailPaymentOperation(dataConnect, serverFailPaymentOperationVars);

console.log(data.paymentOperation_updateMany);

// Or, you can use the `Promise` API.
serverFailPaymentOperation(serverFailPaymentOperationVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
});
```

### Using `ServerFailPaymentOperation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverFailPaymentOperationRef, ServerFailPaymentOperationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFailPaymentOperation` mutation requires an argument of type `ServerFailPaymentOperationVariables`:
const serverFailPaymentOperationVars: ServerFailPaymentOperationVariables = {
  operationId: ..., 
  failureCode: ..., 
};

// Call the `serverFailPaymentOperationRef()` function to get a reference to the mutation.
const ref = serverFailPaymentOperationRef(serverFailPaymentOperationVars);
// Variables can be defined inline as well.
const ref = serverFailPaymentOperationRef({ operationId: ..., failureCode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverFailPaymentOperationRef(dataConnect, serverFailPaymentOperationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
});
```

## ServerSettleAuthorize
You can execute the `ServerSettleAuthorize` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverSettleAuthorize(vars: ServerSettleAuthorizeVariables): MutationPromise<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;

interface ServerSettleAuthorizeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleAuthorizeVariables): MutationRef<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;
}
export const serverSettleAuthorizeRef: ServerSettleAuthorizeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverSettleAuthorize(dc: DataConnect, vars: ServerSettleAuthorizeVariables): MutationPromise<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;

interface ServerSettleAuthorizeRef {
  ...
  (dc: DataConnect, vars: ServerSettleAuthorizeVariables): MutationRef<ServerSettleAuthorizeData, ServerSettleAuthorizeVariables>;
}
export const serverSettleAuthorizeRef: ServerSettleAuthorizeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverSettleAuthorizeRef:
```typescript
const name = serverSettleAuthorizeRef.operationName;
console.log(name);
```

### Variables
The `ServerSettleAuthorize` mutation requires an argument of type `ServerSettleAuthorizeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `ServerSettleAuthorize` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerSettleAuthorizeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerSettleAuthorizeData {
  paymentOperation_updateMany: number;
  orderQuote_update?: OrderQuote_Key | null;
  paymentAuthorization_insert: PaymentAuthorization_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerSettleAuthorize`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverSettleAuthorize, ServerSettleAuthorizeVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleAuthorize` mutation requires an argument of type `ServerSettleAuthorizeVariables`:
const serverSettleAuthorizeVars: ServerSettleAuthorizeVariables = {
  operationId: ..., 
  quoteId: ..., 
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  participantId: ..., 
  authUid: ..., 
  provider: ..., 
  paymentRef: ..., 
  currency: ..., 
  amountMinor: ..., 
  expiresAt: ..., // optional
  consentTextVersion: ..., 
};

// Call the `serverSettleAuthorize()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverSettleAuthorize(serverSettleAuthorizeVars);
// Variables can be defined inline as well.
const { data } = await serverSettleAuthorize({ operationId: ..., quoteId: ..., tenantId: ..., branchId: ..., sessionId: ..., participantId: ..., authUid: ..., provider: ..., paymentRef: ..., currency: ..., amountMinor: ..., expiresAt: ..., consentTextVersion: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverSettleAuthorize(dataConnect, serverSettleAuthorizeVars);

console.log(data.paymentOperation_updateMany);
console.log(data.orderQuote_update);
console.log(data.paymentAuthorization_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverSettleAuthorize(serverSettleAuthorizeVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.orderQuote_update);
  console.log(data.paymentAuthorization_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerSettleAuthorize`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverSettleAuthorizeRef, ServerSettleAuthorizeVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleAuthorize` mutation requires an argument of type `ServerSettleAuthorizeVariables`:
const serverSettleAuthorizeVars: ServerSettleAuthorizeVariables = {
  operationId: ..., 
  quoteId: ..., 
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  participantId: ..., 
  authUid: ..., 
  provider: ..., 
  paymentRef: ..., 
  currency: ..., 
  amountMinor: ..., 
  expiresAt: ..., // optional
  consentTextVersion: ..., 
};

// Call the `serverSettleAuthorizeRef()` function to get a reference to the mutation.
const ref = serverSettleAuthorizeRef(serverSettleAuthorizeVars);
// Variables can be defined inline as well.
const ref = serverSettleAuthorizeRef({ operationId: ..., quoteId: ..., tenantId: ..., branchId: ..., sessionId: ..., participantId: ..., authUid: ..., provider: ..., paymentRef: ..., currency: ..., amountMinor: ..., expiresAt: ..., consentTextVersion: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverSettleAuthorizeRef(dataConnect, serverSettleAuthorizeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.orderQuote_update);
console.log(data.paymentAuthorization_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.orderQuote_update);
  console.log(data.paymentAuthorization_insert);
  console.log(data.auditEvent_insert);
});
```

## ServerDeclineAuthorize
You can execute the `ServerDeclineAuthorize` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverDeclineAuthorize(vars: ServerDeclineAuthorizeVariables): MutationPromise<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;

interface ServerDeclineAuthorizeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerDeclineAuthorizeVariables): MutationRef<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;
}
export const serverDeclineAuthorizeRef: ServerDeclineAuthorizeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverDeclineAuthorize(dc: DataConnect, vars: ServerDeclineAuthorizeVariables): MutationPromise<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;

interface ServerDeclineAuthorizeRef {
  ...
  (dc: DataConnect, vars: ServerDeclineAuthorizeVariables): MutationRef<ServerDeclineAuthorizeData, ServerDeclineAuthorizeVariables>;
}
export const serverDeclineAuthorizeRef: ServerDeclineAuthorizeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverDeclineAuthorizeRef:
```typescript
const name = serverDeclineAuthorizeRef.operationName;
console.log(name);
```

### Variables
The `ServerDeclineAuthorize` mutation requires an argument of type `ServerDeclineAuthorizeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerDeclineAuthorizeVariables {
  operationId: UUIDString;
  quoteId: UUIDString;
  tenantId: UUIDString;
  authUid: string;
  paymentRef: string;
  consentTextVersion: string;
}
```
### Return Type
Recall that executing the `ServerDeclineAuthorize` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerDeclineAuthorizeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerDeclineAuthorizeData {
  paymentOperation_updateMany: number;
  orderQuote_update?: OrderQuote_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerDeclineAuthorize`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverDeclineAuthorize, ServerDeclineAuthorizeVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerDeclineAuthorize` mutation requires an argument of type `ServerDeclineAuthorizeVariables`:
const serverDeclineAuthorizeVars: ServerDeclineAuthorizeVariables = {
  operationId: ..., 
  quoteId: ..., 
  tenantId: ..., 
  authUid: ..., 
  paymentRef: ..., 
  consentTextVersion: ..., 
};

// Call the `serverDeclineAuthorize()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverDeclineAuthorize(serverDeclineAuthorizeVars);
// Variables can be defined inline as well.
const { data } = await serverDeclineAuthorize({ operationId: ..., quoteId: ..., tenantId: ..., authUid: ..., paymentRef: ..., consentTextVersion: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverDeclineAuthorize(dataConnect, serverDeclineAuthorizeVars);

console.log(data.paymentOperation_updateMany);
console.log(data.orderQuote_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverDeclineAuthorize(serverDeclineAuthorizeVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.orderQuote_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerDeclineAuthorize`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverDeclineAuthorizeRef, ServerDeclineAuthorizeVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerDeclineAuthorize` mutation requires an argument of type `ServerDeclineAuthorizeVariables`:
const serverDeclineAuthorizeVars: ServerDeclineAuthorizeVariables = {
  operationId: ..., 
  quoteId: ..., 
  tenantId: ..., 
  authUid: ..., 
  paymentRef: ..., 
  consentTextVersion: ..., 
};

// Call the `serverDeclineAuthorizeRef()` function to get a reference to the mutation.
const ref = serverDeclineAuthorizeRef(serverDeclineAuthorizeVars);
// Variables can be defined inline as well.
const ref = serverDeclineAuthorizeRef({ operationId: ..., quoteId: ..., tenantId: ..., authUid: ..., paymentRef: ..., consentTextVersion: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverDeclineAuthorizeRef(dataConnect, serverDeclineAuthorizeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.orderQuote_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.orderQuote_update);
  console.log(data.auditEvent_insert);
});
```

## ServerAdoptOrphanAuthorization
You can execute the `ServerAdoptOrphanAuthorization` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverAdoptOrphanAuthorization(vars: ServerAdoptOrphanAuthorizationVariables): MutationPromise<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;

interface ServerAdoptOrphanAuthorizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerAdoptOrphanAuthorizationVariables): MutationRef<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;
}
export const serverAdoptOrphanAuthorizationRef: ServerAdoptOrphanAuthorizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverAdoptOrphanAuthorization(dc: DataConnect, vars: ServerAdoptOrphanAuthorizationVariables): MutationPromise<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;

interface ServerAdoptOrphanAuthorizationRef {
  ...
  (dc: DataConnect, vars: ServerAdoptOrphanAuthorizationVariables): MutationRef<ServerAdoptOrphanAuthorizationData, ServerAdoptOrphanAuthorizationVariables>;
}
export const serverAdoptOrphanAuthorizationRef: ServerAdoptOrphanAuthorizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverAdoptOrphanAuthorizationRef:
```typescript
const name = serverAdoptOrphanAuthorizationRef.operationName;
console.log(name);
```

### Variables
The `ServerAdoptOrphanAuthorization` mutation requires an argument of type `ServerAdoptOrphanAuthorizationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `ServerAdoptOrphanAuthorization` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerAdoptOrphanAuthorizationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerAdoptOrphanAuthorizationData {
  paymentOperation_updateMany: number;
  orderQuote_update?: OrderQuote_Key | null;
  paymentAuthorization_insert: PaymentAuthorization_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerAdoptOrphanAuthorization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverAdoptOrphanAuthorization, ServerAdoptOrphanAuthorizationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerAdoptOrphanAuthorization` mutation requires an argument of type `ServerAdoptOrphanAuthorizationVariables`:
const serverAdoptOrphanAuthorizationVars: ServerAdoptOrphanAuthorizationVariables = {
  operationId: ..., 
  quoteId: ..., 
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  participantId: ..., 
  provider: ..., 
  paymentRef: ..., 
  currency: ..., 
  amountMinor: ..., 
  expiresAt: ..., // optional
};

// Call the `serverAdoptOrphanAuthorization()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverAdoptOrphanAuthorization(serverAdoptOrphanAuthorizationVars);
// Variables can be defined inline as well.
const { data } = await serverAdoptOrphanAuthorization({ operationId: ..., quoteId: ..., tenantId: ..., branchId: ..., sessionId: ..., participantId: ..., provider: ..., paymentRef: ..., currency: ..., amountMinor: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverAdoptOrphanAuthorization(dataConnect, serverAdoptOrphanAuthorizationVars);

console.log(data.paymentOperation_updateMany);
console.log(data.orderQuote_update);
console.log(data.paymentAuthorization_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverAdoptOrphanAuthorization(serverAdoptOrphanAuthorizationVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.orderQuote_update);
  console.log(data.paymentAuthorization_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerAdoptOrphanAuthorization`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverAdoptOrphanAuthorizationRef, ServerAdoptOrphanAuthorizationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerAdoptOrphanAuthorization` mutation requires an argument of type `ServerAdoptOrphanAuthorizationVariables`:
const serverAdoptOrphanAuthorizationVars: ServerAdoptOrphanAuthorizationVariables = {
  operationId: ..., 
  quoteId: ..., 
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  participantId: ..., 
  provider: ..., 
  paymentRef: ..., 
  currency: ..., 
  amountMinor: ..., 
  expiresAt: ..., // optional
};

// Call the `serverAdoptOrphanAuthorizationRef()` function to get a reference to the mutation.
const ref = serverAdoptOrphanAuthorizationRef(serverAdoptOrphanAuthorizationVars);
// Variables can be defined inline as well.
const ref = serverAdoptOrphanAuthorizationRef({ operationId: ..., quoteId: ..., tenantId: ..., branchId: ..., sessionId: ..., participantId: ..., provider: ..., paymentRef: ..., currency: ..., amountMinor: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverAdoptOrphanAuthorizationRef(dataConnect, serverAdoptOrphanAuthorizationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.orderQuote_update);
console.log(data.paymentAuthorization_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.orderQuote_update);
  console.log(data.paymentAuthorization_insert);
  console.log(data.auditEvent_insert);
});
```

## ServerSettleCapture
You can execute the `ServerSettleCapture` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverSettleCapture(vars: ServerSettleCaptureVariables): MutationPromise<ServerSettleCaptureData, ServerSettleCaptureVariables>;

interface ServerSettleCaptureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleCaptureVariables): MutationRef<ServerSettleCaptureData, ServerSettleCaptureVariables>;
}
export const serverSettleCaptureRef: ServerSettleCaptureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverSettleCapture(dc: DataConnect, vars: ServerSettleCaptureVariables): MutationPromise<ServerSettleCaptureData, ServerSettleCaptureVariables>;

interface ServerSettleCaptureRef {
  ...
  (dc: DataConnect, vars: ServerSettleCaptureVariables): MutationRef<ServerSettleCaptureData, ServerSettleCaptureVariables>;
}
export const serverSettleCaptureRef: ServerSettleCaptureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverSettleCaptureRef:
```typescript
const name = serverSettleCaptureRef.operationName;
console.log(name);
```

### Variables
The `ServerSettleCapture` mutation requires an argument of type `ServerSettleCaptureVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerSettleCaptureVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  authorizationId: UUIDString;
  paymentId: UUIDString;
  capturedMinor: Int64String;
  providerRef: string;
  actorId: string;
}
```
### Return Type
Recall that executing the `ServerSettleCapture` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerSettleCaptureData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerSettleCaptureData {
  paymentOperation_updateMany: number;
  paymentAuthorization_update?: PaymentAuthorization_Key | null;
  billPayment_update?: BillPayment_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerSettleCapture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverSettleCapture, ServerSettleCaptureVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleCapture` mutation requires an argument of type `ServerSettleCaptureVariables`:
const serverSettleCaptureVars: ServerSettleCaptureVariables = {
  operationId: ..., 
  tenantId: ..., 
  authorizationId: ..., 
  paymentId: ..., 
  capturedMinor: ..., 
  providerRef: ..., 
  actorId: ..., 
};

// Call the `serverSettleCapture()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverSettleCapture(serverSettleCaptureVars);
// Variables can be defined inline as well.
const { data } = await serverSettleCapture({ operationId: ..., tenantId: ..., authorizationId: ..., paymentId: ..., capturedMinor: ..., providerRef: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverSettleCapture(dataConnect, serverSettleCaptureVars);

console.log(data.paymentOperation_updateMany);
console.log(data.paymentAuthorization_update);
console.log(data.billPayment_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverSettleCapture(serverSettleCaptureVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.paymentAuthorization_update);
  console.log(data.billPayment_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerSettleCapture`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverSettleCaptureRef, ServerSettleCaptureVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleCapture` mutation requires an argument of type `ServerSettleCaptureVariables`:
const serverSettleCaptureVars: ServerSettleCaptureVariables = {
  operationId: ..., 
  tenantId: ..., 
  authorizationId: ..., 
  paymentId: ..., 
  capturedMinor: ..., 
  providerRef: ..., 
  actorId: ..., 
};

// Call the `serverSettleCaptureRef()` function to get a reference to the mutation.
const ref = serverSettleCaptureRef(serverSettleCaptureVars);
// Variables can be defined inline as well.
const ref = serverSettleCaptureRef({ operationId: ..., tenantId: ..., authorizationId: ..., paymentId: ..., capturedMinor: ..., providerRef: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverSettleCaptureRef(dataConnect, serverSettleCaptureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.paymentAuthorization_update);
console.log(data.billPayment_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.paymentAuthorization_update);
  console.log(data.billPayment_update);
  console.log(data.auditEvent_insert);
});
```

## ServerFailCapture
You can execute the `ServerFailCapture` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverFailCapture(vars: ServerFailCaptureVariables): MutationPromise<ServerFailCaptureData, ServerFailCaptureVariables>;

interface ServerFailCaptureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFailCaptureVariables): MutationRef<ServerFailCaptureData, ServerFailCaptureVariables>;
}
export const serverFailCaptureRef: ServerFailCaptureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverFailCapture(dc: DataConnect, vars: ServerFailCaptureVariables): MutationPromise<ServerFailCaptureData, ServerFailCaptureVariables>;

interface ServerFailCaptureRef {
  ...
  (dc: DataConnect, vars: ServerFailCaptureVariables): MutationRef<ServerFailCaptureData, ServerFailCaptureVariables>;
}
export const serverFailCaptureRef: ServerFailCaptureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverFailCaptureRef:
```typescript
const name = serverFailCaptureRef.operationName;
console.log(name);
```

### Variables
The `ServerFailCapture` mutation requires an argument of type `ServerFailCaptureVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerFailCaptureVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  paymentId: UUIDString;
  failureCode: string;
  actorId: string;
}
```
### Return Type
Recall that executing the `ServerFailCapture` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerFailCaptureData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerFailCaptureData {
  paymentOperation_updateMany: number;
  billPayment_update?: BillPayment_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerFailCapture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverFailCapture, ServerFailCaptureVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFailCapture` mutation requires an argument of type `ServerFailCaptureVariables`:
const serverFailCaptureVars: ServerFailCaptureVariables = {
  operationId: ..., 
  tenantId: ..., 
  paymentId: ..., 
  failureCode: ..., 
  actorId: ..., 
};

// Call the `serverFailCapture()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverFailCapture(serverFailCaptureVars);
// Variables can be defined inline as well.
const { data } = await serverFailCapture({ operationId: ..., tenantId: ..., paymentId: ..., failureCode: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverFailCapture(dataConnect, serverFailCaptureVars);

console.log(data.paymentOperation_updateMany);
console.log(data.billPayment_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverFailCapture(serverFailCaptureVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.billPayment_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerFailCapture`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverFailCaptureRef, ServerFailCaptureVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFailCapture` mutation requires an argument of type `ServerFailCaptureVariables`:
const serverFailCaptureVars: ServerFailCaptureVariables = {
  operationId: ..., 
  tenantId: ..., 
  paymentId: ..., 
  failureCode: ..., 
  actorId: ..., 
};

// Call the `serverFailCaptureRef()` function to get a reference to the mutation.
const ref = serverFailCaptureRef(serverFailCaptureVars);
// Variables can be defined inline as well.
const ref = serverFailCaptureRef({ operationId: ..., tenantId: ..., paymentId: ..., failureCode: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverFailCaptureRef(dataConnect, serverFailCaptureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.billPayment_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.billPayment_update);
  console.log(data.auditEvent_insert);
});
```

## ServerSettleVoid
You can execute the `ServerSettleVoid` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverSettleVoid(vars: ServerSettleVoidVariables): MutationPromise<ServerSettleVoidData, ServerSettleVoidVariables>;

interface ServerSettleVoidRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleVoidVariables): MutationRef<ServerSettleVoidData, ServerSettleVoidVariables>;
}
export const serverSettleVoidRef: ServerSettleVoidRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverSettleVoid(dc: DataConnect, vars: ServerSettleVoidVariables): MutationPromise<ServerSettleVoidData, ServerSettleVoidVariables>;

interface ServerSettleVoidRef {
  ...
  (dc: DataConnect, vars: ServerSettleVoidVariables): MutationRef<ServerSettleVoidData, ServerSettleVoidVariables>;
}
export const serverSettleVoidRef: ServerSettleVoidRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverSettleVoidRef:
```typescript
const name = serverSettleVoidRef.operationName;
console.log(name);
```

### Variables
The `ServerSettleVoid` mutation requires an argument of type `ServerSettleVoidVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerSettleVoidVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  authorizationId: UUIDString;
  status: AuthorizationStatus;
  actorId: string;
}
```
### Return Type
Recall that executing the `ServerSettleVoid` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerSettleVoidData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerSettleVoidData {
  paymentOperation_updateMany: number;
  paymentAuthorization_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerSettleVoid`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverSettleVoid, ServerSettleVoidVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleVoid` mutation requires an argument of type `ServerSettleVoidVariables`:
const serverSettleVoidVars: ServerSettleVoidVariables = {
  operationId: ..., 
  tenantId: ..., 
  authorizationId: ..., 
  status: ..., 
  actorId: ..., 
};

// Call the `serverSettleVoid()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverSettleVoid(serverSettleVoidVars);
// Variables can be defined inline as well.
const { data } = await serverSettleVoid({ operationId: ..., tenantId: ..., authorizationId: ..., status: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverSettleVoid(dataConnect, serverSettleVoidVars);

console.log(data.paymentOperation_updateMany);
console.log(data.paymentAuthorization_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverSettleVoid(serverSettleVoidVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.paymentAuthorization_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerSettleVoid`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverSettleVoidRef, ServerSettleVoidVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleVoid` mutation requires an argument of type `ServerSettleVoidVariables`:
const serverSettleVoidVars: ServerSettleVoidVariables = {
  operationId: ..., 
  tenantId: ..., 
  authorizationId: ..., 
  status: ..., 
  actorId: ..., 
};

// Call the `serverSettleVoidRef()` function to get a reference to the mutation.
const ref = serverSettleVoidRef(serverSettleVoidVars);
// Variables can be defined inline as well.
const ref = serverSettleVoidRef({ operationId: ..., tenantId: ..., authorizationId: ..., status: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverSettleVoidRef(dataConnect, serverSettleVoidVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.paymentAuthorization_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.paymentAuthorization_updateMany);
  console.log(data.auditEvent_insert);
});
```

## ServerExpireAuthorization
You can execute the `ServerExpireAuthorization` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverExpireAuthorization(vars: ServerExpireAuthorizationVariables): MutationPromise<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;

interface ServerExpireAuthorizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpireAuthorizationVariables): MutationRef<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;
}
export const serverExpireAuthorizationRef: ServerExpireAuthorizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverExpireAuthorization(dc: DataConnect, vars: ServerExpireAuthorizationVariables): MutationPromise<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;

interface ServerExpireAuthorizationRef {
  ...
  (dc: DataConnect, vars: ServerExpireAuthorizationVariables): MutationRef<ServerExpireAuthorizationData, ServerExpireAuthorizationVariables>;
}
export const serverExpireAuthorizationRef: ServerExpireAuthorizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverExpireAuthorizationRef:
```typescript
const name = serverExpireAuthorizationRef.operationName;
console.log(name);
```

### Variables
The `ServerExpireAuthorization` mutation requires an argument of type `ServerExpireAuthorizationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerExpireAuthorizationVariables {
  authorizationId: UUIDString;
}
```
### Return Type
Recall that executing the `ServerExpireAuthorization` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerExpireAuthorizationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerExpireAuthorizationData {
  paymentAuthorization_updateMany: number;
}
```
### Using `ServerExpireAuthorization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverExpireAuthorization, ServerExpireAuthorizationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpireAuthorization` mutation requires an argument of type `ServerExpireAuthorizationVariables`:
const serverExpireAuthorizationVars: ServerExpireAuthorizationVariables = {
  authorizationId: ..., 
};

// Call the `serverExpireAuthorization()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverExpireAuthorization(serverExpireAuthorizationVars);
// Variables can be defined inline as well.
const { data } = await serverExpireAuthorization({ authorizationId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverExpireAuthorization(dataConnect, serverExpireAuthorizationVars);

console.log(data.paymentAuthorization_updateMany);

// Or, you can use the `Promise` API.
serverExpireAuthorization(serverExpireAuthorizationVars).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization_updateMany);
});
```

### Using `ServerExpireAuthorization`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverExpireAuthorizationRef, ServerExpireAuthorizationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpireAuthorization` mutation requires an argument of type `ServerExpireAuthorizationVariables`:
const serverExpireAuthorizationVars: ServerExpireAuthorizationVariables = {
  authorizationId: ..., 
};

// Call the `serverExpireAuthorizationRef()` function to get a reference to the mutation.
const ref = serverExpireAuthorizationRef(serverExpireAuthorizationVars);
// Variables can be defined inline as well.
const ref = serverExpireAuthorizationRef({ authorizationId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverExpireAuthorizationRef(dataConnect, serverExpireAuthorizationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentAuthorization_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization_updateMany);
});
```

## ServerExpireAuthorizationByRef
You can execute the `ServerExpireAuthorizationByRef` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverExpireAuthorizationByRef(vars: ServerExpireAuthorizationByRefVariables): MutationPromise<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;

interface ServerExpireAuthorizationByRefRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpireAuthorizationByRefVariables): MutationRef<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;
}
export const serverExpireAuthorizationByRefRef: ServerExpireAuthorizationByRefRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverExpireAuthorizationByRef(dc: DataConnect, vars: ServerExpireAuthorizationByRefVariables): MutationPromise<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;

interface ServerExpireAuthorizationByRefRef {
  ...
  (dc: DataConnect, vars: ServerExpireAuthorizationByRefVariables): MutationRef<ServerExpireAuthorizationByRefData, ServerExpireAuthorizationByRefVariables>;
}
export const serverExpireAuthorizationByRefRef: ServerExpireAuthorizationByRefRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverExpireAuthorizationByRefRef:
```typescript
const name = serverExpireAuthorizationByRefRef.operationName;
console.log(name);
```

### Variables
The `ServerExpireAuthorizationByRef` mutation requires an argument of type `ServerExpireAuthorizationByRefVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerExpireAuthorizationByRefVariables {
  provider: string;
  providerRef: string;
}
```
### Return Type
Recall that executing the `ServerExpireAuthorizationByRef` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerExpireAuthorizationByRefData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerExpireAuthorizationByRefData {
  paymentAuthorization_updateMany: number;
}
```
### Using `ServerExpireAuthorizationByRef`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverExpireAuthorizationByRef, ServerExpireAuthorizationByRefVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpireAuthorizationByRef` mutation requires an argument of type `ServerExpireAuthorizationByRefVariables`:
const serverExpireAuthorizationByRefVars: ServerExpireAuthorizationByRefVariables = {
  provider: ..., 
  providerRef: ..., 
};

// Call the `serverExpireAuthorizationByRef()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverExpireAuthorizationByRef(serverExpireAuthorizationByRefVars);
// Variables can be defined inline as well.
const { data } = await serverExpireAuthorizationByRef({ provider: ..., providerRef: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverExpireAuthorizationByRef(dataConnect, serverExpireAuthorizationByRefVars);

console.log(data.paymentAuthorization_updateMany);

// Or, you can use the `Promise` API.
serverExpireAuthorizationByRef(serverExpireAuthorizationByRefVars).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization_updateMany);
});
```

### Using `ServerExpireAuthorizationByRef`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverExpireAuthorizationByRefRef, ServerExpireAuthorizationByRefVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpireAuthorizationByRef` mutation requires an argument of type `ServerExpireAuthorizationByRefVariables`:
const serverExpireAuthorizationByRefVars: ServerExpireAuthorizationByRefVariables = {
  provider: ..., 
  providerRef: ..., 
};

// Call the `serverExpireAuthorizationByRefRef()` function to get a reference to the mutation.
const ref = serverExpireAuthorizationByRefRef(serverExpireAuthorizationByRefVars);
// Variables can be defined inline as well.
const ref = serverExpireAuthorizationByRefRef({ provider: ..., providerRef: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverExpireAuthorizationByRefRef(dataConnect, serverExpireAuthorizationByRefVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentAuthorization_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization_updateMany);
});
```

## ServerExpireLapsedAuthorizations
You can execute the `ServerExpireLapsedAuthorizations` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverExpireLapsedAuthorizations(vars: ServerExpireLapsedAuthorizationsVariables): MutationPromise<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;

interface ServerExpireLapsedAuthorizationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerExpireLapsedAuthorizationsVariables): MutationRef<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;
}
export const serverExpireLapsedAuthorizationsRef: ServerExpireLapsedAuthorizationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverExpireLapsedAuthorizations(dc: DataConnect, vars: ServerExpireLapsedAuthorizationsVariables): MutationPromise<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;

interface ServerExpireLapsedAuthorizationsRef {
  ...
  (dc: DataConnect, vars: ServerExpireLapsedAuthorizationsVariables): MutationRef<ServerExpireLapsedAuthorizationsData, ServerExpireLapsedAuthorizationsVariables>;
}
export const serverExpireLapsedAuthorizationsRef: ServerExpireLapsedAuthorizationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverExpireLapsedAuthorizationsRef:
```typescript
const name = serverExpireLapsedAuthorizationsRef.operationName;
console.log(name);
```

### Variables
The `ServerExpireLapsedAuthorizations` mutation requires an argument of type `ServerExpireLapsedAuthorizationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerExpireLapsedAuthorizationsVariables {
  now: TimestampString;
}
```
### Return Type
Recall that executing the `ServerExpireLapsedAuthorizations` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerExpireLapsedAuthorizationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerExpireLapsedAuthorizationsData {
  paymentAuthorization_updateMany: number;
}
```
### Using `ServerExpireLapsedAuthorizations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverExpireLapsedAuthorizations, ServerExpireLapsedAuthorizationsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpireLapsedAuthorizations` mutation requires an argument of type `ServerExpireLapsedAuthorizationsVariables`:
const serverExpireLapsedAuthorizationsVars: ServerExpireLapsedAuthorizationsVariables = {
  now: ..., 
};

// Call the `serverExpireLapsedAuthorizations()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverExpireLapsedAuthorizations(serverExpireLapsedAuthorizationsVars);
// Variables can be defined inline as well.
const { data } = await serverExpireLapsedAuthorizations({ now: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverExpireLapsedAuthorizations(dataConnect, serverExpireLapsedAuthorizationsVars);

console.log(data.paymentAuthorization_updateMany);

// Or, you can use the `Promise` API.
serverExpireLapsedAuthorizations(serverExpireLapsedAuthorizationsVars).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization_updateMany);
});
```

### Using `ServerExpireLapsedAuthorizations`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverExpireLapsedAuthorizationsRef, ServerExpireLapsedAuthorizationsVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerExpireLapsedAuthorizations` mutation requires an argument of type `ServerExpireLapsedAuthorizationsVariables`:
const serverExpireLapsedAuthorizationsVars: ServerExpireLapsedAuthorizationsVariables = {
  now: ..., 
};

// Call the `serverExpireLapsedAuthorizationsRef()` function to get a reference to the mutation.
const ref = serverExpireLapsedAuthorizationsRef(serverExpireLapsedAuthorizationsVars);
// Variables can be defined inline as well.
const ref = serverExpireLapsedAuthorizationsRef({ now: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverExpireLapsedAuthorizationsRef(dataConnect, serverExpireLapsedAuthorizationsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentAuthorization_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentAuthorization_updateMany);
});
```

## ServerSettleRefund
You can execute the `ServerSettleRefund` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverSettleRefund(vars: ServerSettleRefundVariables): MutationPromise<ServerSettleRefundData, ServerSettleRefundVariables>;

interface ServerSettleRefundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSettleRefundVariables): MutationRef<ServerSettleRefundData, ServerSettleRefundVariables>;
}
export const serverSettleRefundRef: ServerSettleRefundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverSettleRefund(dc: DataConnect, vars: ServerSettleRefundVariables): MutationPromise<ServerSettleRefundData, ServerSettleRefundVariables>;

interface ServerSettleRefundRef {
  ...
  (dc: DataConnect, vars: ServerSettleRefundVariables): MutationRef<ServerSettleRefundData, ServerSettleRefundVariables>;
}
export const serverSettleRefundRef: ServerSettleRefundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverSettleRefundRef:
```typescript
const name = serverSettleRefundRef.operationName;
console.log(name);
```

### Variables
The `ServerSettleRefund` mutation requires an argument of type `ServerSettleRefundVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerSettleRefundVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  refundId: UUIDString;
  refundRef: string;
  actorId: string;
}
```
### Return Type
Recall that executing the `ServerSettleRefund` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerSettleRefundData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerSettleRefundData {
  paymentOperation_updateMany: number;
  refund_update?: Refund_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerSettleRefund`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverSettleRefund, ServerSettleRefundVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleRefund` mutation requires an argument of type `ServerSettleRefundVariables`:
const serverSettleRefundVars: ServerSettleRefundVariables = {
  operationId: ..., 
  tenantId: ..., 
  refundId: ..., 
  refundRef: ..., 
  actorId: ..., 
};

// Call the `serverSettleRefund()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverSettleRefund(serverSettleRefundVars);
// Variables can be defined inline as well.
const { data } = await serverSettleRefund({ operationId: ..., tenantId: ..., refundId: ..., refundRef: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverSettleRefund(dataConnect, serverSettleRefundVars);

console.log(data.paymentOperation_updateMany);
console.log(data.refund_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverSettleRefund(serverSettleRefundVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.refund_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerSettleRefund`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverSettleRefundRef, ServerSettleRefundVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSettleRefund` mutation requires an argument of type `ServerSettleRefundVariables`:
const serverSettleRefundVars: ServerSettleRefundVariables = {
  operationId: ..., 
  tenantId: ..., 
  refundId: ..., 
  refundRef: ..., 
  actorId: ..., 
};

// Call the `serverSettleRefundRef()` function to get a reference to the mutation.
const ref = serverSettleRefundRef(serverSettleRefundVars);
// Variables can be defined inline as well.
const ref = serverSettleRefundRef({ operationId: ..., tenantId: ..., refundId: ..., refundRef: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverSettleRefundRef(dataConnect, serverSettleRefundVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.refund_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.refund_update);
  console.log(data.auditEvent_insert);
});
```

## ServerMarkRefundPending
You can execute the `ServerMarkRefundPending` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverMarkRefundPending(vars: ServerMarkRefundPendingVariables): MutationPromise<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;

interface ServerMarkRefundPendingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerMarkRefundPendingVariables): MutationRef<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;
}
export const serverMarkRefundPendingRef: ServerMarkRefundPendingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverMarkRefundPending(dc: DataConnect, vars: ServerMarkRefundPendingVariables): MutationPromise<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;

interface ServerMarkRefundPendingRef {
  ...
  (dc: DataConnect, vars: ServerMarkRefundPendingVariables): MutationRef<ServerMarkRefundPendingData, ServerMarkRefundPendingVariables>;
}
export const serverMarkRefundPendingRef: ServerMarkRefundPendingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverMarkRefundPendingRef:
```typescript
const name = serverMarkRefundPendingRef.operationName;
console.log(name);
```

### Variables
The `ServerMarkRefundPending` mutation requires an argument of type `ServerMarkRefundPendingVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerMarkRefundPendingVariables {
  operationId: UUIDString;
  refundId: UUIDString;
  refundRef: string;
}
```
### Return Type
Recall that executing the `ServerMarkRefundPending` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerMarkRefundPendingData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerMarkRefundPendingData {
  paymentOperation_updateMany: number;
  refund_updateMany: number;
}
```
### Using `ServerMarkRefundPending`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverMarkRefundPending, ServerMarkRefundPendingVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerMarkRefundPending` mutation requires an argument of type `ServerMarkRefundPendingVariables`:
const serverMarkRefundPendingVars: ServerMarkRefundPendingVariables = {
  operationId: ..., 
  refundId: ..., 
  refundRef: ..., 
};

// Call the `serverMarkRefundPending()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverMarkRefundPending(serverMarkRefundPendingVars);
// Variables can be defined inline as well.
const { data } = await serverMarkRefundPending({ operationId: ..., refundId: ..., refundRef: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverMarkRefundPending(dataConnect, serverMarkRefundPendingVars);

console.log(data.paymentOperation_updateMany);
console.log(data.refund_updateMany);

// Or, you can use the `Promise` API.
serverMarkRefundPending(serverMarkRefundPendingVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.refund_updateMany);
});
```

### Using `ServerMarkRefundPending`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverMarkRefundPendingRef, ServerMarkRefundPendingVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerMarkRefundPending` mutation requires an argument of type `ServerMarkRefundPendingVariables`:
const serverMarkRefundPendingVars: ServerMarkRefundPendingVariables = {
  operationId: ..., 
  refundId: ..., 
  refundRef: ..., 
};

// Call the `serverMarkRefundPendingRef()` function to get a reference to the mutation.
const ref = serverMarkRefundPendingRef(serverMarkRefundPendingVars);
// Variables can be defined inline as well.
const ref = serverMarkRefundPendingRef({ operationId: ..., refundId: ..., refundRef: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverMarkRefundPendingRef(dataConnect, serverMarkRefundPendingVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.refund_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.refund_updateMany);
});
```

## ServerRejectRefund
You can execute the `ServerRejectRefund` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverRejectRefund(vars: ServerRejectRefundVariables): MutationPromise<ServerRejectRefundData, ServerRejectRefundVariables>;

interface ServerRejectRefundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRejectRefundVariables): MutationRef<ServerRejectRefundData, ServerRejectRefundVariables>;
}
export const serverRejectRefundRef: ServerRejectRefundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverRejectRefund(dc: DataConnect, vars: ServerRejectRefundVariables): MutationPromise<ServerRejectRefundData, ServerRejectRefundVariables>;

interface ServerRejectRefundRef {
  ...
  (dc: DataConnect, vars: ServerRejectRefundVariables): MutationRef<ServerRejectRefundData, ServerRejectRefundVariables>;
}
export const serverRejectRefundRef: ServerRejectRefundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverRejectRefundRef:
```typescript
const name = serverRejectRefundRef.operationName;
console.log(name);
```

### Variables
The `ServerRejectRefund` mutation requires an argument of type `ServerRejectRefundVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerRejectRefundVariables {
  operationId: UUIDString;
  tenantId: UUIDString;
  refundId: UUIDString;
  failureCode: string;
  actorId: string;
}
```
### Return Type
Recall that executing the `ServerRejectRefund` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerRejectRefundData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerRejectRefundData {
  paymentOperation_updateMany: number;
  refund_update?: Refund_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerRejectRefund`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverRejectRefund, ServerRejectRefundVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRejectRefund` mutation requires an argument of type `ServerRejectRefundVariables`:
const serverRejectRefundVars: ServerRejectRefundVariables = {
  operationId: ..., 
  tenantId: ..., 
  refundId: ..., 
  failureCode: ..., 
  actorId: ..., 
};

// Call the `serverRejectRefund()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverRejectRefund(serverRejectRefundVars);
// Variables can be defined inline as well.
const { data } = await serverRejectRefund({ operationId: ..., tenantId: ..., refundId: ..., failureCode: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverRejectRefund(dataConnect, serverRejectRefundVars);

console.log(data.paymentOperation_updateMany);
console.log(data.refund_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverRejectRefund(serverRejectRefundVars).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.refund_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerRejectRefund`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverRejectRefundRef, ServerRejectRefundVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRejectRefund` mutation requires an argument of type `ServerRejectRefundVariables`:
const serverRejectRefundVars: ServerRejectRefundVariables = {
  operationId: ..., 
  tenantId: ..., 
  refundId: ..., 
  failureCode: ..., 
  actorId: ..., 
};

// Call the `serverRejectRefundRef()` function to get a reference to the mutation.
const ref = serverRejectRefundRef(serverRejectRefundVars);
// Variables can be defined inline as well.
const ref = serverRejectRefundRef({ operationId: ..., tenantId: ..., refundId: ..., failureCode: ..., actorId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverRejectRefundRef(dataConnect, serverRejectRefundVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.paymentOperation_updateMany);
console.log(data.refund_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.paymentOperation_updateMany);
  console.log(data.refund_update);
  console.log(data.auditEvent_insert);
});
```

## ServerRecordProviderEvent
You can execute the `ServerRecordProviderEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverRecordProviderEvent(vars: ServerRecordProviderEventVariables): MutationPromise<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;

interface ServerRecordProviderEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRecordProviderEventVariables): MutationRef<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;
}
export const serverRecordProviderEventRef: ServerRecordProviderEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverRecordProviderEvent(dc: DataConnect, vars: ServerRecordProviderEventVariables): MutationPromise<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;

interface ServerRecordProviderEventRef {
  ...
  (dc: DataConnect, vars: ServerRecordProviderEventVariables): MutationRef<ServerRecordProviderEventData, ServerRecordProviderEventVariables>;
}
export const serverRecordProviderEventRef: ServerRecordProviderEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverRecordProviderEventRef:
```typescript
const name = serverRecordProviderEventRef.operationName;
console.log(name);
```

### Variables
The `ServerRecordProviderEvent` mutation requires an argument of type `ServerRecordProviderEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerRecordProviderEventVariables {
  provider: string;
  externalEventId: string;
  type: string;
  payloadHash: string;
  providerRef: string;
}
```
### Return Type
Recall that executing the `ServerRecordProviderEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerRecordProviderEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerRecordProviderEventData {
  providerEvent_insert: ProviderEvent_Key;
}
```
### Using `ServerRecordProviderEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverRecordProviderEvent, ServerRecordProviderEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRecordProviderEvent` mutation requires an argument of type `ServerRecordProviderEventVariables`:
const serverRecordProviderEventVars: ServerRecordProviderEventVariables = {
  provider: ..., 
  externalEventId: ..., 
  type: ..., 
  payloadHash: ..., 
  providerRef: ..., 
};

// Call the `serverRecordProviderEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverRecordProviderEvent(serverRecordProviderEventVars);
// Variables can be defined inline as well.
const { data } = await serverRecordProviderEvent({ provider: ..., externalEventId: ..., type: ..., payloadHash: ..., providerRef: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverRecordProviderEvent(dataConnect, serverRecordProviderEventVars);

console.log(data.providerEvent_insert);

// Or, you can use the `Promise` API.
serverRecordProviderEvent(serverRecordProviderEventVars).then((response) => {
  const data = response.data;
  console.log(data.providerEvent_insert);
});
```

### Using `ServerRecordProviderEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverRecordProviderEventRef, ServerRecordProviderEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRecordProviderEvent` mutation requires an argument of type `ServerRecordProviderEventVariables`:
const serverRecordProviderEventVars: ServerRecordProviderEventVariables = {
  provider: ..., 
  externalEventId: ..., 
  type: ..., 
  payloadHash: ..., 
  providerRef: ..., 
};

// Call the `serverRecordProviderEventRef()` function to get a reference to the mutation.
const ref = serverRecordProviderEventRef(serverRecordProviderEventVars);
// Variables can be defined inline as well.
const ref = serverRecordProviderEventRef({ provider: ..., externalEventId: ..., type: ..., payloadHash: ..., providerRef: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverRecordProviderEventRef(dataConnect, serverRecordProviderEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.providerEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.providerEvent_insert);
});
```

## ServerFinishProviderEvent
You can execute the `ServerFinishProviderEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverFinishProviderEvent(vars: ServerFinishProviderEventVariables): MutationPromise<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;

interface ServerFinishProviderEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFinishProviderEventVariables): MutationRef<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;
}
export const serverFinishProviderEventRef: ServerFinishProviderEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverFinishProviderEvent(dc: DataConnect, vars: ServerFinishProviderEventVariables): MutationPromise<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;

interface ServerFinishProviderEventRef {
  ...
  (dc: DataConnect, vars: ServerFinishProviderEventVariables): MutationRef<ServerFinishProviderEventData, ServerFinishProviderEventVariables>;
}
export const serverFinishProviderEventRef: ServerFinishProviderEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverFinishProviderEventRef:
```typescript
const name = serverFinishProviderEventRef.operationName;
console.log(name);
```

### Variables
The `ServerFinishProviderEvent` mutation requires an argument of type `ServerFinishProviderEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerFinishProviderEventVariables {
  eventId: UUIDString;
  outcome: string;
  tenantId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `ServerFinishProviderEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerFinishProviderEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerFinishProviderEventData {
  providerEvent_update?: ProviderEvent_Key | null;
}
```
### Using `ServerFinishProviderEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverFinishProviderEvent, ServerFinishProviderEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFinishProviderEvent` mutation requires an argument of type `ServerFinishProviderEventVariables`:
const serverFinishProviderEventVars: ServerFinishProviderEventVariables = {
  eventId: ..., 
  outcome: ..., 
  tenantId: ..., // optional
};

// Call the `serverFinishProviderEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverFinishProviderEvent(serverFinishProviderEventVars);
// Variables can be defined inline as well.
const { data } = await serverFinishProviderEvent({ eventId: ..., outcome: ..., tenantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverFinishProviderEvent(dataConnect, serverFinishProviderEventVars);

console.log(data.providerEvent_update);

// Or, you can use the `Promise` API.
serverFinishProviderEvent(serverFinishProviderEventVars).then((response) => {
  const data = response.data;
  console.log(data.providerEvent_update);
});
```

### Using `ServerFinishProviderEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverFinishProviderEventRef, ServerFinishProviderEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFinishProviderEvent` mutation requires an argument of type `ServerFinishProviderEventVariables`:
const serverFinishProviderEventVars: ServerFinishProviderEventVariables = {
  eventId: ..., 
  outcome: ..., 
  tenantId: ..., // optional
};

// Call the `serverFinishProviderEventRef()` function to get a reference to the mutation.
const ref = serverFinishProviderEventRef(serverFinishProviderEventVars);
// Variables can be defined inline as well.
const ref = serverFinishProviderEventRef({ eventId: ..., outcome: ..., tenantId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverFinishProviderEventRef(dataConnect, serverFinishProviderEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.providerEvent_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.providerEvent_update);
});
```

## ServerCompleteOutboxEvent
You can execute the `ServerCompleteOutboxEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverCompleteOutboxEvent(vars: ServerCompleteOutboxEventVariables): MutationPromise<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;

interface ServerCompleteOutboxEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCompleteOutboxEventVariables): MutationRef<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;
}
export const serverCompleteOutboxEventRef: ServerCompleteOutboxEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverCompleteOutboxEvent(dc: DataConnect, vars: ServerCompleteOutboxEventVariables): MutationPromise<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;

interface ServerCompleteOutboxEventRef {
  ...
  (dc: DataConnect, vars: ServerCompleteOutboxEventVariables): MutationRef<ServerCompleteOutboxEventData, ServerCompleteOutboxEventVariables>;
}
export const serverCompleteOutboxEventRef: ServerCompleteOutboxEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverCompleteOutboxEventRef:
```typescript
const name = serverCompleteOutboxEventRef.operationName;
console.log(name);
```

### Variables
The `ServerCompleteOutboxEvent` mutation requires an argument of type `ServerCompleteOutboxEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerCompleteOutboxEventVariables {
  outboxId: UUIDString;
}
```
### Return Type
Recall that executing the `ServerCompleteOutboxEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerCompleteOutboxEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerCompleteOutboxEventData {
  outboxEvent_update?: OutboxEvent_Key | null;
}
```
### Using `ServerCompleteOutboxEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverCompleteOutboxEvent, ServerCompleteOutboxEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCompleteOutboxEvent` mutation requires an argument of type `ServerCompleteOutboxEventVariables`:
const serverCompleteOutboxEventVars: ServerCompleteOutboxEventVariables = {
  outboxId: ..., 
};

// Call the `serverCompleteOutboxEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverCompleteOutboxEvent(serverCompleteOutboxEventVars);
// Variables can be defined inline as well.
const { data } = await serverCompleteOutboxEvent({ outboxId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverCompleteOutboxEvent(dataConnect, serverCompleteOutboxEventVars);

console.log(data.outboxEvent_update);

// Or, you can use the `Promise` API.
serverCompleteOutboxEvent(serverCompleteOutboxEventVars).then((response) => {
  const data = response.data;
  console.log(data.outboxEvent_update);
});
```

### Using `ServerCompleteOutboxEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverCompleteOutboxEventRef, ServerCompleteOutboxEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCompleteOutboxEvent` mutation requires an argument of type `ServerCompleteOutboxEventVariables`:
const serverCompleteOutboxEventVars: ServerCompleteOutboxEventVariables = {
  outboxId: ..., 
};

// Call the `serverCompleteOutboxEventRef()` function to get a reference to the mutation.
const ref = serverCompleteOutboxEventRef(serverCompleteOutboxEventVars);
// Variables can be defined inline as well.
const ref = serverCompleteOutboxEventRef({ outboxId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverCompleteOutboxEventRef(dataConnect, serverCompleteOutboxEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.outboxEvent_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.outboxEvent_update);
});
```

## ServerRetryOutboxEvent
You can execute the `ServerRetryOutboxEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverRetryOutboxEvent(vars: ServerRetryOutboxEventVariables): MutationPromise<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;

interface ServerRetryOutboxEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRetryOutboxEventVariables): MutationRef<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;
}
export const serverRetryOutboxEventRef: ServerRetryOutboxEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverRetryOutboxEvent(dc: DataConnect, vars: ServerRetryOutboxEventVariables): MutationPromise<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;

interface ServerRetryOutboxEventRef {
  ...
  (dc: DataConnect, vars: ServerRetryOutboxEventVariables): MutationRef<ServerRetryOutboxEventData, ServerRetryOutboxEventVariables>;
}
export const serverRetryOutboxEventRef: ServerRetryOutboxEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverRetryOutboxEventRef:
```typescript
const name = serverRetryOutboxEventRef.operationName;
console.log(name);
```

### Variables
The `ServerRetryOutboxEvent` mutation requires an argument of type `ServerRetryOutboxEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerRetryOutboxEventVariables {
  outboxId: UUIDString;
  nextAttemptAt: TimestampString;
  lastError: string;
}
```
### Return Type
Recall that executing the `ServerRetryOutboxEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerRetryOutboxEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerRetryOutboxEventData {
  outboxEvent_update?: OutboxEvent_Key | null;
}
```
### Using `ServerRetryOutboxEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverRetryOutboxEvent, ServerRetryOutboxEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRetryOutboxEvent` mutation requires an argument of type `ServerRetryOutboxEventVariables`:
const serverRetryOutboxEventVars: ServerRetryOutboxEventVariables = {
  outboxId: ..., 
  nextAttemptAt: ..., 
  lastError: ..., 
};

// Call the `serverRetryOutboxEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverRetryOutboxEvent(serverRetryOutboxEventVars);
// Variables can be defined inline as well.
const { data } = await serverRetryOutboxEvent({ outboxId: ..., nextAttemptAt: ..., lastError: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverRetryOutboxEvent(dataConnect, serverRetryOutboxEventVars);

console.log(data.outboxEvent_update);

// Or, you can use the `Promise` API.
serverRetryOutboxEvent(serverRetryOutboxEventVars).then((response) => {
  const data = response.data;
  console.log(data.outboxEvent_update);
});
```

### Using `ServerRetryOutboxEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverRetryOutboxEventRef, ServerRetryOutboxEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRetryOutboxEvent` mutation requires an argument of type `ServerRetryOutboxEventVariables`:
const serverRetryOutboxEventVars: ServerRetryOutboxEventVariables = {
  outboxId: ..., 
  nextAttemptAt: ..., 
  lastError: ..., 
};

// Call the `serverRetryOutboxEventRef()` function to get a reference to the mutation.
const ref = serverRetryOutboxEventRef(serverRetryOutboxEventVars);
// Variables can be defined inline as well.
const ref = serverRetryOutboxEventRef({ outboxId: ..., nextAttemptAt: ..., lastError: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverRetryOutboxEventRef(dataConnect, serverRetryOutboxEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.outboxEvent_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.outboxEvent_update);
});
```

## ServerFailOutboxEvent
You can execute the `ServerFailOutboxEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverFailOutboxEvent(vars: ServerFailOutboxEventVariables): MutationPromise<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;

interface ServerFailOutboxEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerFailOutboxEventVariables): MutationRef<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;
}
export const serverFailOutboxEventRef: ServerFailOutboxEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverFailOutboxEvent(dc: DataConnect, vars: ServerFailOutboxEventVariables): MutationPromise<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;

interface ServerFailOutboxEventRef {
  ...
  (dc: DataConnect, vars: ServerFailOutboxEventVariables): MutationRef<ServerFailOutboxEventData, ServerFailOutboxEventVariables>;
}
export const serverFailOutboxEventRef: ServerFailOutboxEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverFailOutboxEventRef:
```typescript
const name = serverFailOutboxEventRef.operationName;
console.log(name);
```

### Variables
The `ServerFailOutboxEvent` mutation requires an argument of type `ServerFailOutboxEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerFailOutboxEventVariables {
  outboxId: UUIDString;
  lastError: string;
}
```
### Return Type
Recall that executing the `ServerFailOutboxEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerFailOutboxEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerFailOutboxEventData {
  outboxEvent_update?: OutboxEvent_Key | null;
}
```
### Using `ServerFailOutboxEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverFailOutboxEvent, ServerFailOutboxEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFailOutboxEvent` mutation requires an argument of type `ServerFailOutboxEventVariables`:
const serverFailOutboxEventVars: ServerFailOutboxEventVariables = {
  outboxId: ..., 
  lastError: ..., 
};

// Call the `serverFailOutboxEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverFailOutboxEvent(serverFailOutboxEventVars);
// Variables can be defined inline as well.
const { data } = await serverFailOutboxEvent({ outboxId: ..., lastError: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverFailOutboxEvent(dataConnect, serverFailOutboxEventVars);

console.log(data.outboxEvent_update);

// Or, you can use the `Promise` API.
serverFailOutboxEvent(serverFailOutboxEventVars).then((response) => {
  const data = response.data;
  console.log(data.outboxEvent_update);
});
```

### Using `ServerFailOutboxEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverFailOutboxEventRef, ServerFailOutboxEventVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerFailOutboxEvent` mutation requires an argument of type `ServerFailOutboxEventVariables`:
const serverFailOutboxEventVars: ServerFailOutboxEventVariables = {
  outboxId: ..., 
  lastError: ..., 
};

// Call the `serverFailOutboxEventRef()` function to get a reference to the mutation.
const ref = serverFailOutboxEventRef(serverFailOutboxEventVars);
// Variables can be defined inline as well.
const ref = serverFailOutboxEventRef({ outboxId: ..., lastError: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverFailOutboxEventRef(dataConnect, serverFailOutboxEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.outboxEvent_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.outboxEvent_update);
});
```

## PickUpOrderItem
You can execute the `PickUpOrderItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
pickUpOrderItem(vars: PickUpOrderItemVariables): MutationPromise<PickUpOrderItemData, PickUpOrderItemVariables>;

interface PickUpOrderItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PickUpOrderItemVariables): MutationRef<PickUpOrderItemData, PickUpOrderItemVariables>;
}
export const pickUpOrderItemRef: PickUpOrderItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
pickUpOrderItem(dc: DataConnect, vars: PickUpOrderItemVariables): MutationPromise<PickUpOrderItemData, PickUpOrderItemVariables>;

interface PickUpOrderItemRef {
  ...
  (dc: DataConnect, vars: PickUpOrderItemVariables): MutationRef<PickUpOrderItemData, PickUpOrderItemVariables>;
}
export const pickUpOrderItemRef: PickUpOrderItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the pickUpOrderItemRef:
```typescript
const name = pickUpOrderItemRef.operationName;
console.log(name);
```

### Variables
The `PickUpOrderItem` mutation requires an argument of type `PickUpOrderItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PickUpOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}
```
### Return Type
Recall that executing the `PickUpOrderItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PickUpOrderItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface PickUpOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `PickUpOrderItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, pickUpOrderItem, PickUpOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `PickUpOrderItem` mutation requires an argument of type `PickUpOrderItemVariables`:
const pickUpOrderItemVars: PickUpOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `pickUpOrderItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await pickUpOrderItem(pickUpOrderItemVars);
// Variables can be defined inline as well.
const { data } = await pickUpOrderItem({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await pickUpOrderItem(dataConnect, pickUpOrderItemVars);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
pickUpOrderItem(pickUpOrderItemVars).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `PickUpOrderItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, pickUpOrderItemRef, PickUpOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `PickUpOrderItem` mutation requires an argument of type `PickUpOrderItemVariables`:
const pickUpOrderItemVars: PickUpOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `pickUpOrderItemRef()` function to get a reference to the mutation.
const ref = pickUpOrderItemRef(pickUpOrderItemVars);
// Variables can be defined inline as well.
const ref = pickUpOrderItemRef({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = pickUpOrderItemRef(dataConnect, pickUpOrderItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

## DeliverOrderItem
You can execute the `DeliverOrderItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deliverOrderItem(vars: DeliverOrderItemVariables): MutationPromise<DeliverOrderItemData, DeliverOrderItemVariables>;

interface DeliverOrderItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeliverOrderItemVariables): MutationRef<DeliverOrderItemData, DeliverOrderItemVariables>;
}
export const deliverOrderItemRef: DeliverOrderItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deliverOrderItem(dc: DataConnect, vars: DeliverOrderItemVariables): MutationPromise<DeliverOrderItemData, DeliverOrderItemVariables>;

interface DeliverOrderItemRef {
  ...
  (dc: DataConnect, vars: DeliverOrderItemVariables): MutationRef<DeliverOrderItemData, DeliverOrderItemVariables>;
}
export const deliverOrderItemRef: DeliverOrderItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deliverOrderItemRef:
```typescript
const name = deliverOrderItemRef.operationName;
console.log(name);
```

### Variables
The `DeliverOrderItem` mutation requires an argument of type `DeliverOrderItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeliverOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
}
```
### Return Type
Recall that executing the `DeliverOrderItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeliverOrderItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeliverOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `DeliverOrderItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deliverOrderItem, DeliverOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `DeliverOrderItem` mutation requires an argument of type `DeliverOrderItemVariables`:
const deliverOrderItemVars: DeliverOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `deliverOrderItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deliverOrderItem(deliverOrderItemVars);
// Variables can be defined inline as well.
const { data } = await deliverOrderItem({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deliverOrderItem(dataConnect, deliverOrderItemVars);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
deliverOrderItem(deliverOrderItemVars).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `DeliverOrderItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deliverOrderItemRef, DeliverOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `DeliverOrderItem` mutation requires an argument of type `DeliverOrderItemVariables`:
const deliverOrderItemVars: DeliverOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
};

// Call the `deliverOrderItemRef()` function to get a reference to the mutation.
const ref = deliverOrderItemRef(deliverOrderItemVars);
// Variables can be defined inline as well.
const ref = deliverOrderItemRef({ tenantId: ..., branchId: ..., itemId: ..., version: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deliverOrderItemRef(dataConnect, deliverOrderItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

## DeliverOrderItemDirectly
You can execute the `DeliverOrderItemDirectly` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deliverOrderItemDirectly(vars: DeliverOrderItemDirectlyVariables): MutationPromise<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;

interface DeliverOrderItemDirectlyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeliverOrderItemDirectlyVariables): MutationRef<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;
}
export const deliverOrderItemDirectlyRef: DeliverOrderItemDirectlyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deliverOrderItemDirectly(dc: DataConnect, vars: DeliverOrderItemDirectlyVariables): MutationPromise<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;

interface DeliverOrderItemDirectlyRef {
  ...
  (dc: DataConnect, vars: DeliverOrderItemDirectlyVariables): MutationRef<DeliverOrderItemDirectlyData, DeliverOrderItemDirectlyVariables>;
}
export const deliverOrderItemDirectlyRef: DeliverOrderItemDirectlyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deliverOrderItemDirectlyRef:
```typescript
const name = deliverOrderItemDirectlyRef.operationName;
console.log(name);
```

### Variables
The `DeliverOrderItemDirectly` mutation requires an argument of type `DeliverOrderItemDirectlyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeliverOrderItemDirectlyVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
  reason: string;
}
```
### Return Type
Recall that executing the `DeliverOrderItemDirectly` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeliverOrderItemDirectlyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeliverOrderItemDirectlyData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `DeliverOrderItemDirectly`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deliverOrderItemDirectly, DeliverOrderItemDirectlyVariables } from '@tavelyo/dataconnect-sdk';

// The `DeliverOrderItemDirectly` mutation requires an argument of type `DeliverOrderItemDirectlyVariables`:
const deliverOrderItemDirectlyVars: DeliverOrderItemDirectlyVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
  reason: ..., 
};

// Call the `deliverOrderItemDirectly()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deliverOrderItemDirectly(deliverOrderItemDirectlyVars);
// Variables can be defined inline as well.
const { data } = await deliverOrderItemDirectly({ tenantId: ..., branchId: ..., itemId: ..., version: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deliverOrderItemDirectly(dataConnect, deliverOrderItemDirectlyVars);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
deliverOrderItemDirectly(deliverOrderItemDirectlyVars).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `DeliverOrderItemDirectly`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deliverOrderItemDirectlyRef, DeliverOrderItemDirectlyVariables } from '@tavelyo/dataconnect-sdk';

// The `DeliverOrderItemDirectly` mutation requires an argument of type `DeliverOrderItemDirectlyVariables`:
const deliverOrderItemDirectlyVars: DeliverOrderItemDirectlyVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
  reason: ..., 
};

// Call the `deliverOrderItemDirectlyRef()` function to get a reference to the mutation.
const ref = deliverOrderItemDirectlyRef(deliverOrderItemDirectlyVars);
// Variables can be defined inline as well.
const ref = deliverOrderItemDirectlyRef({ tenantId: ..., branchId: ..., itemId: ..., version: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deliverOrderItemDirectlyRef(dataConnect, deliverOrderItemDirectlyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

## CancelOrderItem
You can execute the `CancelOrderItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
cancelOrderItem(vars: CancelOrderItemVariables): MutationPromise<CancelOrderItemData, CancelOrderItemVariables>;

interface CancelOrderItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelOrderItemVariables): MutationRef<CancelOrderItemData, CancelOrderItemVariables>;
}
export const cancelOrderItemRef: CancelOrderItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
cancelOrderItem(dc: DataConnect, vars: CancelOrderItemVariables): MutationPromise<CancelOrderItemData, CancelOrderItemVariables>;

interface CancelOrderItemRef {
  ...
  (dc: DataConnect, vars: CancelOrderItemVariables): MutationRef<CancelOrderItemData, CancelOrderItemVariables>;
}
export const cancelOrderItemRef: CancelOrderItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the cancelOrderItemRef:
```typescript
const name = cancelOrderItemRef.operationName;
console.log(name);
```

### Variables
The `CancelOrderItem` mutation requires an argument of type `CancelOrderItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CancelOrderItemVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  itemId: UUIDString;
  version: number;
  reason: string;
}
```
### Return Type
Recall that executing the `CancelOrderItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CancelOrderItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CancelOrderItemData {
  orderItem_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CancelOrderItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, cancelOrderItem, CancelOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `CancelOrderItem` mutation requires an argument of type `CancelOrderItemVariables`:
const cancelOrderItemVars: CancelOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
  reason: ..., 
};

// Call the `cancelOrderItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await cancelOrderItem(cancelOrderItemVars);
// Variables can be defined inline as well.
const { data } = await cancelOrderItem({ tenantId: ..., branchId: ..., itemId: ..., version: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await cancelOrderItem(dataConnect, cancelOrderItemVars);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
cancelOrderItem(cancelOrderItemVars).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `CancelOrderItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, cancelOrderItemRef, CancelOrderItemVariables } from '@tavelyo/dataconnect-sdk';

// The `CancelOrderItem` mutation requires an argument of type `CancelOrderItemVariables`:
const cancelOrderItemVars: CancelOrderItemVariables = {
  tenantId: ..., 
  branchId: ..., 
  itemId: ..., 
  version: ..., 
  reason: ..., 
};

// Call the `cancelOrderItemRef()` function to get a reference to the mutation.
const ref = cancelOrderItemRef(cancelOrderItemVars);
// Variables can be defined inline as well.
const ref = cancelOrderItemRef({ tenantId: ..., branchId: ..., itemId: ..., version: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = cancelOrderItemRef(dataConnect, cancelOrderItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderItem_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItem_updateMany);
  console.log(data.auditEvent_insert);
});
```

## AttendServiceRequest
You can execute the `AttendServiceRequest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
attendServiceRequest(vars: AttendServiceRequestVariables): MutationPromise<AttendServiceRequestData, AttendServiceRequestVariables>;

interface AttendServiceRequestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AttendServiceRequestVariables): MutationRef<AttendServiceRequestData, AttendServiceRequestVariables>;
}
export const attendServiceRequestRef: AttendServiceRequestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
attendServiceRequest(dc: DataConnect, vars: AttendServiceRequestVariables): MutationPromise<AttendServiceRequestData, AttendServiceRequestVariables>;

interface AttendServiceRequestRef {
  ...
  (dc: DataConnect, vars: AttendServiceRequestVariables): MutationRef<AttendServiceRequestData, AttendServiceRequestVariables>;
}
export const attendServiceRequestRef: AttendServiceRequestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the attendServiceRequestRef:
```typescript
const name = attendServiceRequestRef.operationName;
console.log(name);
```

### Variables
The `AttendServiceRequest` mutation requires an argument of type `AttendServiceRequestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AttendServiceRequestVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  requestId: UUIDString;
}
```
### Return Type
Recall that executing the `AttendServiceRequest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AttendServiceRequestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AttendServiceRequestData {
  serviceRequest_update?: ServiceRequest_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `AttendServiceRequest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, attendServiceRequest, AttendServiceRequestVariables } from '@tavelyo/dataconnect-sdk';

// The `AttendServiceRequest` mutation requires an argument of type `AttendServiceRequestVariables`:
const attendServiceRequestVars: AttendServiceRequestVariables = {
  tenantId: ..., 
  branchId: ..., 
  requestId: ..., 
};

// Call the `attendServiceRequest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await attendServiceRequest(attendServiceRequestVars);
// Variables can be defined inline as well.
const { data } = await attendServiceRequest({ tenantId: ..., branchId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await attendServiceRequest(dataConnect, attendServiceRequestVars);

console.log(data.serviceRequest_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
attendServiceRequest(attendServiceRequestVars).then((response) => {
  const data = response.data;
  console.log(data.serviceRequest_update);
  console.log(data.auditEvent_insert);
});
```

### Using `AttendServiceRequest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, attendServiceRequestRef, AttendServiceRequestVariables } from '@tavelyo/dataconnect-sdk';

// The `AttendServiceRequest` mutation requires an argument of type `AttendServiceRequestVariables`:
const attendServiceRequestVars: AttendServiceRequestVariables = {
  tenantId: ..., 
  branchId: ..., 
  requestId: ..., 
};

// Call the `attendServiceRequestRef()` function to get a reference to the mutation.
const ref = attendServiceRequestRef(attendServiceRequestVars);
// Variables can be defined inline as well.
const ref = attendServiceRequestRef({ tenantId: ..., branchId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = attendServiceRequestRef(dataConnect, attendServiceRequestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.serviceRequest_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.serviceRequest_update);
  console.log(data.auditEvent_insert);
});
```

## OpenTableSession
You can execute the `OpenTableSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
openTableSession(vars: OpenTableSessionVariables): MutationPromise<OpenTableSessionData, OpenTableSessionVariables>;

interface OpenTableSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: OpenTableSessionVariables): MutationRef<OpenTableSessionData, OpenTableSessionVariables>;
}
export const openTableSessionRef: OpenTableSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
openTableSession(dc: DataConnect, vars: OpenTableSessionVariables): MutationPromise<OpenTableSessionData, OpenTableSessionVariables>;

interface OpenTableSessionRef {
  ...
  (dc: DataConnect, vars: OpenTableSessionVariables): MutationRef<OpenTableSessionData, OpenTableSessionVariables>;
}
export const openTableSessionRef: OpenTableSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the openTableSessionRef:
```typescript
const name = openTableSessionRef.operationName;
console.log(name);
```

### Variables
The `OpenTableSession` mutation requires an argument of type `OpenTableSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface OpenTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  tableId: UUIDString;
}
```
### Return Type
Recall that executing the `OpenTableSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `OpenTableSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface OpenTableSessionData {
  tableSession_insert: TableSession_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `OpenTableSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, openTableSession, OpenTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `OpenTableSession` mutation requires an argument of type `OpenTableSessionVariables`:
const openTableSessionVars: OpenTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  tableId: ..., 
};

// Call the `openTableSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await openTableSession(openTableSessionVars);
// Variables can be defined inline as well.
const { data } = await openTableSession({ tenantId: ..., branchId: ..., tableId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await openTableSession(dataConnect, openTableSessionVars);

console.log(data.tableSession_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
openTableSession(openTableSessionVars).then((response) => {
  const data = response.data;
  console.log(data.tableSession_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `OpenTableSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, openTableSessionRef, OpenTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `OpenTableSession` mutation requires an argument of type `OpenTableSessionVariables`:
const openTableSessionVars: OpenTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  tableId: ..., 
};

// Call the `openTableSessionRef()` function to get a reference to the mutation.
const ref = openTableSessionRef(openTableSessionVars);
// Variables can be defined inline as well.
const ref = openTableSessionRef({ tenantId: ..., branchId: ..., tableId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = openTableSessionRef(dataConnect, openTableSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tableSession_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tableSession_insert);
  console.log(data.auditEvent_insert);
});
```

## CloseTableSession
You can execute the `CloseTableSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
closeTableSession(vars: CloseTableSessionVariables): MutationPromise<CloseTableSessionData, CloseTableSessionVariables>;

interface CloseTableSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CloseTableSessionVariables): MutationRef<CloseTableSessionData, CloseTableSessionVariables>;
}
export const closeTableSessionRef: CloseTableSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
closeTableSession(dc: DataConnect, vars: CloseTableSessionVariables): MutationPromise<CloseTableSessionData, CloseTableSessionVariables>;

interface CloseTableSessionRef {
  ...
  (dc: DataConnect, vars: CloseTableSessionVariables): MutationRef<CloseTableSessionData, CloseTableSessionVariables>;
}
export const closeTableSessionRef: CloseTableSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the closeTableSessionRef:
```typescript
const name = closeTableSessionRef.operationName;
console.log(name);
```

### Variables
The `CloseTableSession` mutation requires an argument of type `CloseTableSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CloseTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
}
```
### Return Type
Recall that executing the `CloseTableSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CloseTableSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CloseTableSessionData {
  tableSession_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CloseTableSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, closeTableSession, CloseTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `CloseTableSession` mutation requires an argument of type `CloseTableSessionVariables`:
const closeTableSessionVars: CloseTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `closeTableSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await closeTableSession(closeTableSessionVars);
// Variables can be defined inline as well.
const { data } = await closeTableSession({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await closeTableSession(dataConnect, closeTableSessionVars);

console.log(data.tableSession_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
closeTableSession(closeTableSessionVars).then((response) => {
  const data = response.data;
  console.log(data.tableSession_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `CloseTableSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, closeTableSessionRef, CloseTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `CloseTableSession` mutation requires an argument of type `CloseTableSessionVariables`:
const closeTableSessionVars: CloseTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
};

// Call the `closeTableSessionRef()` function to get a reference to the mutation.
const ref = closeTableSessionRef(closeTableSessionVars);
// Variables can be defined inline as well.
const ref = closeTableSessionRef({ tenantId: ..., branchId: ..., sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = closeTableSessionRef(dataConnect, closeTableSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tableSession_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tableSession_updateMany);
  console.log(data.auditEvent_insert);
});
```

## RemoveParticipant
You can execute the `RemoveParticipant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
removeParticipant(vars: RemoveParticipantVariables): MutationPromise<RemoveParticipantData, RemoveParticipantVariables>;

interface RemoveParticipantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RemoveParticipantVariables): MutationRef<RemoveParticipantData, RemoveParticipantVariables>;
}
export const removeParticipantRef: RemoveParticipantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
removeParticipant(dc: DataConnect, vars: RemoveParticipantVariables): MutationPromise<RemoveParticipantData, RemoveParticipantVariables>;

interface RemoveParticipantRef {
  ...
  (dc: DataConnect, vars: RemoveParticipantVariables): MutationRef<RemoveParticipantData, RemoveParticipantVariables>;
}
export const removeParticipantRef: RemoveParticipantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the removeParticipantRef:
```typescript
const name = removeParticipantRef.operationName;
console.log(name);
```

### Variables
The `RemoveParticipant` mutation requires an argument of type `RemoveParticipantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RemoveParticipantVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  participantId: UUIDString;
}
```
### Return Type
Recall that executing the `RemoveParticipant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RemoveParticipantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RemoveParticipantData {
  sessionParticipant_update?: SessionParticipant_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `RemoveParticipant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, removeParticipant, RemoveParticipantVariables } from '@tavelyo/dataconnect-sdk';

// The `RemoveParticipant` mutation requires an argument of type `RemoveParticipantVariables`:
const removeParticipantVars: RemoveParticipantVariables = {
  tenantId: ..., 
  branchId: ..., 
  participantId: ..., 
};

// Call the `removeParticipant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await removeParticipant(removeParticipantVars);
// Variables can be defined inline as well.
const { data } = await removeParticipant({ tenantId: ..., branchId: ..., participantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await removeParticipant(dataConnect, removeParticipantVars);

console.log(data.sessionParticipant_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
removeParticipant(removeParticipantVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_update);
  console.log(data.auditEvent_insert);
});
```

### Using `RemoveParticipant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, removeParticipantRef, RemoveParticipantVariables } from '@tavelyo/dataconnect-sdk';

// The `RemoveParticipant` mutation requires an argument of type `RemoveParticipantVariables`:
const removeParticipantVars: RemoveParticipantVariables = {
  tenantId: ..., 
  branchId: ..., 
  participantId: ..., 
};

// Call the `removeParticipantRef()` function to get a reference to the mutation.
const ref = removeParticipantRef(removeParticipantVars);
// Variables can be defined inline as well.
const ref = removeParticipantRef({ tenantId: ..., branchId: ..., participantId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = removeParticipantRef(dataConnect, removeParticipantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sessionParticipant_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_update);
  console.log(data.auditEvent_insert);
});
```

## TransferTableSession
You can execute the `TransferTableSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
transferTableSession(vars: TransferTableSessionVariables): MutationPromise<TransferTableSessionData, TransferTableSessionVariables>;

interface TransferTableSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TransferTableSessionVariables): MutationRef<TransferTableSessionData, TransferTableSessionVariables>;
}
export const transferTableSessionRef: TransferTableSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
transferTableSession(dc: DataConnect, vars: TransferTableSessionVariables): MutationPromise<TransferTableSessionData, TransferTableSessionVariables>;

interface TransferTableSessionRef {
  ...
  (dc: DataConnect, vars: TransferTableSessionVariables): MutationRef<TransferTableSessionData, TransferTableSessionVariables>;
}
export const transferTableSessionRef: TransferTableSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the transferTableSessionRef:
```typescript
const name = transferTableSessionRef.operationName;
console.log(name);
```

### Variables
The `TransferTableSession` mutation requires an argument of type `TransferTableSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TransferTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  sourceId: UUIDString;
  tableId: UUIDString;
}
```
### Return Type
Recall that executing the `TransferTableSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TransferTableSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface TransferTableSessionData {
  moved: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `TransferTableSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, transferTableSession, TransferTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `TransferTableSession` mutation requires an argument of type `TransferTableSessionVariables`:
const transferTableSessionVars: TransferTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  sourceId: ..., 
  tableId: ..., 
};

// Call the `transferTableSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await transferTableSession(transferTableSessionVars);
// Variables can be defined inline as well.
const { data } = await transferTableSession({ tenantId: ..., branchId: ..., sessionId: ..., sourceId: ..., tableId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await transferTableSession(dataConnect, transferTableSessionVars);

console.log(data.moved);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
transferTableSession(transferTableSessionVars).then((response) => {
  const data = response.data;
  console.log(data.moved);
  console.log(data.auditEvent_insert);
});
```

### Using `TransferTableSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, transferTableSessionRef, TransferTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `TransferTableSession` mutation requires an argument of type `TransferTableSessionVariables`:
const transferTableSessionVars: TransferTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  sourceId: ..., 
  tableId: ..., 
};

// Call the `transferTableSessionRef()` function to get a reference to the mutation.
const ref = transferTableSessionRef(transferTableSessionVars);
// Variables can be defined inline as well.
const ref = transferTableSessionRef({ tenantId: ..., branchId: ..., sessionId: ..., sourceId: ..., tableId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = transferTableSessionRef(dataConnect, transferTableSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.moved);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.moved);
  console.log(data.auditEvent_insert);
});
```

## ServerInsertParticipant
You can execute the `ServerInsertParticipant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverInsertParticipant(vars: ServerInsertParticipantVariables): MutationPromise<ServerInsertParticipantData, ServerInsertParticipantVariables>;

interface ServerInsertParticipantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerInsertParticipantVariables): MutationRef<ServerInsertParticipantData, ServerInsertParticipantVariables>;
}
export const serverInsertParticipantRef: ServerInsertParticipantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverInsertParticipant(dc: DataConnect, vars: ServerInsertParticipantVariables): MutationPromise<ServerInsertParticipantData, ServerInsertParticipantVariables>;

interface ServerInsertParticipantRef {
  ...
  (dc: DataConnect, vars: ServerInsertParticipantVariables): MutationRef<ServerInsertParticipantData, ServerInsertParticipantVariables>;
}
export const serverInsertParticipantRef: ServerInsertParticipantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverInsertParticipantRef:
```typescript
const name = serverInsertParticipantRef.operationName;
console.log(name);
```

### Variables
The `ServerInsertParticipant` mutation requires an argument of type `ServerInsertParticipantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerInsertParticipantVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  authUid: string;
  expiresAt: TimestampString;
}
```
### Return Type
Recall that executing the `ServerInsertParticipant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerInsertParticipantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerInsertParticipantData {
  sessionParticipant_insert: SessionParticipant_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerInsertParticipant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverInsertParticipant, ServerInsertParticipantVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerInsertParticipant` mutation requires an argument of type `ServerInsertParticipantVariables`:
const serverInsertParticipantVars: ServerInsertParticipantVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  authUid: ..., 
  expiresAt: ..., 
};

// Call the `serverInsertParticipant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverInsertParticipant(serverInsertParticipantVars);
// Variables can be defined inline as well.
const { data } = await serverInsertParticipant({ tenantId: ..., branchId: ..., sessionId: ..., authUid: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverInsertParticipant(dataConnect, serverInsertParticipantVars);

console.log(data.sessionParticipant_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverInsertParticipant(serverInsertParticipantVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerInsertParticipant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverInsertParticipantRef, ServerInsertParticipantVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerInsertParticipant` mutation requires an argument of type `ServerInsertParticipantVariables`:
const serverInsertParticipantVars: ServerInsertParticipantVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  authUid: ..., 
  expiresAt: ..., 
};

// Call the `serverInsertParticipantRef()` function to get a reference to the mutation.
const ref = serverInsertParticipantRef(serverInsertParticipantVars);
// Variables can be defined inline as well.
const ref = serverInsertParticipantRef({ tenantId: ..., branchId: ..., sessionId: ..., authUid: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverInsertParticipantRef(dataConnect, serverInsertParticipantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sessionParticipant_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_insert);
  console.log(data.auditEvent_insert);
});
```

## ServerRenewParticipant
You can execute the `ServerRenewParticipant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverRenewParticipant(vars: ServerRenewParticipantVariables): MutationPromise<ServerRenewParticipantData, ServerRenewParticipantVariables>;

interface ServerRenewParticipantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRenewParticipantVariables): MutationRef<ServerRenewParticipantData, ServerRenewParticipantVariables>;
}
export const serverRenewParticipantRef: ServerRenewParticipantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverRenewParticipant(dc: DataConnect, vars: ServerRenewParticipantVariables): MutationPromise<ServerRenewParticipantData, ServerRenewParticipantVariables>;

interface ServerRenewParticipantRef {
  ...
  (dc: DataConnect, vars: ServerRenewParticipantVariables): MutationRef<ServerRenewParticipantData, ServerRenewParticipantVariables>;
}
export const serverRenewParticipantRef: ServerRenewParticipantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverRenewParticipantRef:
```typescript
const name = serverRenewParticipantRef.operationName;
console.log(name);
```

### Variables
The `ServerRenewParticipant` mutation requires an argument of type `ServerRenewParticipantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerRenewParticipantVariables {
  participantId: UUIDString;
  expiresAt: TimestampString;
}
```
### Return Type
Recall that executing the `ServerRenewParticipant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerRenewParticipantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerRenewParticipantData {
  sessionParticipant_update?: SessionParticipant_Key | null;
}
```
### Using `ServerRenewParticipant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverRenewParticipant, ServerRenewParticipantVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRenewParticipant` mutation requires an argument of type `ServerRenewParticipantVariables`:
const serverRenewParticipantVars: ServerRenewParticipantVariables = {
  participantId: ..., 
  expiresAt: ..., 
};

// Call the `serverRenewParticipant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverRenewParticipant(serverRenewParticipantVars);
// Variables can be defined inline as well.
const { data } = await serverRenewParticipant({ participantId: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverRenewParticipant(dataConnect, serverRenewParticipantVars);

console.log(data.sessionParticipant_update);

// Or, you can use the `Promise` API.
serverRenewParticipant(serverRenewParticipantVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_update);
});
```

### Using `ServerRenewParticipant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverRenewParticipantRef, ServerRenewParticipantVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRenewParticipant` mutation requires an argument of type `ServerRenewParticipantVariables`:
const serverRenewParticipantVars: ServerRenewParticipantVariables = {
  participantId: ..., 
  expiresAt: ..., 
};

// Call the `serverRenewParticipantRef()` function to get a reference to the mutation.
const ref = serverRenewParticipantRef(serverRenewParticipantVars);
// Variables can be defined inline as well.
const ref = serverRenewParticipantRef({ participantId: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverRenewParticipantRef(dataConnect, serverRenewParticipantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sessionParticipant_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_update);
});
```

## ServerHitRateLimit
You can execute the `ServerHitRateLimit` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverHitRateLimit(vars: ServerHitRateLimitVariables): MutationPromise<ServerHitRateLimitData, ServerHitRateLimitVariables>;

interface ServerHitRateLimitRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerHitRateLimitVariables): MutationRef<ServerHitRateLimitData, ServerHitRateLimitVariables>;
}
export const serverHitRateLimitRef: ServerHitRateLimitRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverHitRateLimit(dc: DataConnect, vars: ServerHitRateLimitVariables): MutationPromise<ServerHitRateLimitData, ServerHitRateLimitVariables>;

interface ServerHitRateLimitRef {
  ...
  (dc: DataConnect, vars: ServerHitRateLimitVariables): MutationRef<ServerHitRateLimitData, ServerHitRateLimitVariables>;
}
export const serverHitRateLimitRef: ServerHitRateLimitRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverHitRateLimitRef:
```typescript
const name = serverHitRateLimitRef.operationName;
console.log(name);
```

### Variables
The `ServerHitRateLimit` mutation requires an argument of type `ServerHitRateLimitVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerHitRateLimitVariables {
  scope: string;
  subject: string;
  since: TimestampString;
  limit: number;
}
```
### Return Type
Recall that executing the `ServerHitRateLimit` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerHitRateLimitData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerHitRateLimitData {
  rateLimitHit_insert: RateLimitHit_Key;
  query?: {
    rateLimitHits: ({
      _count: number;
    })[];
  };
}
```
### Using `ServerHitRateLimit`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverHitRateLimit, ServerHitRateLimitVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerHitRateLimit` mutation requires an argument of type `ServerHitRateLimitVariables`:
const serverHitRateLimitVars: ServerHitRateLimitVariables = {
  scope: ..., 
  subject: ..., 
  since: ..., 
  limit: ..., 
};

// Call the `serverHitRateLimit()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverHitRateLimit(serverHitRateLimitVars);
// Variables can be defined inline as well.
const { data } = await serverHitRateLimit({ scope: ..., subject: ..., since: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverHitRateLimit(dataConnect, serverHitRateLimitVars);

console.log(data.rateLimitHit_insert);
console.log(data.query);

// Or, you can use the `Promise` API.
serverHitRateLimit(serverHitRateLimitVars).then((response) => {
  const data = response.data;
  console.log(data.rateLimitHit_insert);
  console.log(data.query);
});
```

### Using `ServerHitRateLimit`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverHitRateLimitRef, ServerHitRateLimitVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerHitRateLimit` mutation requires an argument of type `ServerHitRateLimitVariables`:
const serverHitRateLimitVars: ServerHitRateLimitVariables = {
  scope: ..., 
  subject: ..., 
  since: ..., 
  limit: ..., 
};

// Call the `serverHitRateLimitRef()` function to get a reference to the mutation.
const ref = serverHitRateLimitRef(serverHitRateLimitVars);
// Variables can be defined inline as well.
const ref = serverHitRateLimitRef({ scope: ..., subject: ..., since: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverHitRateLimitRef(dataConnect, serverHitRateLimitVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.rateLimitHit_insert);
console.log(data.query);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.rateLimitHit_insert);
  console.log(data.query);
});
```

## ServerCreateDefaultStation
You can execute the `ServerCreateDefaultStation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverCreateDefaultStation(vars: ServerCreateDefaultStationVariables): MutationPromise<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;

interface ServerCreateDefaultStationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCreateDefaultStationVariables): MutationRef<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;
}
export const serverCreateDefaultStationRef: ServerCreateDefaultStationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverCreateDefaultStation(dc: DataConnect, vars: ServerCreateDefaultStationVariables): MutationPromise<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;

interface ServerCreateDefaultStationRef {
  ...
  (dc: DataConnect, vars: ServerCreateDefaultStationVariables): MutationRef<ServerCreateDefaultStationData, ServerCreateDefaultStationVariables>;
}
export const serverCreateDefaultStationRef: ServerCreateDefaultStationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverCreateDefaultStationRef:
```typescript
const name = serverCreateDefaultStationRef.operationName;
console.log(name);
```

### Variables
The `ServerCreateDefaultStation` mutation requires an argument of type `ServerCreateDefaultStationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerCreateDefaultStationVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
}
```
### Return Type
Recall that executing the `ServerCreateDefaultStation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerCreateDefaultStationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerCreateDefaultStationData {
  station_insert: Station_Key;
}
```
### Using `ServerCreateDefaultStation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverCreateDefaultStation, ServerCreateDefaultStationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCreateDefaultStation` mutation requires an argument of type `ServerCreateDefaultStationVariables`:
const serverCreateDefaultStationVars: ServerCreateDefaultStationVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `serverCreateDefaultStation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverCreateDefaultStation(serverCreateDefaultStationVars);
// Variables can be defined inline as well.
const { data } = await serverCreateDefaultStation({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverCreateDefaultStation(dataConnect, serverCreateDefaultStationVars);

console.log(data.station_insert);

// Or, you can use the `Promise` API.
serverCreateDefaultStation(serverCreateDefaultStationVars).then((response) => {
  const data = response.data;
  console.log(data.station_insert);
});
```

### Using `ServerCreateDefaultStation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverCreateDefaultStationRef, ServerCreateDefaultStationVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCreateDefaultStation` mutation requires an argument of type `ServerCreateDefaultStationVariables`:
const serverCreateDefaultStationVars: ServerCreateDefaultStationVariables = {
  tenantId: ..., 
  branchId: ..., 
};

// Call the `serverCreateDefaultStationRef()` function to get a reference to the mutation.
const ref = serverCreateDefaultStationRef(serverCreateDefaultStationVars);
// Variables can be defined inline as well.
const ref = serverCreateDefaultStationRef({ tenantId: ..., branchId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverCreateDefaultStationRef(dataConnect, serverCreateDefaultStationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.station_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.station_insert);
});
```

## ServerSendOrderToKitchen
You can execute the `ServerSendOrderToKitchen` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverSendOrderToKitchen(vars: ServerSendOrderToKitchenVariables): MutationPromise<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;

interface ServerSendOrderToKitchenRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSendOrderToKitchenVariables): MutationRef<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;
}
export const serverSendOrderToKitchenRef: ServerSendOrderToKitchenRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverSendOrderToKitchen(dc: DataConnect, vars: ServerSendOrderToKitchenVariables): MutationPromise<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;

interface ServerSendOrderToKitchenRef {
  ...
  (dc: DataConnect, vars: ServerSendOrderToKitchenVariables): MutationRef<ServerSendOrderToKitchenData, ServerSendOrderToKitchenVariables>;
}
export const serverSendOrderToKitchenRef: ServerSendOrderToKitchenRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverSendOrderToKitchenRef:
```typescript
const name = serverSendOrderToKitchenRef.operationName;
console.log(name);
```

### Variables
The `ServerSendOrderToKitchen` mutation requires an argument of type `ServerSendOrderToKitchenVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerSendOrderToKitchenVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerSendOrderToKitchen` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerSendOrderToKitchenData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerSendOrderToKitchenData {
  sessionLock: number;
  order_update?: Order_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerSendOrderToKitchen`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverSendOrderToKitchen, ServerSendOrderToKitchenVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSendOrderToKitchen` mutation requires an argument of type `ServerSendOrderToKitchenVariables`:
const serverSendOrderToKitchenVars: ServerSendOrderToKitchenVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  authUid: ..., 
};

// Call the `serverSendOrderToKitchen()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverSendOrderToKitchen(serverSendOrderToKitchenVars);
// Variables can be defined inline as well.
const { data } = await serverSendOrderToKitchen({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverSendOrderToKitchen(dataConnect, serverSendOrderToKitchenVars);

console.log(data.sessionLock);
console.log(data.order_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverSendOrderToKitchen(serverSendOrderToKitchenVars).then((response) => {
  const data = response.data;
  console.log(data.sessionLock);
  console.log(data.order_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerSendOrderToKitchen`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverSendOrderToKitchenRef, ServerSendOrderToKitchenVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSendOrderToKitchen` mutation requires an argument of type `ServerSendOrderToKitchenVariables`:
const serverSendOrderToKitchenVars: ServerSendOrderToKitchenVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  authUid: ..., 
};

// Call the `serverSendOrderToKitchenRef()` function to get a reference to the mutation.
const ref = serverSendOrderToKitchenRef(serverSendOrderToKitchenVars);
// Variables can be defined inline as well.
const ref = serverSendOrderToKitchenRef({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverSendOrderToKitchenRef(dataConnect, serverSendOrderToKitchenVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sessionLock);
console.log(data.order_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionLock);
  console.log(data.order_update);
  console.log(data.auditEvent_insert);
});
```

## ServerConfirmQuote
You can execute the `ServerConfirmQuote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverConfirmQuote(vars: ServerConfirmQuoteVariables): MutationPromise<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;

interface ServerConfirmQuoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerConfirmQuoteVariables): MutationRef<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;
}
export const serverConfirmQuoteRef: ServerConfirmQuoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverConfirmQuote(dc: DataConnect, vars: ServerConfirmQuoteVariables): MutationPromise<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;

interface ServerConfirmQuoteRef {
  ...
  (dc: DataConnect, vars: ServerConfirmQuoteVariables): MutationRef<ServerConfirmQuoteData, ServerConfirmQuoteVariables>;
}
export const serverConfirmQuoteRef: ServerConfirmQuoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverConfirmQuoteRef:
```typescript
const name = serverConfirmQuoteRef.operationName;
console.log(name);
```

### Variables
The `ServerConfirmQuote` mutation requires an argument of type `ServerConfirmQuoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerConfirmQuoteVariables {
  quoteId: UUIDString;
  tenantId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerConfirmQuote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerConfirmQuoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerConfirmQuoteData {
  orderQuote_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerConfirmQuote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverConfirmQuote, ServerConfirmQuoteVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerConfirmQuote` mutation requires an argument of type `ServerConfirmQuoteVariables`:
const serverConfirmQuoteVars: ServerConfirmQuoteVariables = {
  quoteId: ..., 
  tenantId: ..., 
  authUid: ..., 
};

// Call the `serverConfirmQuote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverConfirmQuote(serverConfirmQuoteVars);
// Variables can be defined inline as well.
const { data } = await serverConfirmQuote({ quoteId: ..., tenantId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverConfirmQuote(dataConnect, serverConfirmQuoteVars);

console.log(data.orderQuote_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverConfirmQuote(serverConfirmQuoteVars).then((response) => {
  const data = response.data;
  console.log(data.orderQuote_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerConfirmQuote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverConfirmQuoteRef, ServerConfirmQuoteVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerConfirmQuote` mutation requires an argument of type `ServerConfirmQuoteVariables`:
const serverConfirmQuoteVars: ServerConfirmQuoteVariables = {
  quoteId: ..., 
  tenantId: ..., 
  authUid: ..., 
};

// Call the `serverConfirmQuoteRef()` function to get a reference to the mutation.
const ref = serverConfirmQuoteRef(serverConfirmQuoteVars);
// Variables can be defined inline as well.
const ref = serverConfirmQuoteRef({ quoteId: ..., tenantId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverConfirmQuoteRef(dataConnect, serverConfirmQuoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderQuote_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderQuote_updateMany);
  console.log(data.auditEvent_insert);
});
```

## ServerRequestOrderApproval
You can execute the `ServerRequestOrderApproval` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverRequestOrderApproval(vars: ServerRequestOrderApprovalVariables): MutationPromise<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;

interface ServerRequestOrderApprovalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerRequestOrderApprovalVariables): MutationRef<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;
}
export const serverRequestOrderApprovalRef: ServerRequestOrderApprovalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverRequestOrderApproval(dc: DataConnect, vars: ServerRequestOrderApprovalVariables): MutationPromise<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;

interface ServerRequestOrderApprovalRef {
  ...
  (dc: DataConnect, vars: ServerRequestOrderApprovalVariables): MutationRef<ServerRequestOrderApprovalData, ServerRequestOrderApprovalVariables>;
}
export const serverRequestOrderApprovalRef: ServerRequestOrderApprovalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverRequestOrderApprovalRef:
```typescript
const name = serverRequestOrderApprovalRef.operationName;
console.log(name);
```

### Variables
The `ServerRequestOrderApproval` mutation requires an argument of type `ServerRequestOrderApprovalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerRequestOrderApprovalVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  orderId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerRequestOrderApproval` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerRequestOrderApprovalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerRequestOrderApprovalData {
  sessionLock: number;
  order_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerRequestOrderApproval`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverRequestOrderApproval, ServerRequestOrderApprovalVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRequestOrderApproval` mutation requires an argument of type `ServerRequestOrderApprovalVariables`:
const serverRequestOrderApprovalVars: ServerRequestOrderApprovalVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  authUid: ..., 
};

// Call the `serverRequestOrderApproval()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverRequestOrderApproval(serverRequestOrderApprovalVars);
// Variables can be defined inline as well.
const { data } = await serverRequestOrderApproval({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverRequestOrderApproval(dataConnect, serverRequestOrderApprovalVars);

console.log(data.sessionLock);
console.log(data.order_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverRequestOrderApproval(serverRequestOrderApprovalVars).then((response) => {
  const data = response.data;
  console.log(data.sessionLock);
  console.log(data.order_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerRequestOrderApproval`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverRequestOrderApprovalRef, ServerRequestOrderApprovalVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerRequestOrderApproval` mutation requires an argument of type `ServerRequestOrderApprovalVariables`:
const serverRequestOrderApprovalVars: ServerRequestOrderApprovalVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  orderId: ..., 
  authUid: ..., 
};

// Call the `serverRequestOrderApprovalRef()` function to get a reference to the mutation.
const ref = serverRequestOrderApprovalRef(serverRequestOrderApprovalVars);
// Variables can be defined inline as well.
const ref = serverRequestOrderApprovalRef({ tenantId: ..., branchId: ..., sessionId: ..., orderId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverRequestOrderApprovalRef(dataConnect, serverRequestOrderApprovalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.sessionLock);
console.log(data.order_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionLock);
  console.log(data.order_updateMany);
  console.log(data.auditEvent_insert);
});
```

## ServerCreateServiceRequest
You can execute the `ServerCreateServiceRequest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverCreateServiceRequest(vars: ServerCreateServiceRequestVariables): MutationPromise<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;

interface ServerCreateServiceRequestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCreateServiceRequestVariables): MutationRef<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;
}
export const serverCreateServiceRequestRef: ServerCreateServiceRequestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverCreateServiceRequest(dc: DataConnect, vars: ServerCreateServiceRequestVariables): MutationPromise<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;

interface ServerCreateServiceRequestRef {
  ...
  (dc: DataConnect, vars: ServerCreateServiceRequestVariables): MutationRef<ServerCreateServiceRequestData, ServerCreateServiceRequestVariables>;
}
export const serverCreateServiceRequestRef: ServerCreateServiceRequestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverCreateServiceRequestRef:
```typescript
const name = serverCreateServiceRequestRef.operationName;
console.log(name);
```

### Variables
The `ServerCreateServiceRequest` mutation requires an argument of type `ServerCreateServiceRequestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerCreateServiceRequestVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  participantId: UUIDString;
  authUid: string;
  kind: ServiceRequestKind;
}
```
### Return Type
Recall that executing the `ServerCreateServiceRequest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerCreateServiceRequestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerCreateServiceRequestData {
  serviceRequest_insert: ServiceRequest_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerCreateServiceRequest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverCreateServiceRequest, ServerCreateServiceRequestVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCreateServiceRequest` mutation requires an argument of type `ServerCreateServiceRequestVariables`:
const serverCreateServiceRequestVars: ServerCreateServiceRequestVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  participantId: ..., 
  authUid: ..., 
  kind: ..., 
};

// Call the `serverCreateServiceRequest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverCreateServiceRequest(serverCreateServiceRequestVars);
// Variables can be defined inline as well.
const { data } = await serverCreateServiceRequest({ tenantId: ..., branchId: ..., sessionId: ..., participantId: ..., authUid: ..., kind: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverCreateServiceRequest(dataConnect, serverCreateServiceRequestVars);

console.log(data.serviceRequest_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverCreateServiceRequest(serverCreateServiceRequestVars).then((response) => {
  const data = response.data;
  console.log(data.serviceRequest_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerCreateServiceRequest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverCreateServiceRequestRef, ServerCreateServiceRequestVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCreateServiceRequest` mutation requires an argument of type `ServerCreateServiceRequestVariables`:
const serverCreateServiceRequestVars: ServerCreateServiceRequestVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  participantId: ..., 
  authUid: ..., 
  kind: ..., 
};

// Call the `serverCreateServiceRequestRef()` function to get a reference to the mutation.
const ref = serverCreateServiceRequestRef(serverCreateServiceRequestVars);
// Variables can be defined inline as well.
const ref = serverCreateServiceRequestRef({ tenantId: ..., branchId: ..., sessionId: ..., participantId: ..., authUid: ..., kind: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverCreateServiceRequestRef(dataConnect, serverCreateServiceRequestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.serviceRequest_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.serviceRequest_insert);
  console.log(data.auditEvent_insert);
});
```

## ServerCloseTableSession
You can execute the `ServerCloseTableSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverCloseTableSession(vars: ServerCloseTableSessionVariables): MutationPromise<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;

interface ServerCloseTableSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCloseTableSessionVariables): MutationRef<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;
}
export const serverCloseTableSessionRef: ServerCloseTableSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverCloseTableSession(dc: DataConnect, vars: ServerCloseTableSessionVariables): MutationPromise<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;

interface ServerCloseTableSessionRef {
  ...
  (dc: DataConnect, vars: ServerCloseTableSessionVariables): MutationRef<ServerCloseTableSessionData, ServerCloseTableSessionVariables>;
}
export const serverCloseTableSessionRef: ServerCloseTableSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverCloseTableSessionRef:
```typescript
const name = serverCloseTableSessionRef.operationName;
console.log(name);
```

### Variables
The `ServerCloseTableSession` mutation requires an argument of type `ServerCloseTableSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerCloseTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerCloseTableSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerCloseTableSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerCloseTableSessionData {
  tableSession_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerCloseTableSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverCloseTableSession, ServerCloseTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCloseTableSession` mutation requires an argument of type `ServerCloseTableSessionVariables`:
const serverCloseTableSessionVars: ServerCloseTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  authUid: ..., 
};

// Call the `serverCloseTableSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverCloseTableSession(serverCloseTableSessionVars);
// Variables can be defined inline as well.
const { data } = await serverCloseTableSession({ tenantId: ..., branchId: ..., sessionId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverCloseTableSession(dataConnect, serverCloseTableSessionVars);

console.log(data.tableSession_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverCloseTableSession(serverCloseTableSessionVars).then((response) => {
  const data = response.data;
  console.log(data.tableSession_updateMany);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerCloseTableSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverCloseTableSessionRef, ServerCloseTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCloseTableSession` mutation requires an argument of type `ServerCloseTableSessionVariables`:
const serverCloseTableSessionVars: ServerCloseTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  authUid: ..., 
};

// Call the `serverCloseTableSessionRef()` function to get a reference to the mutation.
const ref = serverCloseTableSessionRef(serverCloseTableSessionVars);
// Variables can be defined inline as well.
const ref = serverCloseTableSessionRef({ tenantId: ..., branchId: ..., sessionId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverCloseTableSessionRef(dataConnect, serverCloseTableSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tableSession_updateMany);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tableSession_updateMany);
  console.log(data.auditEvent_insert);
});
```

## ServerCloseSettledTableSession
You can execute the `ServerCloseSettledTableSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverCloseSettledTableSession(vars: ServerCloseSettledTableSessionVariables): MutationPromise<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;

interface ServerCloseSettledTableSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerCloseSettledTableSessionVariables): MutationRef<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;
}
export const serverCloseSettledTableSessionRef: ServerCloseSettledTableSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverCloseSettledTableSession(dc: DataConnect, vars: ServerCloseSettledTableSessionVariables): MutationPromise<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;

interface ServerCloseSettledTableSessionRef {
  ...
  (dc: DataConnect, vars: ServerCloseSettledTableSessionVariables): MutationRef<ServerCloseSettledTableSessionData, ServerCloseSettledTableSessionVariables>;
}
export const serverCloseSettledTableSessionRef: ServerCloseSettledTableSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverCloseSettledTableSessionRef:
```typescript
const name = serverCloseSettledTableSessionRef.operationName;
console.log(name);
```

### Variables
The `ServerCloseSettledTableSession` mutation requires an argument of type `ServerCloseSettledTableSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerCloseSettledTableSessionVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  sessionId: UUIDString;
  authUid: string;
  billId: UUIDString;
  billVersion: number;
  totalMinor: Int64String;
}
```
### Return Type
Recall that executing the `ServerCloseSettledTableSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerCloseSettledTableSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerCloseSettledTableSessionData {
  tableSession_updateMany: number;
  bill_updateMany: number;
  auditEvent_insert: AuditEvent_Key;
  settleAudit: AuditEvent_Key;
}
```
### Using `ServerCloseSettledTableSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverCloseSettledTableSession, ServerCloseSettledTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCloseSettledTableSession` mutation requires an argument of type `ServerCloseSettledTableSessionVariables`:
const serverCloseSettledTableSessionVars: ServerCloseSettledTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  authUid: ..., 
  billId: ..., 
  billVersion: ..., 
  totalMinor: ..., 
};

// Call the `serverCloseSettledTableSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverCloseSettledTableSession(serverCloseSettledTableSessionVars);
// Variables can be defined inline as well.
const { data } = await serverCloseSettledTableSession({ tenantId: ..., branchId: ..., sessionId: ..., authUid: ..., billId: ..., billVersion: ..., totalMinor: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverCloseSettledTableSession(dataConnect, serverCloseSettledTableSessionVars);

console.log(data.tableSession_updateMany);
console.log(data.bill_updateMany);
console.log(data.auditEvent_insert);
console.log(data.settleAudit);

// Or, you can use the `Promise` API.
serverCloseSettledTableSession(serverCloseSettledTableSessionVars).then((response) => {
  const data = response.data;
  console.log(data.tableSession_updateMany);
  console.log(data.bill_updateMany);
  console.log(data.auditEvent_insert);
  console.log(data.settleAudit);
});
```

### Using `ServerCloseSettledTableSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverCloseSettledTableSessionRef, ServerCloseSettledTableSessionVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerCloseSettledTableSession` mutation requires an argument of type `ServerCloseSettledTableSessionVariables`:
const serverCloseSettledTableSessionVars: ServerCloseSettledTableSessionVariables = {
  tenantId: ..., 
  branchId: ..., 
  sessionId: ..., 
  authUid: ..., 
  billId: ..., 
  billVersion: ..., 
  totalMinor: ..., 
};

// Call the `serverCloseSettledTableSessionRef()` function to get a reference to the mutation.
const ref = serverCloseSettledTableSessionRef(serverCloseSettledTableSessionVars);
// Variables can be defined inline as well.
const ref = serverCloseSettledTableSessionRef({ tenantId: ..., branchId: ..., sessionId: ..., authUid: ..., billId: ..., billVersion: ..., totalMinor: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverCloseSettledTableSessionRef(dataConnect, serverCloseSettledTableSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tableSession_updateMany);
console.log(data.bill_updateMany);
console.log(data.auditEvent_insert);
console.log(data.settleAudit);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tableSession_updateMany);
  console.log(data.bill_updateMany);
  console.log(data.auditEvent_insert);
  console.log(data.settleAudit);
});
```

## CreateBranch
You can execute the `CreateBranch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createBranch(vars: CreateBranchVariables): MutationPromise<CreateBranchData, CreateBranchVariables>;

interface CreateBranchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBranchVariables): MutationRef<CreateBranchData, CreateBranchVariables>;
}
export const createBranchRef: CreateBranchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBranch(dc: DataConnect, vars: CreateBranchVariables): MutationPromise<CreateBranchData, CreateBranchVariables>;

interface CreateBranchRef {
  ...
  (dc: DataConnect, vars: CreateBranchVariables): MutationRef<CreateBranchData, CreateBranchVariables>;
}
export const createBranchRef: CreateBranchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBranchRef:
```typescript
const name = createBranchRef.operationName;
console.log(name);
```

### Variables
The `CreateBranch` mutation requires an argument of type `CreateBranchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateBranchVariables {
  tenantId: UUIDString;
  name: string;
  currency: string;
  timezone: string;
}
```
### Return Type
Recall that executing the `CreateBranch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBranchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBranchData {
  branch_insert: Branch_Key;
  station_insert: Station_Key;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateBranch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBranch, CreateBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateBranch` mutation requires an argument of type `CreateBranchVariables`:
const createBranchVars: CreateBranchVariables = {
  tenantId: ..., 
  name: ..., 
  currency: ..., 
  timezone: ..., 
};

// Call the `createBranch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBranch(createBranchVars);
// Variables can be defined inline as well.
const { data } = await createBranch({ tenantId: ..., name: ..., currency: ..., timezone: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBranch(dataConnect, createBranchVars);

console.log(data.branch_insert);
console.log(data.station_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createBranch(createBranchVars).then((response) => {
  const data = response.data;
  console.log(data.branch_insert);
  console.log(data.station_insert);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateBranch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBranchRef, CreateBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `CreateBranch` mutation requires an argument of type `CreateBranchVariables`:
const createBranchVars: CreateBranchVariables = {
  tenantId: ..., 
  name: ..., 
  currency: ..., 
  timezone: ..., 
};

// Call the `createBranchRef()` function to get a reference to the mutation.
const ref = createBranchRef(createBranchVars);
// Variables can be defined inline as well.
const ref = createBranchRef({ tenantId: ..., name: ..., currency: ..., timezone: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBranchRef(dataConnect, createBranchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.branch_insert);
console.log(data.station_insert);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.branch_insert);
  console.log(data.station_insert);
  console.log(data.auditEvent_insert);
});
```

## UpdateBranch
You can execute the `UpdateBranch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateBranch(vars: UpdateBranchVariables): MutationPromise<UpdateBranchData, UpdateBranchVariables>;

interface UpdateBranchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBranchVariables): MutationRef<UpdateBranchData, UpdateBranchVariables>;
}
export const updateBranchRef: UpdateBranchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateBranch(dc: DataConnect, vars: UpdateBranchVariables): MutationPromise<UpdateBranchData, UpdateBranchVariables>;

interface UpdateBranchRef {
  ...
  (dc: DataConnect, vars: UpdateBranchVariables): MutationRef<UpdateBranchData, UpdateBranchVariables>;
}
export const updateBranchRef: UpdateBranchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateBranchRef:
```typescript
const name = updateBranchRef.operationName;
console.log(name);
```

### Variables
The `UpdateBranch` mutation requires an argument of type `UpdateBranchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateBranchVariables {
  tenantId: UUIDString;
  branchId: UUIDString;
  name: string;
  timezone: string;
  archived: boolean;
}
```
### Return Type
Recall that executing the `UpdateBranch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateBranchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateBranchData {
  branch_update?: Branch_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `UpdateBranch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateBranch, UpdateBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateBranch` mutation requires an argument of type `UpdateBranchVariables`:
const updateBranchVars: UpdateBranchVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
  timezone: ..., 
  archived: ..., 
};

// Call the `updateBranch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateBranch(updateBranchVars);
// Variables can be defined inline as well.
const { data } = await updateBranch({ tenantId: ..., branchId: ..., name: ..., timezone: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateBranch(dataConnect, updateBranchVars);

console.log(data.branch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
updateBranch(updateBranchVars).then((response) => {
  const data = response.data;
  console.log(data.branch_update);
  console.log(data.auditEvent_insert);
});
```

### Using `UpdateBranch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateBranchRef, UpdateBranchVariables } from '@tavelyo/dataconnect-sdk';

// The `UpdateBranch` mutation requires an argument of type `UpdateBranchVariables`:
const updateBranchVars: UpdateBranchVariables = {
  tenantId: ..., 
  branchId: ..., 
  name: ..., 
  timezone: ..., 
  archived: ..., 
};

// Call the `updateBranchRef()` function to get a reference to the mutation.
const ref = updateBranchRef(updateBranchVars);
// Variables can be defined inline as well.
const ref = updateBranchRef({ tenantId: ..., branchId: ..., name: ..., timezone: ..., archived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateBranchRef(dataConnect, updateBranchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.branch_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.branch_update);
  console.log(data.auditEvent_insert);
});
```

