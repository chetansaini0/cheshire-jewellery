/** Where local JSON data lives, and whether this host can write it. Server-only. */
import fs from "node:fs";
import path from "node:path";

export function resolveRepoDataDir(start = process.cwd()): string {
  if (process.env.CHESHIRE_DATA_DIR) return process.env.CHESHIRE_DATA_DIR;
  let dir = start;
  for (let i = 0; i < 8; i++) {
    const pkg = path.join(dir, "package.json");
    if (fs.existsSync(pkg)) {
      try {
        const json = JSON.parse(fs.readFileSync(pkg, "utf8")) as { name?: string; workspaces?: unknown };
        if (json.name === "cheshire" && json.workspaces) return path.join(dir, ".data");
      } catch {
        /* ignore malformed package.json */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.join(start, ".data");
}

export class ReadOnlyStoreError extends Error {
  constructor() {
    super("Saving is only available locally until a database is connected.");
    this.name = "ReadOnlyStoreError";
  }
}

/** True on Vercel/serverless where the deployment filesystem is read-only. */
export function isReadOnlyDataStore() {
  return Boolean(process.env.VERCEL || process.env.CHESHIRE_READ_ONLY === "1");
}

/** Map filesystem permission errors to ReadOnlyStoreError. */
export function asStoreError(e: unknown): Error {
  const code = (e as NodeJS.ErrnoException)?.code;
  if (code === "EROFS" || code === "EACCES" || code === "EPERM") return new ReadOnlyStoreError();
  return e instanceof Error ? e : new Error(String(e));
}
