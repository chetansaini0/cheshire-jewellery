import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { heroBanners } from "../index";
import { readAllHeroBanners, readHeroBanners, resetHeroBanners, validateBanner, writeHeroBanners } from "../banner-store";

const tmpFile = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cheshire-banners-")), "hero-banners.json");

test("falls back to committed config when no file exists", () => {
  const r = readAllHeroBanners(tmpFile());
  assert.equal(r.source, "config");
  assert.equal(r.banners.length, heroBanners.length);
});

test("round-trips edits, reorders and hides", () => {
  const file = tmpFile();
  const list = heroBanners.map((b) => ({ ...b }));
  list[0] = { ...list[0], headline: "Edited", isActive: false };
  list[4] = { ...list[4], sortOrder: 0 };
  const w = writeHeroBanners(list, file);
  assert.equal(w.ok, true);
  const all = readAllHeroBanners(file);
  assert.equal(all.source, "file");
  assert.equal(all.banners[0].id, heroBanners[4].id);
  assert.deepEqual(all.banners.map((b) => b.sortOrder), [1, 2, 3, 4, 5]);
  const active = readHeroBanners(file);
  assert.equal(active.length, 4);
  assert.ok(!active.some((b) => b.headline === "Edited"));
  resetHeroBanners(file);
  assert.equal(readAllHeroBanners(file).source, "config");
});

test("rejects bad input and more than 5 active banners", () => {
  const bad = validateBanner({ ...heroBanners[0], id: "Bad Id", cta: { label: "", href: "javascript:alert(1)" } });
  assert.equal(bad.ok, false);
  const six = [...heroBanners, { ...heroBanners[0], id: "extra" }];
  const r = writeHeroBanners(six, tmpFile());
  assert.equal(r.ok, false);
});

test("ignores a corrupt file", () => {
  const file = tmpFile();
  fs.writeFileSync(file, "{not json");
  assert.equal(readAllHeroBanners(file).source, "config");
});
