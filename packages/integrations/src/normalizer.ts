import { slugify } from "@cheshire/utils";
import type { CategoryMapping, MaterialMapping, RawSupplierProduct } from "./types";
import { mapCategory, mapMaterial } from "./mappings";
import { inventoryView } from "./inventory";
import { quoteCustomerPrice } from "./pricing";
import type { PricingRule } from "./types";
import type { ImportedProduct } from "./types";

export function normalizeSupplierProduct(
  raw: RawSupplierProduct,
  input: {
    supplierId: string;
    mappings: CategoryMapping[];
    materials: MaterialMapping[];
    pricingRules: PricingRule[];
    existing?: ImportedProduct;
  }
): ImportedProduct {
  const category = mapCategory(raw.category, input.mappings, input.supplierId);
  const material = mapMaterial(raw.material, input.materials);
  const quote = quoteCustomerPrice(raw.price, input.pricingRules, {
    supplierId: input.supplierId,
    category,
    productId: input.existing?.id,
    previousCost: input.existing?.supplierCost,
  });
  const now = new Date().toISOString();
  const sku = raw.sku || `SUP-${raw.supplierProductId}`;
  return {
    id: input.existing?.id || `imp_${input.supplierId}_${raw.supplierProductId}`,
    supplierId: input.supplierId,
    supplierProductId: raw.supplierProductId,
    supplierSku: sku,
    sku,
    title: (raw.name || "Untitled piece").trim(),
    slug: slugify(raw.name || sku),
    description: raw.description || "",
    category,
    subcategory: raw.subcategory,
    material,
    color: raw.color,
    weight: raw.weight,
    stoneType: raw.stoneType,
    sizes: raw.size ? [raw.size] : input.existing?.sizes ?? [],
    supplierCost: raw.price,
    previousSupplierCost: input.existing?.supplierCost,
    customerPrice: quote.customerPrice,
    compareAtPrice: raw.compareAtPrice,
    inventory: inventoryView({
      supplierStock: raw.stock,
      reserved: input.existing?.inventory.reserved ?? 0,
      sold: input.existing?.inventory.sold ?? 0,
    }),
    images: (raw.images ?? []).map((url, i) => ({
      sourceUrl: url,
      storedUrl: input.existing?.images[i]?.storedUrl,
      status: input.existing?.imageUsagePermission ?? "UNKNOWN",
      kind: i === 0 ? "main" : "gallery",
    })),
    videoUrl: raw.videoUrl,
    sourceUrl: raw.sourceUrl,
    lifecycle: input.existing?.lifecycle ?? "IMPORTED",
    imageUsagePermission: input.existing?.imageUsagePermission ?? "UNKNOWN",
    contentPermissionStatus: input.existing?.contentPermissionStatus ?? "UNKNOWN",
    productType: input.existing?.productType ?? "dropship",
    lastProductSync: now,
    priceFlag: quote.flaggedChange
      ? `Supplier price changed ${quote.flaggedChange.previousCost} → ${quote.flaggedChange.newCost} (${quote.flaggedChange.changePercent}%).`
      : quote.lossRisk
        ? "Loss risk: selling price is not above supplier cost."
        : undefined,
    sourceUnavailable: false,
    createdAt: input.existing?.createdAt ?? now,
    updatedAt: now,
  };
}
