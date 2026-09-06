const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const envPath = path.join(__dirname, "..", "apps", "web", ".env.local");
const text = fs.readFileSync(envPath, "utf8");
const wanted = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

const values = {};
for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && wanted.includes(m[1])) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

if (!values.NEXT_PUBLIC_RAZORPAY_KEY_ID && values.RAZORPAY_KEY_ID) {
  values.NEXT_PUBLIC_RAZORPAY_KEY_ID = values.RAZORPAY_KEY_ID;
}

const project = "cheshire-jewellery";
const scope = "chetansaini0s-projects";

for (const [key, value] of Object.entries(values)) {
  if (!value) continue;
  try {
    execFileSync(
      "npx",
      ["vercel", "env", "add", key, "production", "--value", value, "--yes", "--scope", scope],
      {
        cwd: path.join(__dirname, ".."),
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      }
    );
    console.log("added_production=" + key);
  } catch (e) {
    const msg = String(e.stderr || e.message || e);
    console.log("skip_or_fail=" + key + " :: " + msg.split("\n")[0]);
  }
  try {
    execFileSync(
      "npx",
      ["vercel", "env", "add", key, "preview", "--value", value, "--yes", "--scope", scope],
      {
        cwd: path.join(__dirname, ".."),
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      }
    );
    console.log("added_preview=" + key);
  } catch (e) {
    const msg = String(e.stderr || e.message || e);
    console.log("preview_skip=" + key + " :: " + msg.split("\n")[0]);
  }
}
