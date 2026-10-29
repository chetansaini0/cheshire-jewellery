export type UserRole = "CUSTOMER" | "SUPPLIER" | "ADMIN" | "SUPER_ADMIN" | "SUPPORT";

export type ProductType = "affiliate" | "dropship" | "marketplace";

export type ProductApprovalStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "live";

export type ProductAvailability = "in_stock" | "out_of_stock" | "unavailable";

export type SupplierStatus = "pending_approval" | "approved" | "rejected" | "suspended" | "changes_requested";

export type AffiliatePartnerStatus = "active" | "inactive";

export type SupplierOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned"
  | "refunded";

export type CommissionScope = "global" | "supplier" | "category" | "product" | "collection";

export type ReturnKind = "return" | "replacement" | "refund";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "pickup_scheduled"
  | "picked_up"
  | "received"
  | "inspection"
  | "refund_initiated"
  | "refunded"
  | "rejected";

export type PayoutStatus = "pending" | "processing" | "completed" | "failed" | "on_hold";

export type ImageKind = "main" | "gallery" | "lifestyle" | "video";

export type MediaApprovalStatus = "pending" | "approved" | "rejected";

export type ProductLabel =
  | "EXCLUSIVE"
  | "TRENDING"
  | "NEW"
  | "BEST_SELLER"
  | "LIMITED"
  | "PARTNER_PICK";

export type CommerceEventType =
  | "order_created"
  | "payment_successful"
  | "supplier_order_created"
  | "supplier_accepted"
  | "order_packed"
  | "order_shipped"
  | "order_delivered"
  | "return_requested"
  | "refund_initiated"
  | "refund_completed"
  | "affiliate_click"
  | "affiliate_conversion"
  | "product_view"
  | "add_to_cart"
  | "checkout_started";

export type FulfillmentChannel = "cheshire_checkout" | "affiliate_redirect";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "EXCHANGED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIAL_REFUND";

export type PaymentMethod =
  | "UPI"
  | "CARD"
  | "NETBANKING"
  | "WALLET"
  | "COD"
  | "RAZORPAY";

export type CouponType =
  | "PERCENTAGE"
  | "FLAT"
  | "FREE_SHIPPING"
  | "FIRST_ORDER";

export type ProductBadge = "BESTSELLER" | "NEW" | "LIMITED" | "SALE" | "EXCLUSIVE" | "TRENDING" | "PARTNER_PICK" | null;

export type Mood =
  | "MINIMAL"
  | "BOLD"
  | "ROMANTIC"
  | "DARK"
  | "EVERYDAY"
  | "STATEMENT";

export type Occasion =
  | "EVERYDAY"
  | "DATE_NIGHT"
  | "PARTY"
  | "OFFICE"
  | "WEDDING"
  | "GIFT";

export type StylePreference =
  | "MINIMAL"
  | "BOLD"
  | "CLASSIC"
  | "ROMANTIC"
  | "EDGY";

export type BudgetBand = "UNDER_999" | "999_1999" | "1999_4999" | "5000_PLUS";

export type NotificationType =
  | "NEW_DROP"
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PRICE_DROP"
  | "BACK_IN_STOCK"
  | "WISHLIST_SALE"
  | "ABANDONED_CART"
  | "EXCLUSIVE_DROP"
  | "REWARD"
  | "GENERAL";

export type CategorySlug =
  | "tees"
  | "hoodies"
  | "outerwear"
  | "denim"
  | "dresses"
  | "co-ords"
  | "accessories"
  | "lehengas"
  | "sarees"
  | "suits";

export interface Money {
  amount: number;
  currency: "INR";
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary?: boolean;
  kind?: ImageKind;
  approved?: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  finish?: string | null;
  price: number;
  mrp: number;
  stock: number;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  mrp: number;
  discountPercent: number;
  category: CategorySlug;
  collection?: string | null;
  material: string;
  color: string;
  moods: Mood[];
  occasions: Occasion[];
  tags: string[];
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  stock: number;
  images: ProductImage[];
  hoverImage?: string | null;
  videoUrl?: string | null;
  sizes: string[];
  dimensions?: string | null;
  care?: string | null;
  shippingInfo?: string | null;
  returnsInfo?: string | null;
  warranty?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished: boolean;
  isNew: boolean;
  isBestseller: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  /** Public commerce model. Confidential supplierCost is never included. */
  productType: ProductType;
  brandSlug?: string | null;
  brandName?: string | null;
  subcategory?: string | null;
  stoneType?: string | null;
  weight?: string | null;
  label?: ProductLabel | null;
  estimatedDelivery?: string | null;
  affiliateDisclosure?: boolean;
  availability?: ProductAvailability;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: Product;
  variant?: ProductVariant | null;
}

export interface CartPartition {
  affiliate: CartItem[];
  dropship: CartItem[];
  marketplace: CartItem[];
  fulfillable: CartItem[];
  hasAffiliate: boolean;
  hasFulfillable: boolean;
  isMixed: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  couponCode?: string | null;
}

export interface Address {
  id: string;
  label?: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
  productType?: ProductType;
  supplierId?: string | null;
  fulfillmentChannel?: FulfillmentChannel;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  trackingNumber?: string | null;
  courier?: string | null;
  estimatedDelivery?: string | null;
  address: Address;
  createdAt: string;
  updatedAt: string;
  supplierOrders?: SupplierOrderSummary[];
  isMixed?: boolean;
}

export interface SupplierOrderSummary {
  id: string;
  supplierId: string;
  supplierName: string;
  status: SupplierOrderStatus;
  itemCount: number;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string | null;
  body: string;
  images: string[];
  videoUrl?: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minCartValue?: number | null;
  maxDiscount?: number | null;
  categoryIds?: string[];
  productIds?: string[];
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
}

export interface RewardSummary {
  points: number;
  tier: "MEMBER" | "SILVER" | "GOLD" | "PLATINUM";
  lifetimePoints: number;
  nextTierPoints: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  openingHours: string;
  lat: number;
  lng: number;
}

export interface StylistRequest {
  occasion: Occasion;
  style: StylePreference;
  budget: BudgetBand;
}

export interface StylistRecommendation {
  lookName: string;
  rationale: string;
  products: Product[];
  completeLookIds: string[];
}

export interface AnnouncementBar {
  id: string;
  message: string;
  isActive: boolean;
  link?: string | null;
}

export interface CmsHero {
  headline: string;
  supporting: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  mediaUrl: string;
  mediaType: "image" | "video";
}

export type SortOption =
  | "recommended"
  | "newest"
  | "bestselling"
  | "top_rated"
  | "price_asc"
  | "price_desc";

export interface ProductFilters {
  category?: CategorySlug | "all";
  priceMin?: number;
  priceMax?: number;
  material?: string[];
  color?: string[];
  size?: string[];
  style?: Mood[];
  collection?: string[];
  occasion?: Occasion[];
  availability?: "in_stock" | "all";
  sort?: SortOption;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserProfile {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  supplierId?: string | null;
  rewards: RewardSummary;
  notificationPrefs: {
    orderUpdates: boolean;
    drops: boolean;
    promotions: boolean;
    wishlistAlerts: boolean;
  };
}

export interface AffiliatePartnerPublic {
  id: string;
  name: string;
  slug: string;
  status: AffiliatePartnerStatus;
}

export interface SupplierPublic {
  id: string;
  brandName: string;
  slug: string;
  status: SupplierStatus;
}

export interface CheckoutAddressInput {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface OrchestratedCheckout {
  parentOrder: Order;
  supplierOrders: SupplierOrderSummary[];
  affiliateRedirects: Array<{ productId: string; productName: string; trackingId: string }>;
  cheshireRevenue: number;
  supplierRevenue: number;
}
