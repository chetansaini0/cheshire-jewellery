import type { CategorySlug } from "@cheshire/types";
import type { CategoryMapping, MaterialMapping, StatusMapping } from "./types";
import type { SupplierOrderStatus } from "@cheshire/types";

const CATEGORY_HINTS: Array<[RegExp, CategorySlug]> = [
  [/lehenga|ghagra|chaniya/i, "lehengas"],
  [/saree|sari\b/i, "sarees"],
  [/salwar|anarkali|kurta set|sharara|churidar|suit set/i, "suits"],
  [/hood|sweat|fleece/i, "hoodies"],
  [/jean|denim/i, "denim"],
  [/tee|t-shirt|tshirt|shirt|top/i, "tees"],
  [/dress|gown|frock/i, "dresses"],
  [/jacket|coat|blazer|bomber/i, "outerwear"],
  [/co-?ord|set|suit|track/i, "co-ords"],
  [/cap|bag|sneaker|shoe|belt|sock/i, "accessories"],
];

const MATERIAL_HINTS: Array<[RegExp, string]> = [
  [/banarasi/i, "Banarasi Silk"],
  [/chanderi/i, "Chanderi Silk"],
  [/georgette/i, "Georgette"],
  [/chiffon/i, "Chiffon"],
  [/silk/i, "Silk"],
  [/organic/i, "Organic Cotton"],
  [/cotton/i, "Cotton"],
  [/denim/i, "Cotton Denim"],
  [/linen/i, "Linen"],
  [/poly/i, "Polyester"],
  [/wool/i, "Wool Blend"],
];

const STATUS_HINTS: Array<[RegExp, SupplierOrderStatus]> = [
  [/dispatch|ship/i, "shipped"],
  [/complete|deliver/i, "delivered"],
  [/cancel/i, "cancelled"],
  [/pack/i, "packed"],
  [/process/i, "processing"],
  [/confirm|accept/i, "confirmed"],
  [/return/i, "return_requested"],
  [/refund/i, "refunded"],
  [/out for/i, "out_for_delivery"],
];

export function mapCategory(raw: string | undefined, mappings: CategoryMapping[], supplierId: string) {
  const key = (raw || "").trim();
  if (!key) return "tees";
  const configured = mappings.find(
    (m) => m.supplierId === supplierId && m.supplierCategory.toLowerCase() === key.toLowerCase()
  );
  if (configured) return configured.cheshireCategory;
  const hint = CATEGORY_HINTS.find(([re]) => re.test(key));
  return hint?.[1] ?? "tees";
}

export function mapMaterial(raw: string | undefined, mappings: MaterialMapping[]) {
  const key = (raw || "").trim();
  if (!key) return "Cotton";
  const configured = mappings.find((m) => m.supplierMaterial.toLowerCase() === key.toLowerCase());
  if (configured) return configured.cheshireMaterial;
  const hint = MATERIAL_HINTS.find(([re]) => re.test(key));
  return hint?.[1] ?? key;
}

export function mapOrderStatus(raw: string, mappings: StatusMapping[], supplierId: string): SupplierOrderStatus {
  const key = raw.trim();
  const configured = mappings.find(
    (m) => m.supplierId === supplierId && m.supplierStatus.toLowerCase() === key.toLowerCase()
  );
  if (configured) return configured.cheshireStatus;
  const hint = STATUS_HINTS.find(([re]) => re.test(key));
  return hint?.[1] ?? "processing";
}

export const DEFAULT_MATERIAL_MAPPINGS: MaterialMapping[] = [
  { id: "mat-jersey", supplierMaterial: "Cotton Jersey", cheshireMaterial: "Cotton" },
  { id: "mat-combed", supplierMaterial: "Combed Cotton", cheshireMaterial: "Cotton" },
  { id: "mat-denim", supplierMaterial: "Denim 14oz", cheshireMaterial: "Cotton Denim" },
];
