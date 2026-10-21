import type { InventoryView } from "./types";

export function inventoryView(input: { supplierStock: number; reserved?: number; sold?: number }): InventoryView {
  const supplierStock = Math.max(0, Math.floor(input.supplierStock));
  const reserved = Math.max(0, Math.floor(input.reserved ?? 0));
  const sold = Math.max(0, Math.floor(input.sold ?? 0));
  const available = Math.max(0, supplierStock - reserved);
  return {
    supplierStock,
    reserved,
    sold,
    available,
    status: available > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
  };
}

export function applySupplierStock(current: InventoryView, supplierStock: number): InventoryView {
  return inventoryView({
    supplierStock,
    reserved: current.reserved,
    sold: current.sold,
  });
}

export function reserveStock(current: InventoryView, qty: number): InventoryView {
  if (qty > current.available) {
    throw Object.assign(new Error("Insufficient available inventory."), { code: "OUT_OF_STOCK" });
  }
  return inventoryView({
    supplierStock: current.supplierStock,
    reserved: current.reserved + qty,
    sold: current.sold,
  });
}

export function commitSale(current: InventoryView, qty: number): InventoryView {
  return inventoryView({
    supplierStock: Math.max(0, current.supplierStock - qty),
    reserved: Math.max(0, current.reserved - qty),
    sold: current.sold + qty,
  });
}

export function releaseReserve(current: InventoryView, qty: number): InventoryView {
  return inventoryView({
    supplierStock: current.supplierStock,
    reserved: Math.max(0, current.reserved - qty),
    sold: current.sold,
  });
}
