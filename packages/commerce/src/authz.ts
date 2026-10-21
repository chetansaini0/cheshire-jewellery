import type { UserRole } from "@cheshire/types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 1,
  SUPPLIER: 2,
  SUPPORT: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function hasRole(role: UserRole | undefined, allowed: UserRole[]) {
  return Boolean(role && allowed.includes(role));
}

export function isAdminRole(role: UserRole | undefined) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function assertSupplierScope(params: {
  role?: UserRole;
  actorSupplierId?: string | null;
  resourceSupplierId: string;
}) {
  if (isAdminRole(params.role)) return true;
  if (params.role !== "SUPPLIER") return false;
  return params.actorSupplierId === params.resourceSupplierId;
}

export function canPublishProducts(status: string) {
  return status === "approved" || status === "APPROVED";
}
