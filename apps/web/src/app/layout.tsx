import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { AnalyticsScripts } from "@/lib/analytics";
import { seoDefaults } from "@cheshire/config";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || seoDefaults.siteUrl),
  title: {
    default: seoDefaults.defaultTitle,
    template: seoDefaults.titleTemplate,
  },
  description: seoDefaults.description,
  keywords: [...seoDefaults.keywords],
  icons: {
    icon: [
      { url: "/brand/cheshire-mark.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/brand/cheshire-mark.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "CHESHIRE",
    title: seoDefaults.defaultTitle,
    description: seoDefaults.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CHESHIRE — Wear The Moment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoDefaults.defaultTitle,
    description: seoDefaults.description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-ivory text-ink antialiased">
        <SiteShell>{children}</SiteShell>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
