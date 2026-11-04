import { NextResponse, type NextRequest } from "next/server";
import { authMode, SESSION_COOKIE, verifySessionToken } from "./lib/auth";

const MISCONFIGURED_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Admin locked · CHESHIRE</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F7F5F0;color:#111111;font:15px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:520px;padding:40px;background:#fff;border:1px solid #E8E4DD;border-radius:14px;box-shadow:0 10px 30px -12px rgba(17,17,17,.12)}h1{font-family:Georgia,serif;font-weight:500;font-size:30px;margin:0 0 12px}code{background:#EFE7D8;padding:2px 6px;border-radius:4px}p{color:#6B6560}.tag{display:inline-block;background:#A6844A;color:#fff;font-weight:700;font-size:11px;letter-spacing:.2em;padding:4px 8px;margin-bottom:16px}</style></head>
<body><main><span class="tag">ADMIN LOCKED</span><h1>Admin password not set</h1><p>This admin panel is protected, but no password has been configured for this deployment, so access is blocked.</p><p>Set the <code>ADMIN_PASSWORD</code> environment variable (Vercel → Project → Settings → Environment Variables, or <code>apps/admin/.env.local</code> locally) and redeploy.</p></main></body></html>`;

export async function middleware(req: NextRequest) {
  const mode = authMode();
  if (mode === "off") return NextResponse.next();
  if (mode === "misconfigured") {
    return new NextResponse(MISCONFIGURED_HTML, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });
  }

  const { pathname, search } = req.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  // Server actions / fetches get a 401 instead of an HTML redirect.
  if (req.method !== "GET" && req.method !== "HEAD") return new NextResponse("Signed out. Reload the page to sign in again.", { status: 401 });

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname === "/" && !search ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)"],
};
