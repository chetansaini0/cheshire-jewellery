import fs from "node:fs";
import path from "node:path";
import { asStoreError, isReadOnlyDataStore, ReadOnlyStoreError, resolveRepoDataDir } from "@cheshire/config/data-dir";

/**
 * Tiny JSON-file store for admin-managed data (products edits, orders status, coupons, collections, settings).
 * Files live in `<repo>/.data/admin/*.json` (gitignored). There is no database in this project yet;
 * swap these helpers for Prisma calls when one is provisioned.
 *
 * On read-only hosts (Vercel) writes throw ReadOnlyStoreError with a friendly message; actions turn
 * that into an error toast instead of crashing.
 */
export { isReadOnlyDataStore, ReadOnlyStoreError };
export function adminDataDir() {
  return path.join(resolveRepoDataDir(), "admin");
}

export function readStore<T>(name: string, fallback: T): T {
  const file = path.join(adminDataDir(), `${name}.json`);
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeStore(name: string, data: unknown) {
  if (isReadOnlyDataStore()) throw new ReadOnlyStoreError();
  const file = path.join(adminDataDir(), `${name}.json`);
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, file);
  } catch (e) {
    throw asStoreError(e);
  }
}

export function storeFileExists(name: string) {
  return fs.existsSync(path.join(adminDataDir(), `${name}.json`));
}
