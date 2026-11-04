import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { AdminShell } from "@/components/AdminShell";
import { FeedbackProvider } from "@/components/feedback";
import { authMode } from "@/lib/auth";
import { isReadOnlyDataStore } from "@/lib/store";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-serif", display: "swap" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "CHESHIRE Admin", template: "%s · CHESHIRE Admin" },
  description: "Catalogue, orders and content operations for CHESHIRE",
  robots: { index: false, follow: false },
};

// Light is the default; dark only when the user picked it in the sidebar. Applied before paint to avoid a flash.
const themeScript = `try{if(localStorage.getItem("ch-admin-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <FeedbackProvider>
          <AdminShell readOnly={isReadOnlyDataStore()} authEnabled={authMode() === "on"}>
            {children}
          </AdminShell>
        </FeedbackProvider>
      </body>
    </html>
  );
}
