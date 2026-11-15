import { QueryFetchPolicy, type DataConnect } from 'firebase/data-connect';
import {
  branchCatalog,
  catalogAdmin,
  changePrice,
  createCategory,
  createModifierGroup,
  createModifierOption,
  createProduct,
  createTaxRule,
  setProductAvailability,
  updateCategory,
  updateModifierGroup,
  updateModifierOption,
  updateProduct,
  updateTaxRule,
} from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type { CatalogAdminGateway, ProductInput } from '@tavelyo/catalog/domain';
import { mapCommandError } from './command-errors.ts';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009).
const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;

async function command(run: () => Promise<unknown>) {
  try {
    await run();
    return ok(undefined);
  } catch (error) {
    return err(mapCommandError(error));
  }
}

/**
 * Las operaciones de edición esperan todos los campos y el servidor exige que los opcionales
 * lleguen como null explícito (una variable omitida no vacía el campo).
 */
function productVariables(input: ProductInput) {
  return {
    categoryId: input.categoryId,
    taxRuleId: input.taxRuleId,
    name: input.name,
    description: input.description,
    allergensDeclared: input.allergens.length > 0 ? [...input.allergens] : null,
    sort: input.sort,
  };
}

export function createCatalogAdminGateway(dataConnect: DataConnect): CatalogAdminGateway {
  return {
    async catalog(tenantId) {
      try {
        const { data } = await catalogAdmin(dataConnect, { tenantId }, SERVER_ONLY);
        return ok({
          taxRules: data.taxRules.map((tax) => ({
            id: tax.id,
            name: tax.name,
            rateBp: tax.rateBp,
            archived: Boolean(tax.archivedAt),
          })),
          categories: data.categories.map((category) => ({
            id: category.id,
            name: category.name,
            sort: category.sort,
            archived: Boolean(category.archivedAt),
            products: category.products_on_category.map((product) => ({
              id: product.id,
              name: product.name,
              description: product.description ?? null,
              allergens: product.allergensDeclared ?? [],
              sort: product.sort,
              taxRuleId: product.taxRuleId ?? null,
              archived: Boolean(product.archivedAt),
              groups: product.modifierGroups_on_product.map((group) => ({
                id: group.id,
                name: group.name,
                minSelect: group.minSelect,
                maxSelect: group.maxSelect,
                sort: group.sort,
                archived: Boolean(group.archivedAt),
                options: group.modifierOptions_on_group.map((option) => ({
                  id: option.id,
                  name: option.name,
                  priceDeltaMinor: option.priceDeltaMinor,
                  sort: option.sort,
                  archived: Boolean(option.archivedAt),
                })),
              })),
            })),
          })),
        });
      } catch (error) {
        return err(mapCommandError(error));
      }
    },

    async branchProducts(scope) {
      try {
        const { data } = await branchCatalog(dataConnect, scope, SERVER_ONLY);
        return ok(
          data.productBranches.map((entry) => {
            const { daysMask, startMinute, endMinute } = entry;
            return {
              productId: entry.productId,
              available: entry.available,
              schedule:
                daysMask == null || startMinute == null || endMinute == null
                  ? null
                  : { daysMask, startMinute, endMinute },
              currentPrice: entry.currentPrice
                ? {
                    id: entry.currentPrice.id,
                    amountMinor: entry.currentPrice.amountMinor,
                    currency: entry.currentPrice.currency,
                    validFrom: entry.currentPrice.validFrom,
                  }
                : null,
            };
          }),
        );
      } catch (error) {
        return err(mapCommandError(error));
      }
    },

    createTaxRule: (tenantId, input) =>
      command(() => createTaxRule(dataConnect, { tenantId, ...input })),
    updateTaxRule: (tenantId, taxRuleId, input) =>
      command(() => updateTaxRule(dataConnect, { tenantId, taxRuleId, ...input })),
    createCategory: (tenantId, input) =>
      command(() => createCategory(dataConnect, { tenantId, ...input })),
    updateCategory: (tenantId, categoryId, input) =>
      command(() => updateCategory(dataConnect, { tenantId, categoryId, ...input })),
    createProduct: (tenantId, input) =>
      command(() => createProduct(dataConnect, { tenantId, ...productVariables(input) })),
    updateProduct: (tenantId, productId, input) =>
      command(() =>
        updateProduct(dataConnect, {
          tenantId,
          productId,
          ...productVariables(input),
          archived: input.archived,
        }),
      ),
    createModifierGroup: (tenantId, productId, input) =>
      command(() => createModifierGroup(dataConnect, { tenantId, productId, ...input })),
    updateModifierGroup: (tenantId, groupId, input) =>
      command(() => updateModifierGroup(dataConnect, { tenantId, groupId, ...input })),
    createModifierOption: (tenantId, groupId, input) =>
      command(() => createModifierOption(dataConnect, { tenantId, groupId, ...input })),
    updateModifierOption: (tenantId, optionId, input) =>
      command(() => updateModifierOption(dataConnect, { tenantId, optionId, ...input })),
    setAvailability: (scope, productId, input) =>
      command(() =>
        setProductAvailability(dataConnect, {
          ...scope,
          productId,
          available: input.available,
          daysMask: input.schedule?.daysMask ?? null,
          startMinute: input.schedule?.startMinute ?? null,
          endMinute: input.schedule?.endMinute ?? null,
        }),
      ),
    changePrice: (scope, productId, amountMinor, currency) =>
      command(() => changePrice(dataConnect, { ...scope, productId, amountMinor, currency })),
  };
}
