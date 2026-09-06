const fs = require("fs");
const t = fs.readFileSync("apps/web/.env.local", "utf8");
const id = ((t.match(/^RAZORPAY_KEY_ID=(.*)$/m) || [])[1] || "").replace(/['"]/g, "");
console.log("web_env_key_prefix=" + id.slice(0, 8));
console.log("secret_present=" + /^RAZORPAY_KEY_SECRET=.+/m.test(t));
console.log("public_key_present=" + /^NEXT_PUBLIC_RAZORPAY_KEY_ID=.+/m.test(t));
