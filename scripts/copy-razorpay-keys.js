const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const srcPath = path.join(root, "reviewflow-ai", ".env.local");
const src = fs.readFileSync(srcPath, "utf8");

const map = {};
for (const line of src.split(/\r?\n/)) {
  const m = line.match(
    /^(RAZORPAY_KEY_ID|RAZORPAY_KEY_SECRET|NEXT_PUBLIC_RAZORPAY_KEY_ID|RAZORPAY_WEBHOOK_SECRET)=(.*)$/
  );
  if (m) map[m[1]] = m[2];
}

if (!map.RAZORPAY_KEY_ID || !map.RAZORPAY_KEY_SECRET) {
  console.error("missing Razorpay keys in reviewflow-ai/.env.local");
  process.exit(1);
}

if (!map.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
  map.NEXT_PUBLIC_RAZORPAY_KEY_ID = map.RAZORPAY_KEY_ID;
}

function upsert(file) {
  let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  for (const [k, v] of Object.entries(map)) {
    const re = new RegExp("^" + k + "=.*$", "m");
    if (re.test(text)) text = text.replace(re, k + "=" + v);
    else {
      if (text && !text.endsWith("\n")) text += "\n";
      text += k + "=" + v + "\n";
    }
  }
  fs.writeFileSync(file, text);
}

const cheshire = path.join(root, "cheshire");
upsert(path.join(cheshire, ".env"));
upsert(path.join(cheshire, "apps", "web", ".env.local"));
upsert(path.join(cheshire, "apps", "api", ".env"));

const key = String(map.RAZORPAY_KEY_ID).replace(/['"]/g, "");
console.log("Razorpay keys copied into CHESHIRE env files");
console.log("key_id_prefix=" + key.slice(0, 8));
console.log("mode=" + (key.includes("live") ? "live" : "test"));
