import crypto from "node:crypto";
import type { ConnectorCredentials } from "./types";

const LOCAL_DEV_MARK = "cheshire-local-dev-do-not-use-in-prod";

function keyBuffer() {
  const raw = process.env.INTEGRATION_SECRETS_KEY;
  const material = raw && raw.length >= 16 ? raw : LOCAL_DEV_MARK;
  return crypto.createHash("sha256").update(material).digest();
}

export function isProductionSecretsConfigured() {
  const raw = process.env.INTEGRATION_SECRETS_KEY;
  return Boolean(raw && raw.length >= 16);
}

export function encryptCredentials(creds: ConnectorCredentials): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer(), iv);
  const plaintext = JSON.stringify(creds);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptCredentials(payload?: string): ConnectorCredentials {
  if (!payload) return {};
  try {
    const [version, ivB64, tagB64, dataB64] = payload.split(".");
    if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) return {};
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer(), Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const out = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64url")), decipher.final()]);
    return JSON.parse(out.toString("utf8")) as ConnectorCredentials;
  } catch {
    return {};
  }
}

const SECRET_KEYS = new Set(["apiKey", "apiSecret", "accessToken", "clientSecret", "webhookSecret"]);

export function redactCredentials(creds: ConnectorCredentials): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const [key, value] of Object.entries(creds)) {
    if (key === "extra" && value && typeof value === "object") {
      out.hasExtra = Object.keys(value).length > 0;
      continue;
    }
    if (typeof value !== "string" || !value) continue;
    if (SECRET_KEYS.has(key) || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token")) {
      out[key] = `••••${value.slice(-4)}`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function credentialsPresent(creds: ConnectorCredentials) {
  return Boolean(creds.apiKey || creds.accessToken || creds.clientId || creds.baseUrl);
}

export function sanitizeLogValue(input: unknown): unknown {
  if (typeof input === "string") {
    if (/key|secret|token|password|authorization/i.test(input) && input.length > 8) return "[redacted]";
    return input;
  }
  if (Array.isArray(input)) return input.map(sanitizeLogValue);
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      if (/secret|token|password|apiKey|authorization|credential/i.test(k)) out[k] = "[redacted]";
      else out[k] = sanitizeLogValue(v);
    }
    return out;
  }
  return input;
}
