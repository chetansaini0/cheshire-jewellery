import type { IconName } from "./Icon";

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { title: string; items: NavItem[]; /** Folded behind a toggle unless a page inside is open. */ collapsible?: boolean };

/** Five primary sections first; day-to-day store tools next; everything else under "More". */
export const navGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { href: "/", label: "Dashboard", icon: "dashboard" },
      { href: "/products", label: "Products", icon: "box" },
      { href: "/orders", label: "Orders", icon: "cart" },
      { href: "/collections", label: "Collections", icon: "layers" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
  {
    title: "Store",
    items: [
      { href: "/inventory", label: "Inventory", icon: "stack" },
      { href: "/banners", label: "Banners", icon: "image" },
      { href: "/coupons", label: "Coupons", icon: "percent" },
      { href: "/customers", label: "Customers", icon: "users" },
      { href: "/automations", label: "Automations", icon: "zap" },
    ],
  },
  {
    title: "More",
    collapsible: true,
    items: [
      { href: "/analytics", label: "Analytics", icon: "chart" },
      { href: "/returns", label: "Returns", icon: "undo" },
      { href: "/refunds", label: "Refunds", icon: "wallet" },
      { href: "/payments", label: "Payments", icon: "card" },
      { href: "/reviews", label: "Reviews", icon: "star" },
      { href: "/suppliers", label: "Suppliers", icon: "truck" },
      { href: "/integrations", label: "Supplier hub", icon: "plug" },
      { href: "/sync-logs", label: "Sync logs", icon: "list" },
      { href: "/integrations/errors", label: "Integration errors", icon: "alert" },
      { href: "/affiliates", label: "Affiliates", icon: "link" },
      { href: "/commissions", label: "Commissions", icon: "tag" },
      { href: "/payouts", label: "Payouts", icon: "wallet" },
      { href: "/notifications", label: "Notifications", icon: "bell" },
      { href: "/rewards", label: "Rewards", icon: "gift" },
    ],
  },
];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/integrations") return pathname === "/integrations" || pathname.startsWith("/integrations/wizard");
  return pathname === href || pathname.startsWith(`${href}/`);
}
