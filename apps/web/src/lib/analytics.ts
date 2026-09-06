"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  window.fbq?.("trackCustom", event, params);
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event, params);
  }
}

export function AnalyticsScripts() {
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (ga) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", ga);
    }

    if (pixel) {
      if (!window.fbq) {
        const n = function (...args: unknown[]) {
          const fn = n as typeof n & {
            callMethod?: (...a: unknown[]) => void;
            queue: unknown[];
          };
          if (fn.callMethod) fn.callMethod(...args);
          else fn.queue.push(args);
        };
        (n as typeof n & { queue: unknown[]; loaded: boolean; version: string }).queue = [];
        (n as typeof n & { loaded: boolean }).loaded = true;
        (n as typeof n & { version: string }).version = "2.0";
        window.fbq = n as Window["fbq"];
        const t = document.createElement("script");
        t.async = true;
        t.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(t);
      }
      window.fbq?.("init", pixel);
      window.fbq?.("track", "PageView");
    }
  }, [ga, pixel]);

  return null;
}
