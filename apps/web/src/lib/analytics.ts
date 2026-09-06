"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
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
      window.gtag = function gtag(...args: unknown[]) {
        (window as unknown as { dataLayer: unknown[] }).dataLayer =
          (window as unknown as { dataLayer: unknown[] }).dataLayer || [];
        (window as unknown as { dataLayer: unknown[] }).dataLayer.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", ga);
    }
    if (pixel) {
      // Meta Pixel bootstrap — load only when ID present
      /* eslint-disable */
      !(function (f: any, b, e, v) {
        if (f.fbq) return;
        const n: any = (f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        });
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        const t = b.createElement(e);
        t.async = true;
        t.src = v;
        const s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      window.fbq?.("init", pixel);
      window.fbq?.("track", "PageView");
    }
  }, [ga, pixel]);

  return null;
}
