import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { AnalyticsScripts } from "@/lib/analytics";
import { seoDefaults } from "@cheshire/config";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || seoDefaults.siteUrl),
  title: {
    default: seoDefaults.defaultTitle,
    template: seoDefaults.titleTemplate,
  },
  description: seoDefaults.description,
  keywords: [...seoDefaults.keywords],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "CHESHIRE",
    title: seoDefaults.defaultTitle,
    description: seoDefaults.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seoDefaults.defaultTitle,
    description: seoDefaults.description,
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
    <html lang="en">
      <body className="bg-ivory text-ink antialiased">
        <SiteShell>{children}</SiteShell>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
