import fs from "node:fs";
import path from "node:path";

export function resolveDataDir() {
  if (process.env.CHESHIRE_DATA_DIR) return process.env.CHESHIRE_DATA_DIR;
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const pkg = path.join(dir, "package.json");
    if (fs.existsSync(pkg)) {
      try {
        const json = JSON.parse(fs.readFileSync(pkg, "utf8")) as { name?: string; workspaces?: unknown };
        if (json.name === "cheshire" && json.workspaces) return path.join(dir, ".data");
      } catch {
        /* ignore */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.join(process.cwd(), ".data");
}

export function readJsonFile<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonFile(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

export function persistEnabled() {
  return process.env.INTEGRATIONS_PERSIST !== "memory" && process.env.NODE_ENV !== "test";
}
