# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { branchOrderApproval, setBranchOrderApproval, pendingApprovalOrders, approveOrder, rejectOrder, withdrawMyOrder, catalogAdmin, branchCatalog, createTaxRule, updateTaxRule } from '@tavelyo/dataconnect-sdk';


// Operation BranchOrderApproval:  For variables, look at type BranchOrderApprovalVars in ../index.d.ts
const { data } = await BranchOrderApproval(dataConnect, branchOrderApprovalVars);

// Operation SetBranchOrderApproval:  For variables, look at type SetBranchOrderApprovalVars in ../index.d.ts
const { data } = await SetBranchOrderApproval(dataConnect, setBranchOrderApprovalVars);

// Operation PendingApprovalOrders:  For variables, look at type PendingApprovalOrdersVars in ../index.d.ts
const { data } = await PendingApprovalOrders(dataConnect, pendingApprovalOrdersVars);

// Operation ApproveOrder:  For variables, look at type ApproveOrderVars in ../index.d.ts
const { data } = await ApproveOrder(dataConnect, approveOrderVars);

// Operation RejectOrder:  For variables, look at type RejectOrderVars in ../index.d.ts
const { data } = await RejectOrder(dataConnect, rejectOrderVars);

// Operation WithdrawMyOrder:  For variables, look at type WithdrawMyOrderVars in ../index.d.ts
const { data } = await WithdrawMyOrder(dataConnect, withdrawMyOrderVars);

// Operation CatalogAdmin:  For variables, look at type CatalogAdminVars in ../index.d.ts
const { data } = await CatalogAdmin(dataConnect, catalogAdminVars);

// Operation BranchCatalog:  For variables, look at type BranchCatalogVars in ../index.d.ts
const { data } = await BranchCatalog(dataConnect, branchCatalogVars);

// Operation CreateTaxRule:  For variables, look at type CreateTaxRuleVars in ../index.d.ts
const { data } = await CreateTaxRule(dataConnect, createTaxRuleVars);

// Operation UpdateTaxRule:  For variables, look at type UpdateTaxRuleVars in ../index.d.ts
const { data } = await UpdateTaxRule(dataConnect, updateTaxRuleVars);


```