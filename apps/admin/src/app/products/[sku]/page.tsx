import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@cheshire/database/catalog";
import { Icon } from "@/components/Icon";
import { Notice, PageHeader, Pill } from "@/components/ui";
import { duplicateProductAction, revertProductAction } from "@/lib/actions";
import { ConfirmButton } from "@/components/feedback";
import { listCollections } from "@/lib/collections";
import { dateTime } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { ProductForm } from "../ProductForm";

const STOREFRONT_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  return { title: `Edit ${decodeURIComponent(sku)}` };
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ sku: string }>;
  searchParams: Promise<{ saved?: string; duplicated?: string }>;
}) {
  const { sku } = await params;
  const sp = await searchParams;
  const product = getProduct(decodeURIComponent(sku));
  if (!product) notFound();

  return (
    <div>
      <Link href="/products" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink">
        <Icon name="chevronLeft" className="h-3.5 w-3.5" /> Products
      </Link>
      <PageHeader
        eyebrow={product.sku}
        title={product.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={product.status === "active" ? "green" : "gray"}>{product.status}</Pill>
            <Pill tone={product.origin === "admin" ? "lime" : "gray"}>{product.origin === "admin" ? "Created in admin" : "Catalogue product"}</Pill>
            {product.edited && product.updatedAt ? <span>Last saved {dateTime(product.updatedAt)} IST</span> : <span>Not edited yet — showing the original catalogue values</span>}
          </span>
        }
        actions={
          <>
            {product.origin === "catalogue" ? (
              <a href={`${STOREFRONT_URL}/products/${product.slug}`} target="_blank" rel="noreferrer" className="btn-ghost">
                <Icon name="external" /> View on store
              </a>
            ) : null}
            <ConfirmButton run={duplicateProductAction.bind(null, product.sku)} title="Make a draft copy with zero stock">
              <Icon name="copy" /> Duplicate
            </ConfirmButton>
            {product.origin === "catalogue" && product.edited ? (
              <ConfirmButton
                className="btn-danger"
                run={revertProductAction.bind(null, product.sku)}
                confirm={{
                  title: "Undo all your edits?",
                  body: "This product goes back to its original catalogue name, price, stock and photos. Your changes here will be lost.",
                  confirmLabel: "Undo my edits",
                  tone: "danger",
                }}
              >
                Undo my edits
              </ConfirmButton>
            ) : null}
          </>
        }
      />
      {sp.saved ? <Notice>Saved. You can keep editing below.</Notice> : null}
      {sp.duplicated ? (
        <Notice>
          Duplicated from <strong>{sp.duplicated}</strong> as a draft with zero stock. Update the name, colour and stock, then publish.
        </Notice>
      ) : null}
      {!product.edited && product.origin === "catalogue" ? (
        <Notice>Per-size stock is split from the catalogue total until you save it here.</Notice>
      ) : null}
      <ProductForm
        product={product}
        isNew={false}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        collections={listCollections().map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
