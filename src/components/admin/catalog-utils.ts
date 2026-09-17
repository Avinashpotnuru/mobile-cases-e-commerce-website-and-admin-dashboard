import type { BrandRow, MobileModelRow, ProductRow } from "@/types/catalog";

export interface ModelGroup {
  brandId: string;
  brandName: string;
  models: MobileModelRow[];
}

export function buildModelGroups(
  models: MobileModelRow[],
  brands: BrandRow[],
): ModelGroup[] {
  const nameById = new Map(brands.map((brand) => [brand._id, brand.name]));
  const indexByBrandId = new Map<string, number>();
  const groups: ModelGroup[] = [];

  for (const model of models) {
    let index = indexByBrandId.get(model.brandId);
    if (index === undefined) {
      index = groups.length;
      indexByBrandId.set(model.brandId, index);
      groups.push({
        brandId: model.brandId,
        brandName: nameById.get(model.brandId) ?? "Unknown brand",
        models: [],
      });
    }
    groups[index].models.push(model);
  }
  return groups;
}

export function brandNameById(
  brands: BrandRow[],
  brandId: string | undefined,
): string {
  if (!brandId) return "Unknown brand";
  const found = brands.find((brand) => brand._id === brandId);
  return found?.name ?? "Unknown brand";
}

export function buildModelMap(models: MobileModelRow[]) {
  return new Map(models.map((model) => [model._id, model]));
}

export function buildBrandNameMap(brands: BrandRow[]) {
  return new Map(brands.map((brand) => [brand._id, brand.name]));
}

export function brandNamesOfProduct(
  product: Pick<ProductRow, "compatibleModelIds">,
  models: MobileModelRow[],
  brands: BrandRow[],
): string[] {
  const modelMap = buildModelMap(models);
  const brandNameMap = buildBrandNameMap(brands);
  const names: string[] = [];
  const seen = new Set<string>();
  for (const modelId of product.compatibleModelIds) {
    const brandId = modelMap.get(modelId)?.brandId;
    if (!brandId) continue;
    const name = brandNameMap.get(brandId) ?? brandId;
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function compatibleModelNamesOf(
  product: Pick<ProductRow, "compatibleModelIds">,
  models: MobileModelRow[],
): string[] {
  const modelMap = buildModelMap(models);
  return product.compatibleModelIds
    .map((modelId) => modelMap.get(modelId)?.name)
    .filter((name): name is string => Boolean(name));
}

const priceFormatterCache = new Map<string, Intl.NumberFormat>();

export function formatPrice(cents: number, currency: string): string {
  let formatter = priceFormatterCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });
    priceFormatterCache.set(currency, formatter);
  }
  return formatter.format(cents / 100);
}