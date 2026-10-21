import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/catalog";
import { trackAffiliateClick } from "@cheshire/commerce";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const product = getProductBySlug(slug);
  if (!product || product.productType !== "affiliate") {
    return NextResponse.json({ error: "Partner link unavailable" }, { status: 404 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const click = trackAffiliateClick({
      sku: product.sku,
      productId: product.id,
      productName: product.name,
      product,
      sessionId: req.headers.get("x-session-id") || undefined,
      campaign: typeof body.campaign === "string" ? body.campaign : "pdp",
      source: typeof body.source === "string" ? body.source : "pdp",
    });
    return NextResponse.json({
      trackingId: click.trackingId,
      url: click.destinationUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Partner link unavailable";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const product = getProductBySlug(slug);
  if (!product || product.productType !== "affiliate") {
    return NextResponse.redirect(new URL("/shop", _req.url));
  }
  try {
    const click = trackAffiliateClick({
      sku: product.sku,
      productId: product.id,
      productName: product.name,
      product,
      source: "redirect",
    });
    return NextResponse.redirect(click.destinationUrl);
  } catch {
    return NextResponse.redirect(new URL(`/products/${slug}`, _req.url));
  }
}
