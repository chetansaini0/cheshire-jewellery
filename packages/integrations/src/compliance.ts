import type { ComplianceChecklist, ComplianceItemId } from "./types";

export const COMPLIANCE_LABELS: Record<ComplianceItemId, string> = {
  dropshipping_permitted: "Dropshipping permitted",
  image_rights: "Product image rights confirmed",
  content_rights: "Product content rights confirmed",
  blind_shipping: "Blind shipping confirmed",
  return_policy: "Return policy confirmed",
  shipping_policy: "Shipping policy confirmed",
  invoice_process: "Invoice process confirmed",
  gst_tax: "GST/tax process confirmed",
  cod_process: "COD process confirmed",
  customer_support: "Customer support process confirmed",
  integration_tested: "API/integration tested",
};

export function emptyCompliance(): ComplianceChecklist {
  return {
    dropshipping_permitted: false,
    image_rights: false,
    content_rights: false,
    blind_shipping: false,
    return_policy: false,
    shipping_policy: false,
    invoice_process: false,
    gst_tax: false,
    cod_process: false,
    customer_support: false,
    integration_tested: false,
  };
}

export function complianceScore(list: ComplianceChecklist) {
  const keys = Object.keys(list) as ComplianceItemId[];
  const done = keys.filter((k) => list[k]).length;
  return { done, total: keys.length, ready: done === keys.length, label: `${done}/${keys.length}` };
}

export function canActivateForSales(input: {
  operationalApproved: boolean;
  integrationConnected: boolean;
  compliance: ComplianceChecklist;
  imagePermission: boolean;
  fulfillmentVerified: boolean;
}) {
  return (
    input.operationalApproved &&
    input.integrationConnected &&
    input.compliance.dropshipping_permitted &&
    input.compliance.image_rights &&
    input.compliance.content_rights &&
    input.imagePermission &&
    input.fulfillmentVerified &&
    complianceScore(input.compliance).done >= 8
  );
}
