import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { heroBanners } from "../index";
import { MAX_ACTIVE_BANNERS, readAllHeroBanners, readHeroBanners, resetHeroBanners, validateBanner, writeHeroBanners } from "../banner-store";

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
  const n = heroBanners.length;
  const w = writeHeroBanners(list, file);
  assert.equal(w.ok, true);
  const all = readAllHeroBanners(file);
  assert.equal(all.source, "file");
  assert.equal(all.banners[0].id, heroBanners[4].id);
  assert.deepEqual(all.banners.map((b) => b.sortOrder), Array.from({ length: n }, (_, i) => i + 1));
  const active = readHeroBanners(file);
  assert.equal(active.length, n - 1);
  assert.ok(!active.some((b) => b.headline === "Edited"));
  resetHeroBanners(file);
  assert.equal(readAllHeroBanners(file).source, "config");
});

test("rejects bad input and more than MAX_ACTIVE_BANNERS active banners", () => {
  const bad = validateBanner({ ...heroBanners[0], id: "Bad Id", cta: { label: "", href: "javascript:alert(1)" } });
  assert.equal(bad.ok, false);
  const tooMany = [...heroBanners, ...Array.from({ length: MAX_ACTIVE_BANNERS }, (_, i) => ({ ...heroBanners[0], id: `extra-${i}` }))];
  const r = writeHeroBanners(tooMany, tmpFile());
  assert.equal(r.ok, false);
  const badImage = validateBanner({ ...heroBanners[0], image: "https://evil.example/x.webp" });
  assert.equal(badImage.ok, false);
  assert.equal(r.ok, false);
});

test("keeps full banner images through validation", () => {
  const r = validateBanner(heroBanners[0]);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.banner.image, heroBanners[0].image);
});

test("ignores a corrupt file", () => {
  const file = tmpFile();
  fs.writeFileSync(file, "{not json");
  assert.equal(readAllHeroBanners(file).source, "config");
});
