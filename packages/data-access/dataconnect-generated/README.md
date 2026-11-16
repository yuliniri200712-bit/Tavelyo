# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `tavelyo`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*CatalogAdmin*](#catalogadmin)
  - [*BranchCatalog*](#branchcatalog)
  - [*PublicMenu*](#publicmenu)
  - [*MyParticipation*](#myparticipation)
  - [*BranchLayout*](#branchlayout)
  - [*MyProfile*](#myprofile)
  - [*MyMemberships*](#mymemberships)
  - [*MyBranches*](#mybranches)
  - [*TenantMembers*](#tenantmembers)
  - [*TenantAuditEvents*](#tenantauditevents)
  - [*FloorView*](#floorview)
  - [*SessionParticipants*](#sessionparticipants)
  - [*ServerOpenSessionByQr*](#serveropensessionbyqr)
  - [*ServerQuoteContext*](#serverquotecontext)
  - [*ServerProductsForQuote*](#serverproductsforquote)
  - [*ServerQuoteByKey*](#serverquotebykey)
  - [*ServerQuoteForPayment*](#serverquoteforpayment)
  - [*TenantBranches*](#tenantbranches)
- [**Mutations**](#mutations)
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
  - [*OpenTableSession*](#opentablesession)
  - [*CloseTableSession*](#closetablesession)
  - [*RemoveParticipant*](#removeparticipant)
  - [*ServerInsertParticipant*](#serverinsertparticipant)
  - [*ServerRenewParticipant*](#serverrenewparticipant)
  - [*ServerSetQuotePayment*](#serversetquotepayment)
  - [*ServerHitRateLimit*](#serverhitratelimit)
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

## ServerQuoteForPayment
You can execute the `ServerQuoteForPayment` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverQuoteForPayment(vars: ServerQuoteForPaymentVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;

interface ServerQuoteForPaymentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerQuoteForPaymentVariables): QueryRef<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;
}
export const serverQuoteForPaymentRef: ServerQuoteForPaymentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
serverQuoteForPayment(dc: DataConnect, vars: ServerQuoteForPaymentVariables, options?: ExecuteQueryOptions): QueryPromise<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;

interface ServerQuoteForPaymentRef {
  ...
  (dc: DataConnect, vars: ServerQuoteForPaymentVariables): QueryRef<ServerQuoteForPaymentData, ServerQuoteForPaymentVariables>;
}
export const serverQuoteForPaymentRef: ServerQuoteForPaymentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverQuoteForPaymentRef:
```typescript
const name = serverQuoteForPaymentRef.operationName;
console.log(name);
```

### Variables
The `ServerQuoteForPayment` query requires an argument of type `ServerQuoteForPaymentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerQuoteForPaymentVariables {
  quoteId: UUIDString;
  authUid: string;
}
```
### Return Type
Recall that executing the `ServerQuoteForPayment` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerQuoteForPaymentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ServerQuoteForPayment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverQuoteForPayment, ServerQuoteForPaymentVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteForPayment` query requires an argument of type `ServerQuoteForPaymentVariables`:
const serverQuoteForPaymentVars: ServerQuoteForPaymentVariables = {
  quoteId: ..., 
  authUid: ..., 
};

// Call the `serverQuoteForPayment()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverQuoteForPayment(serverQuoteForPaymentVars);
// Variables can be defined inline as well.
const { data } = await serverQuoteForPayment({ quoteId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverQuoteForPayment(dataConnect, serverQuoteForPaymentVars);

console.log(data.orderQuotes);

// Or, you can use the `Promise` API.
serverQuoteForPayment(serverQuoteForPaymentVars).then((response) => {
  const data = response.data;
  console.log(data.orderQuotes);
});
```

### Using `ServerQuoteForPayment`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, serverQuoteForPaymentRef, ServerQuoteForPaymentVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerQuoteForPayment` query requires an argument of type `ServerQuoteForPaymentVariables`:
const serverQuoteForPaymentVars: ServerQuoteForPaymentVariables = {
  quoteId: ..., 
  authUid: ..., 
};

// Call the `serverQuoteForPaymentRef()` function to get a reference to the query.
const ref = serverQuoteForPaymentRef(serverQuoteForPaymentVars);
// Variables can be defined inline as well.
const ref = serverQuoteForPaymentRef({ quoteId: ..., authUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverQuoteForPaymentRef(dataConnect, serverQuoteForPaymentVars);

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
  tableSession_update?: TableSession_Key | null;
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

console.log(data.tableSession_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
closeTableSession(closeTableSessionVars).then((response) => {
  const data = response.data;
  console.log(data.tableSession_update);
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

console.log(data.tableSession_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tableSession_update);
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

## ServerSetQuotePayment
You can execute the `ServerSetQuotePayment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
serverSetQuotePayment(vars: ServerSetQuotePaymentVariables): MutationPromise<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;

interface ServerSetQuotePaymentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ServerSetQuotePaymentVariables): MutationRef<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;
}
export const serverSetQuotePaymentRef: ServerSetQuotePaymentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
serverSetQuotePayment(dc: DataConnect, vars: ServerSetQuotePaymentVariables): MutationPromise<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;

interface ServerSetQuotePaymentRef {
  ...
  (dc: DataConnect, vars: ServerSetQuotePaymentVariables): MutationRef<ServerSetQuotePaymentData, ServerSetQuotePaymentVariables>;
}
export const serverSetQuotePaymentRef: ServerSetQuotePaymentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the serverSetQuotePaymentRef:
```typescript
const name = serverSetQuotePaymentRef.operationName;
console.log(name);
```

### Variables
The `ServerSetQuotePayment` mutation requires an argument of type `ServerSetQuotePaymentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ServerSetQuotePaymentVariables {
  quoteId: UUIDString;
  tenantId: UUIDString;
  authUid: string;
  status: OrderQuoteStatus;
  paymentRef: string;
}
```
### Return Type
Recall that executing the `ServerSetQuotePayment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ServerSetQuotePaymentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ServerSetQuotePaymentData {
  orderQuote_update?: OrderQuote_Key | null;
  auditEvent_insert: AuditEvent_Key;
}
```
### Using `ServerSetQuotePayment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, serverSetQuotePayment, ServerSetQuotePaymentVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSetQuotePayment` mutation requires an argument of type `ServerSetQuotePaymentVariables`:
const serverSetQuotePaymentVars: ServerSetQuotePaymentVariables = {
  quoteId: ..., 
  tenantId: ..., 
  authUid: ..., 
  status: ..., 
  paymentRef: ..., 
};

// Call the `serverSetQuotePayment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverSetQuotePayment(serverSetQuotePaymentVars);
// Variables can be defined inline as well.
const { data } = await serverSetQuotePayment({ quoteId: ..., tenantId: ..., authUid: ..., status: ..., paymentRef: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await serverSetQuotePayment(dataConnect, serverSetQuotePaymentVars);

console.log(data.orderQuote_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
serverSetQuotePayment(serverSetQuotePaymentVars).then((response) => {
  const data = response.data;
  console.log(data.orderQuote_update);
  console.log(data.auditEvent_insert);
});
```

### Using `ServerSetQuotePayment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, serverSetQuotePaymentRef, ServerSetQuotePaymentVariables } from '@tavelyo/dataconnect-sdk';

// The `ServerSetQuotePayment` mutation requires an argument of type `ServerSetQuotePaymentVariables`:
const serverSetQuotePaymentVars: ServerSetQuotePaymentVariables = {
  quoteId: ..., 
  tenantId: ..., 
  authUid: ..., 
  status: ..., 
  paymentRef: ..., 
};

// Call the `serverSetQuotePaymentRef()` function to get a reference to the mutation.
const ref = serverSetQuotePaymentRef(serverSetQuotePaymentVars);
// Variables can be defined inline as well.
const ref = serverSetQuotePaymentRef({ quoteId: ..., tenantId: ..., authUid: ..., status: ..., paymentRef: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = serverSetQuotePaymentRef(dataConnect, serverSetQuotePaymentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderQuote_update);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderQuote_update);
  console.log(data.auditEvent_insert);
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
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createBranch(createBranchVars).then((response) => {
  const data = response.data;
  console.log(data.branch_insert);
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
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.branch_insert);
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

