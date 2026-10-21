export const ROLES = ["CUSTOMER", "SUPPLIER", "ADMIN", "SUPER_ADMIN", "SUPPORT"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  admin: ["ADMIN", "SUPER_ADMIN"],
  superAdmin: ["SUPER_ADMIN"],
  supplier: ["SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  customer: ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "SUPPORT"],
} as const;

export function hasRole(role: string | undefined, allowed: readonly string[]): boolean {
  return Boolean(role && allowed.includes(role));
}

export function assertSupplierScope(params: {
  role: string | undefined;
  actorSupplierId?: string | null;
  resourceSupplierId?: string | null;
}): void {
  if (hasRole(params.role, PERMISSIONS.admin)) return;
  if (params.role !== "SUPPLIER") {
    const error = new Error("Forbidden");
    (error as Error & { status: number }).status = 403;
    throw error;
  }
  if (!params.actorSupplierId || params.actorSupplierId !== params.resourceSupplierId) {
    const error = new Error("Forbidden");
    (error as Error & { status: number }).status = 403;
    throw error;
  }
}

export function canSeeCustomerPii(role: string | undefined): boolean {
  return hasRole(role, PERMISSIONS.admin);
}

export function sanitizeCustomerForSupplier<T extends { email?: string | null; phone?: string | null }>(
  customer: T,
  role: string | undefined
): T {
  if (canSeeCustomerPii(role)) return customer;
  return {
    ...customer,
    email: customer.email ? maskEmail(customer.email) : customer.email,
    phone: customer.phone ? maskPhone(customer.phone) : customer.phone,
  };
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "***";
  return `${name.slice(0, 1)}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 4 ? `******${digits.slice(-4)}` : "****";
}
