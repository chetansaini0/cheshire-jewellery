export type UserRole = "CUSTOMER" | "ADMIN" | "SUPPORT";

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

export type ProductBadge = "BESTSELLER" | "NEW" | "LIMITED" | "SALE" | null;

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
  | "rings"
  | "necklaces"
  | "chains"
  | "earrings"
  | "bracelets"
  | "anklets"
  | "sets";

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
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: Product;
  variant?: ProductVariant | null;
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
  rewards: RewardSummary;
  notificationPrefs: {
    orderUpdates: boolean;
    drops: boolean;
    promotions: boolean;
    wishlistAlerts: boolean;
  };
}
