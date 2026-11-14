# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `tavelyo`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*PublicMenu*](#publicmenu)
  - [*MyParticipation*](#myparticipation)
  - [*MyProfile*](#myprofile)
  - [*MyMemberships*](#mymemberships)
  - [*MyBranches*](#mybranches)
  - [*TenantMembers*](#tenantmembers)
  - [*TenantAuditEvents*](#tenantauditevents)
  - [*ServerOpenSessionByQr*](#serveropensessionbyqr)
- [**Mutations**](#mutations)
  - [*UpsertMyProfile*](#upsertmyprofile)
  - [*AddMember*](#addmember)
  - [*ChangeMemberRole*](#changememberrole)
  - [*RevokeMember*](#revokemember)
  - [*AssignMemberBranch*](#assignmemberbranch)
  - [*UnassignMemberBranch*](#unassignmemberbranch)
  - [*OpenTableSession*](#opentablesession)
  - [*CloseTableSession*](#closetablesession)
  - [*ServerInsertParticipant*](#serverinsertparticipant)

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
    tableSessions_on_table: ({
      id: UUIDString;
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
};

// Call the `serverOpenSessionByQr()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await serverOpenSessionByQr(serverOpenSessionByQrVars);
// Variables can be defined inline as well.
const { data } = await serverOpenSessionByQr({ qrPublicId: ..., });

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
};

// Call the `serverOpenSessionByQrRef()` function to get a reference to the query.
const ref = serverOpenSessionByQrRef(serverOpenSessionByQrVars);
// Variables can be defined inline as well.
const ref = serverOpenSessionByQrRef({ qrPublicId: ..., });

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

// Or, you can use the `Promise` API.
serverInsertParticipant(serverInsertParticipantVars).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_insert);
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

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.sessionParticipant_insert);
});
```

