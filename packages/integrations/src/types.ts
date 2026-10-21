import type { CategorySlug, ProductType, SupplierOrderStatus } from "@cheshire/types";

export type IntegrationType =
  | "API"
  | "CSV"
  | "XML"
  | "MANUAL"
  | "SHOPIFY"
  | "WOOCOMMERCE"
  | "CUSTOM"
  | "MOCK";

export type IntegrationStatus =
  | "NOT_CONFIGURED"
  | "CONFIGURED"
  | "CONNECTED"
  | "ERROR"
  | "DISABLED"
  | "PENDING";

export type ConnectorCapability =
  | "PRODUCT_SYNC"
  | "INVENTORY_SYNC"
  | "PRICE_SYNC"
  | "ORDER_SUBMISSION"
  | "ORDER_STATUS_SYNC"
  | "TRACKING_SYNC"
  | "CANCELLATION"
  | "WEBHOOKS";

export type OperationalSupplierStatus =
  | "APPLICATION_PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "INTEGRATION_PENDING"
  | "INTEGRATION_TESTING"
  | "READY"
  | "ACTIVE"
  | "PAUSED"
  | "SUSPENDED"
  | "REJECTED";

export type ImportLifecycle =
  | "IMPORT_PENDING"
  | "IMPORTED"
  | "ADMIN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "LIVE"
  | "PAUSED"
  | "SOURCE_UNAVAILABLE"
  | "ARCHIVED";

export type PermissionStatus = "UNKNOWN" | "APPROVED" | "REJECTED";

export type SyncKind =
  | "PRODUCT"
  | "INVENTORY"
  | "PRICE"
  | "ORDER"
  | "TRACKING"
  | "HEALTH";

export type SyncJobStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED" | "DEAD_LETTER";

export type SyncSchedule = "15m" | "30m" | "1h" | "6h" | "daily" | "manual";

export type PricingMethod = "FIXED_MARGIN" | "PERCENT_MARGIN" | "COMMISSION_MARKUP";

export type SafeError = {
  code: string;
  message: string;
  retryable: boolean;
};

export type CapabilityResult<T> =
  | { ok: true; supported: true; data: T }
  | { ok: false; supported: true; error: SafeError }
  | { ok: false; supported: false; reason: string };

export type ConnectorCredentials = {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
  webhookSecret?: string;
  extra?: Record<string, string>;
};

export type ConnectorContext = {
  supplierId: string;
  integrationId: string;
  credentials: ConnectorCredentials;
  simulateFailure?: "health" | "products" | "inventory" | "order" | "timeout";
};

export type RawSupplierProduct = {
  supplierProductId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  material?: string;
  color?: string;
  size?: string;
  weight?: string;
  stoneType?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images?: string[];
  videoUrl?: string;
  sourceUrl?: string;
  raw?: Record<string, unknown>;
};

export type InventorySnapshot = {
  supplierProductId: string;
  sku?: string;
  stock: number;
};

export type PriceSnapshot = {
  supplierProductId: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
};

export type FulfillmentAddress = {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type NormalizedSupplierOrderItem = {
  supplierProductId: string;
  sku: string;
  name: string;
  quantity: number;
  size?: string | null;
};

export type NormalizedSupplierOrder = {
  cheshireOrderId: string;
  cheshireOrderNumber: string;
  items: NormalizedSupplierOrderItem[];
  shipping: FulfillmentAddress;
  shippingMethod?: string;
  notes?: string;
  paymentStatus: "PAID" | "PENDING" | "COD";
};

export type TrackingInfo = {
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: string;
  estimatedDelivery?: string;
};

export type ShippingProviderId =
  | "supplier"
  | "manual"
  | "shiprocket"
  | "delhivery"
  | "bluedart"
  | "indiapost";

export type FeatureFlags = {
  SUPPLIER_SYNC_ENABLED: boolean;
  AUTO_ORDER_SUBMISSION_ENABLED: boolean;
  AUTO_PRICE_SYNC_ENABLED: boolean;
  AUTO_INVENTORY_SYNC_ENABLED: boolean;
  WEBHOOKS_ENABLED: boolean;
};

export type PricingRule = {
  id: string;
  method: PricingMethod;
  /** Percent (e.g. 20) or fixed rupees depending on method. */
  value: number;
  minMargin?: number;
  maxDiscountPercent?: number;
  rounding?: "none" | "nearest_9" | "nearest_99";
  supplierId?: string;
  categorySlug?: CategorySlug | string;
  productId?: string;
  priority: number;
};

export type PricingQuote = {
  supplierCost: number;
  customerPrice: number;
  margin: number;
  marginPercent: number;
  ruleId: string | null;
  lossRisk: boolean;
  flaggedChange?: { previousCost: number; newCost: number; changePercent: number };
};

export type InventoryView = {
  supplierStock: number;
  reserved: number;
  sold: number;
  available: number;
  status: "IN_STOCK" | "OUT_OF_STOCK";
};

export type ComplianceItemId =
  | "dropshipping_permitted"
  | "image_rights"
  | "content_rights"
  | "blind_shipping"
  | "return_policy"
  | "shipping_policy"
  | "invoice_process"
  | "gst_tax"
  | "cod_process"
  | "customer_support"
  | "integration_tested";

export type ComplianceChecklist = Record<ComplianceItemId, boolean>;

export type BrandingConfig = {
  blindShipping: boolean;
  whiteLabelPackaging: boolean;
  customInvoice: boolean;
  cheshireBranding: "supported" | "unsupported" | "unknown";
};

export type CategoryMapping = {
  id: string;
  supplierId: string;
  supplierCategory: string;
  cheshireCategory: CategorySlug | string;
};

export type MaterialMapping = {
  id: string;
  supplierMaterial: string;
  cheshireMaterial: string;
};

export type StatusMapping = {
  id: string;
  supplierId: string;
  supplierStatus: string;
  cheshireStatus: SupplierOrderStatus;
};

export type ImportedProduct = {
  id: string;
  supplierId: string;
  supplierProductId: string;
  supplierSku: string;
  sku: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  material: string;
  color?: string;
  weight?: string;
  stoneType?: string;
  sizes: string[];
  supplierCost: number;
  previousSupplierCost?: number;
  customerPrice: number;
  compareAtPrice?: number;
  inventory: InventoryView;
  images: Array<{
    sourceUrl: string;
    storedUrl?: string;
    status: PermissionStatus;
    kind: "main" | "gallery" | "lifestyle";
  }>;
  videoUrl?: string;
  sourceUrl?: string;
  lifecycle: ImportLifecycle;
  imageUsagePermission: PermissionStatus;
  contentPermissionStatus: PermissionStatus;
  productType: ProductType;
  lastProductSync?: string;
  lastInventorySync?: string;
  lastPriceSync?: string;
  priceFlag?: string;
  sourceUnavailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupplierIntegration = {
  id: string;
  supplierId: string;
  supplierName: string;
  providerId: string;
  integrationType: IntegrationType;
  integrationStatus: IntegrationStatus;
  operationalStatus: OperationalSupplierStatus;
  capabilities: ConnectorCapability[];
  schedule: SyncSchedule;
  encryptedCredentials?: string;
  hasCredentials: boolean;
  lastHealthAt?: string;
  lastHealthOk?: boolean;
  lastHealthMessage?: string;
  lastSuccessfulSync?: string;
  lastFailedSync?: string;
  productsSynced: number;
  inventorySynced: number;
  ordersSynced: number;
  branding: BrandingConfig;
  compliance: ComplianceChecklist;
  pricing: PricingRule;
  emailFulfillment?: { enabled: boolean; recipient?: string };
  autoSubmitOrders: boolean;
  pauseNewOrders: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SyncLog = {
  id: string;
  supplierId: string;
  supplierName: string;
  kind: SyncKind;
  status: SyncJobStatus;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  attempt: number;
};

export type IntegrationAlert = {
  id: string;
  supplierId: string;
  supplierName: string;
  severity: "info" | "warning" | "critical";
  code: string;
  message: string;
  orderId?: string;
  productId?: string;
  retryCount: number;
  resolution: "open" | "retrying" | "ignored" | "resolved";
  createdAt: string;
  updatedAt: string;
};

export type WebhookRecord = {
  id: string;
  eventId: string;
  supplierId: string;
  type: string;
  receivedAt: string;
  processedAt?: string;
  status: "received" | "processed" | "duplicate" | "rejected";
  payloadHash: string;
};

export type RoutedFulfillment = {
  id: string;
  cheshireOrderNumber: string;
  supplierId: string;
  supplierName: string;
  remoteOrderId?: string;
  status: SupplierOrderStatus | "SUPPLIER_SUBMISSION_FAILED" | "SUPPLIER_ACTION_REQUIRED" | "SUBMITTED_MANUALLY";
  items: NormalizedSupplierOrderItem[];
  shipping: FulfillmentAddress;
  tracking?: TrackingInfo;
  supplierAmount: number;
  commissionAmount: number;
  submission: "api" | "email" | "manual" | "pending";
  createdAt: string;
  updatedAt: string;
};

export type PriceHistoryRow = {
  id: string;
  productId: string;
  supplierId: string;
  oldPrice: number;
  newPrice: number;
  source: string;
  createdAt: string;
};

export type InventoryHistoryRow = {
  id: string;
  productId: string;
  supplierId: string;
  oldStock: number;
  newStock: number;
  source: string;
  createdAt: string;
};

export type PublicImportedProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  category: CategorySlug | string;
  material: string;
  color: string;
  stock: number;
  images: Array<{ id: string; url: string; alt: string; sortOrder: number; isPrimary?: boolean }>;
  sizes: string[];
  productType: ProductType;
  brandSlug: string | null;
  brandName: string | null;
  estimatedDelivery?: string;
  availability: "in_stock" | "out_of_stock" | "unavailable";
  weight?: string;
  stoneType?: string;
};
