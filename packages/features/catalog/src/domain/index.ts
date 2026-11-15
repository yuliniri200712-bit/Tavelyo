import type { Result, WeeklySchedule } from '@tavelyo/core';

/** Impuesto de la empresa, siempre incluido en el precio (D-01b). Tasa en puntos básicos. */
export interface TaxRuleAdmin {
  readonly id: string;
  readonly name: string;
  readonly rateBp: number;
  readonly archived: boolean;
}

export interface ModifierOptionAdmin {
  readonly id: string;
  readonly name: string;
  /** Precio adicional con impuestos incluidos, en unidades menores (cadena Int64). */
  readonly priceDeltaMinor: string;
  readonly sort: number;
  readonly archived: boolean;
}

export interface ModifierGroupAdmin {
  readonly id: string;
  readonly name: string;
  readonly minSelect: number;
  readonly maxSelect: number;
  readonly sort: number;
  readonly archived: boolean;
  readonly options: readonly ModifierOptionAdmin[];
}

export interface ProductAdmin {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  /** Alérgenos declarados por el restaurante: la app nunca garantiza su ausencia (RF-CA-02). */
  readonly allergens: readonly string[];
  readonly sort: number;
  readonly taxRuleId: string | null;
  readonly archived: boolean;
  readonly groups: readonly ModifierGroupAdmin[];
}

export interface CategoryAdmin {
  readonly id: string;
  readonly name: string;
  readonly sort: number;
  readonly archived: boolean;
  readonly products: readonly ProductAdmin[];
}

export interface CatalogAdmin {
  readonly taxRules: readonly TaxRuleAdmin[];
  readonly categories: readonly CategoryAdmin[];
}

/** Situación de un producto en una sucursal. Sin fila, el producto aún no está en la sucursal. */
export interface BranchProduct {
  readonly productId: string;
  readonly available: boolean;
  /** null: todo el día, todos los días. */
  readonly schedule: WeeklySchedule | null;
  readonly currentPrice: {
    readonly id: string;
    readonly amountMinor: string;
    readonly currency: string;
    readonly validFrom: string;
  } | null;
}

export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

export interface TaxRuleInput {
  readonly name: string;
  readonly rateBp: number;
}

export interface CategoryInput {
  readonly name: string;
  readonly sort: number;
}

export interface ProductInput {
  readonly categoryId: string;
  readonly taxRuleId: string | null;
  readonly name: string;
  readonly description: string | null;
  readonly allergens: readonly string[];
  readonly sort: number;
}

export interface ModifierGroupInput {
  readonly name: string;
  readonly minSelect: number;
  readonly maxSelect: number;
  readonly sort: number;
}

export interface ModifierOptionInput {
  readonly name: string;
  readonly priceDeltaMinor: string;
  readonly sort: number;
}

export interface AvailabilityInput {
  readonly available: boolean;
  readonly schedule: WeeklySchedule | null;
}

/** Mismo contrato de fallas que el resto de módulos de administración. */
export type CatalogError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type CatalogResult<T> = Promise<Result<T, CatalogError>>;

type Archivable<T> = T & { readonly archived: boolean };

/** Contrato que implementa la capa de datos (SQL Connect, conector carta.gql). */
export interface CatalogAdminGateway {
  catalog(tenantId: string): CatalogResult<CatalogAdmin>;
  branchProducts(scope: BranchScope): CatalogResult<readonly BranchProduct[]>;
  createTaxRule(tenantId: string, input: TaxRuleInput): CatalogResult<void>;
  updateTaxRule(tenantId: string, id: string, input: Archivable<TaxRuleInput>): CatalogResult<void>;
  createCategory(tenantId: string, input: CategoryInput): CatalogResult<void>;
  updateCategory(
    tenantId: string,
    id: string,
    input: Archivable<CategoryInput>,
  ): CatalogResult<void>;
  createProduct(tenantId: string, input: ProductInput): CatalogResult<void>;
  updateProduct(tenantId: string, id: string, input: Archivable<ProductInput>): CatalogResult<void>;
  createModifierGroup(
    tenantId: string,
    productId: string,
    input: ModifierGroupInput,
  ): CatalogResult<void>;
  updateModifierGroup(
    tenantId: string,
    id: string,
    input: Archivable<ModifierGroupInput>,
  ): CatalogResult<void>;
  createModifierOption(
    tenantId: string,
    groupId: string,
    input: ModifierOptionInput,
  ): CatalogResult<void>;
  updateModifierOption(
    tenantId: string,
    id: string,
    input: Archivable<ModifierOptionInput>,
  ): CatalogResult<void>;
  setAvailability(
    scope: BranchScope,
    productId: string,
    input: AvailabilityInput,
  ): CatalogResult<void>;
  changePrice(
    scope: BranchScope,
    productId: string,
    amountMinor: string,
    currency: string,
  ): CatalogResult<void>;
}
