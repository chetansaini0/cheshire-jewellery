import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";

process.env.CHESHIRE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "cheshire-auto-"));
delete process.env.VERCEL;

import * as auto from "../automation";

test("validates webhook URLs safely", () => {
  assert.equal(auto.validateWebhookUrl("https://hooks.example.com/x"), null);
  assert.equal(auto.validateWebhookUrl("http://localhost:9999/hook"), null);
  assert.ok(auto.validateWebhookUrl("http://example.com/hook"));
  assert.ok(auto.validateWebhookUrl("ftp://example.com"));
  assert.ok(auto.validateWebhookUrl("https://user:pw@example.com"));
  assert.ok(auto.validateWebhookUrl("not a url"));
});

test("delivers subscribed events with a valid signature and logs them", async () => {
  const received: Array<{ headers: http.IncomingHttpHeaders; body: string }> = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      received.push({ headers: req.headers, body });
      res.writeHead(200).end("ok");
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as AddressInfo).port;
  const hook = auto.saveWebhook({ name: "Local", url: `http://localhost:${port}/hook`, events: ["product.updated"], enabled: true });

  const r1 = await auto.emitEvent("product.updated", { sku: "CH-1", name: "X", changed: ["price"], status: "active" });
  assert.equal(r1.deliveries.length, 1);
  assert.equal(r1.deliveries[0].ok, true);
  const r2 = await auto.emitEvent("banner.updated", { activeIds: [], total: 0, source: "admin" });
  assert.equal(r2.deliveries.length, 0, "not subscribed → not sent");

  const got = received[0];
  const sig = auto.signPayload(hook.secret, String(got.headers["x-cheshire-timestamp"]), got.body);
  assert.equal(got.headers["x-cheshire-signature"], `sha256=${sig}`);
  assert.equal(JSON.parse(got.body).event, "product.updated");

  const t = await auto.sendTestEvent(hook.id);
  assert.equal(t?.ok, true);
  assert.equal(auto.listDeliveries().length, 2);
  assert.equal(auto.listRecentEvents().length, 2);
  server.close();
});

test("records failures without throwing", async () => {
  const hook = auto.saveWebhook({ name: "Dead", url: "http://127.0.0.1:1/nothing", events: ["stock.low"], enabled: true });
  const r = await auto.emitEvent("stock.low", { sku: "A", name: "A", totalStock: 1, threshold: 10, lowSizes: {} });
  assert.equal(r.deliveries[0].ok, false);
  auto.deleteWebhook(hook.id);
  assert.ok(!auto.listWebhooks().some((w) => w.id === hook.id));
});

test("read-only hosts refuse writes with a clear message and skip deliveries", async () => {
  process.env.VERCEL = "1";
  try {
    assert.throws(() => auto.saveWebhook({ name: "x", url: "https://a.example", events: [], enabled: true }), /only available locally/);
    const r = await auto.emitEvent("settings.updated", { changed: [] });
    assert.equal(r.deliveries.length, 0);
  } finally {
    delete process.env.VERCEL;
  }
});
