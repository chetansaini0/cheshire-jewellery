export type CsvColumnMap = {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
  image?: string;
  category?: string;
  description?: string;
  material?: string;
  supplierProductId?: string;
};

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
  return { headers, rows };
}

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function mappedCsvProducts(rows: CsvRow[], map: CsvColumnMap) {
  const errors: string[] = [];
  const items = rows.map((row, index) => {
    const name = row[map.name || "name"] || row.title || "";
    const sku = row[map.sku || "sku"] || "";
    const price = Number(row[map.price || "price"] || row.supplierCost || 0);
    const stock = Number(row[map.stock || "stock"] || row.inventory || 0);
    if (!name) errors.push(`Row ${index + 2}: missing name`);
    if (!Number.isFinite(price) || price <= 0) errors.push(`Row ${index + 2}: invalid price`);
    return {
      supplierProductId: row[map.supplierProductId || "id"] || sku || `csv-${index + 1}`,
      sku: sku || `CSV-${index + 1}`,
      name,
      description: row[map.description || "description"] || "",
      category: row[map.category || "category"] || "",
      material: row[map.material || "material"] || "",
      price,
      stock: Number.isFinite(stock) ? stock : 0,
      images: row[map.image || "image"] ? [row[map.image || "image"]] : [],
    };
  });
  return { items, errors };
}
