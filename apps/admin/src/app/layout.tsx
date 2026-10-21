import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHESHIRE Admin",
  description: "CMS and commerce operations for CHESHIRE",
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/integrations", label: "Supplier hub" },
  { href: "/sync-logs", label: "Sync logs" },
  { href: "/integrations/errors", label: "Integration errors" },
  { href: "/affiliates", label: "Affiliate partners" },
  { href: "/customers", label: "Customers" },
  { href: "/payments", label: "Payments" },
  { href: "/commissions", label: "Commissions" },
  { href: "/payouts", label: "Payouts" },
  { href: "/returns", label: "Returns" },
  { href: "/refunds", label: "Refunds" },
  { href: "/reviews", label: "Reviews" },
  { href: "/coupons", label: "Coupons" },
  { href: "/inventory", label: "Inventory" },
  { href: "/content", label: "Banners" },
  { href: "/collections", label: "Collections" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
  { href: "/rewards", label: "Rewards" },
  { href: "/notifications", label: "Notifications" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
          <aside className="border-b border-line bg-white lg:border-b-0 lg:border-r">
            <div className="px-5 py-5">
              <p className="font-serif text-lg tracking-[0.18em] text-gold-deep">CHESHIRE</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-gold">Admin / CMS</p>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-3 pb-4 no-scrollbar lg:block lg:space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block whitespace-nowrap px-3 py-2 text-sm text-muted hover:bg-ivory hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="px-4 py-6 sm:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
