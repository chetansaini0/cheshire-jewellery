const KEEP_UPPER = new Set(["XL", "XXL", "II", "III", "FW26", "SS26", "90S"]);
const SMALL = new Set(["and", "of", "the", "with", "in", "on", "a", "to"]);

/** Catalogue names are stored in caps (admin convention); show them in editorial title case. */
export function displayName(name: string): string {
  return name
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((w, i) => {
      if (!w.trim() || w === "-") return w;
      if (KEEP_UPPER.has(w.toUpperCase())) return w.toUpperCase();
      if (i > 0 && SMALL.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
}
