# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { catalogAdmin, branchCatalog, createTaxRule, updateTaxRule, createCategory, updateCategory, createProduct, updateProduct, createModifierGroup, updateModifierGroup } from '@tavelyo/dataconnect-sdk';


// Operation CatalogAdmin:  For variables, look at type CatalogAdminVars in ../index.d.ts
const { data } = await CatalogAdmin(dataConnect, catalogAdminVars);

// Operation BranchCatalog:  For variables, look at type BranchCatalogVars in ../index.d.ts
const { data } = await BranchCatalog(dataConnect, branchCatalogVars);

// Operation CreateTaxRule:  For variables, look at type CreateTaxRuleVars in ../index.d.ts
const { data } = await CreateTaxRule(dataConnect, createTaxRuleVars);

// Operation UpdateTaxRule:  For variables, look at type UpdateTaxRuleVars in ../index.d.ts
const { data } = await UpdateTaxRule(dataConnect, updateTaxRuleVars);

// Operation CreateCategory:  For variables, look at type CreateCategoryVars in ../index.d.ts
const { data } = await CreateCategory(dataConnect, createCategoryVars);

// Operation UpdateCategory:  For variables, look at type UpdateCategoryVars in ../index.d.ts
const { data } = await UpdateCategory(dataConnect, updateCategoryVars);

// Operation CreateProduct:  For variables, look at type CreateProductVars in ../index.d.ts
const { data } = await CreateProduct(dataConnect, createProductVars);

// Operation UpdateProduct:  For variables, look at type UpdateProductVars in ../index.d.ts
const { data } = await UpdateProduct(dataConnect, updateProductVars);

// Operation CreateModifierGroup:  For variables, look at type CreateModifierGroupVars in ../index.d.ts
const { data } = await CreateModifierGroup(dataConnect, createModifierGroupVars);

// Operation UpdateModifierGroup:  For variables, look at type UpdateModifierGroupVars in ../index.d.ts
const { data } = await UpdateModifierGroup(dataConnect, updateModifierGroupVars);


```