const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

process.env.NODE_OPTIONS = "--use-system-ca";

const envPath = path.join(__dirname, "..", "apps", "web", ".env.local");
const text = fs.readFileSync(envPath, "utf8");
const wanted = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_WEBHOOK_SECRET",
];

const values = {};
for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && wanted.includes(m[1])) {
    values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
if (!values.NEXT_PUBLIC_RAZORPAY_KEY_ID && values.RAZORPAY_KEY_ID) {
  values.NEXT_PUBLIC_RAZORPAY_KEY_ID = values.RAZORPAY_KEY_ID;
}
values.NEXT_PUBLIC_SITE_URL = "https://cheshire-web.vercel.app";

const cwd = path.join(__dirname, "..");
for (const [key, value] of Object.entries(values)) {
  if (!value) continue;
  for (const target of ["production", "preview"]) {
    try {
      execFileSync(
        "npx",
        [
          "vercel",
          "env",
          "add",
          key,
          target,
          "--value",
          value,
          "--yes",
          "--force",
          "--scope",
          "chetansaini0s-projects",
        ],
        { cwd, stdio: ["ignore", "pipe", "pipe"], env: process.env }
      );
      console.log("ok=" + key + ":" + target);
    } catch (e) {
      const msg = String((e.stderr && e.stderr.toString()) || e.message || e);
      console.log("fail=" + key + ":" + target + " :: " + msg.split("\n")[0]);
    }
  }
}
