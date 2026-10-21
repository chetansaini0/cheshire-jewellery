export function availabilityFromStock(stock: number): "IN_STOCK" | "OUT_OF_STOCK" {
  return stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
}

export function applyStockDelta(stock: number, delta: number): {
  stock: number;
  depleted: boolean;
} {
  const next = Math.max(0, stock + delta);
  return { stock: next, depleted: stock > 0 && next === 0 };
}
