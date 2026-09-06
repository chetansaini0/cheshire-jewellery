import type {
  Cart,
  Coupon,
  Order,
  Paginated,
  Product,
  ProductFilters,
  StylistRecommendation,
  StylistRequest,
  StoreLocation,
  UserProfile,
} from "@cheshire/types";

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => string | null | Promise<string | null>;
};

async function request<T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {},
  getToken?: ApiClientOptions["getToken"]
): Promise<T> {
  const token = getToken ? await getToken() : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl, getToken } = options;
  const call = <T>(path: string, init?: RequestInit) =>
    request<T>(baseUrl, path, init, getToken);

  return {
    products: {
      list: (filters?: ProductFilters) => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([k, v]) => {
            if (v === undefined || v === null || v === "") return;
            if (Array.isArray(v)) params.set(k, v.join(","));
            else params.set(k, String(v));
          });
        }
        const qs = params.toString();
        return call<Paginated<Product>>(`/api/products${qs ? `?${qs}` : ""}`);
      },
      get: (slug: string) => call<Product>(`/api/products/${slug}`),
      search: (q: string) =>
        call<{ products: Product[]; categories: string[]; popular: string[] }>(
          `/api/search?q=${encodeURIComponent(q)}`
        ),
    },
    cart: {
      get: () => call<Cart>("/api/cart"),
      add: (productId: string, quantity = 1, variantId?: string) =>
        call<Cart>("/api/cart/items", {
          method: "POST",
          body: JSON.stringify({ productId, quantity, variantId }),
        }),
      update: (itemId: string, quantity: number) =>
        call<Cart>(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        }),
      remove: (itemId: string) =>
        call<Cart>(`/api/cart/items/${itemId}`, { method: "DELETE" }),
      applyCoupon: (code: string) =>
        call<Cart>("/api/cart/coupon", {
          method: "POST",
          body: JSON.stringify({ code }),
        }),
    },
    wishlist: {
      list: () => call<Product[]>("/api/wishlist"),
      toggle: (productId: string) =>
        call<{ wishlisted: boolean }>("/api/wishlist/toggle", {
          method: "POST",
          body: JSON.stringify({ productId }),
        }),
    },
    auth: {
      requestOtp: (target: string) =>
        call<{ ok: boolean }>("/api/auth/otp/request", {
          method: "POST",
          body: JSON.stringify({ target }),
        }),
      verifyOtp: (target: string, code: string) =>
        call<{ token: string; user: UserProfile }>("/api/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ target, code }),
        }),
      me: () => call<UserProfile>("/api/auth/me"),
    },
    orders: {
      list: () => call<Order[]>("/api/orders"),
      get: (id: string) => call<Order>(`/api/orders/${id}`),
      create: (payload: unknown) =>
        call<Order>("/api/orders", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
    },
    payments: {
      createRazorpayOrder: (orderId: string) =>
        call<{ razorpayOrderId: string; amount: number; currency: string }>(
          "/api/payments/razorpay/create",
          { method: "POST", body: JSON.stringify({ orderId }) }
        ),
      verify: (payload: unknown) =>
        call<{ ok: boolean }>("/api/payments/razorpay/verify", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
    },
    stylist: {
      recommend: (input: StylistRequest) =>
        call<StylistRecommendation>("/api/stylist", {
          method: "POST",
          body: JSON.stringify(input),
        }),
    },
    stores: {
      list: (city?: string) =>
        call<StoreLocation[]>(
          `/api/stores${city ? `?city=${encodeURIComponent(city)}` : ""}`
        ),
    },
    coupons: {
      validate: (code: string) =>
        call<Coupon>(`/api/coupons/validate`, {
          method: "POST",
          body: JSON.stringify({ code }),
        }),
    },
  };
}

export type CheshireApi = ReturnType<typeof createApiClient>;
