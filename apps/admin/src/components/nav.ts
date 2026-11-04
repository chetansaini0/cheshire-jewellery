import type { IconName } from "./Icon";

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: "dashboard" },
      { href: "/analytics", label: "Analytics", icon: "chart" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/products", label: "Products", icon: "box" },
      { href: "/inventory", label: "Inventory", icon: "stack" },
      { href: "/collections", label: "Collections", icon: "layers" },
      { href: "/banners", label: "Banners", icon: "image" },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/orders", label: "Orders", icon: "cart" },
      { href: "/customers", label: "Customers", icon: "users" },
      { href: "/coupons", label: "Coupons", icon: "percent" },
      { href: "/returns", label: "Returns", icon: "undo" },
      { href: "/refunds", label: "Refunds", icon: "wallet" },
      { href: "/payments", label: "Payments", icon: "card" },
      { href: "/reviews", label: "Reviews", icon: "star" },
    ],
  },
  {
    title: "Partners",
    items: [
      { href: "/suppliers", label: "Suppliers", icon: "truck" },
      { href: "/integrations", label: "Supplier hub", icon: "plug" },
      { href: "/sync-logs", label: "Sync logs", icon: "list" },
      { href: "/integrations/errors", label: "Integration errors", icon: "alert" },
      { href: "/affiliates", label: "Affiliates", icon: "link" },
      { href: "/commissions", label: "Commissions", icon: "tag" },
      { href: "/payouts", label: "Payouts", icon: "wallet" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/automations", label: "Automations", icon: "zap" },
      { href: "/notifications", label: "Notifications", icon: "bell" },
      { href: "/rewards", label: "Rewards", icon: "gift" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/integrations") return pathname === "/integrations" || pathname.startsWith("/integrations/wizard");
  return pathname === href || pathname.startsWith(`${href}/`);
}
