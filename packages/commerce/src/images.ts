const ALLOWED_HOSTS = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
  "images.cheshire.com",
]);

export type ImageKind = "MAIN" | "GALLERY" | "LIFESTYLE" | "VIDEO";
export type MediaApproval = "PENDING" | "APPROVED" | "REJECTED";

export function isPermittedMediaUrl(url: string, extraHosts: string[] = []): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (ALLOWED_HOSTS.has(parsed.hostname)) return true;
    return extraHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function assertPermittedMediaUrl(url: string, extraHosts: string[] = []): void {
  if (!isPermittedMediaUrl(url, extraHosts)) {
    throw new Error("External media URL is not permitted");
  }
}

export function cdnImageUrl(url: string, width: number): string {
  if (url.includes("images.unsplash.com")) {
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}auto=format&fit=crop&w=${width}&q=80`;
  }
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}
