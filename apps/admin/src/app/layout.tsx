import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { AdminShell } from "@/components/AdminShell";
import { FeedbackProvider } from "@/components/feedback";
import { authMode } from "@/lib/auth";
import { isReadOnlyDataStore } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "CHESHIRE Admin", template: "%s · CHESHIRE Admin" },
  description: "Catalogue, orders and content operations for CHESHIRE",
  robots: { index: false, follow: false },
};

// Applies the saved theme before paint so there is no light→dark flash.
const themeScript = `try{var t=localStorage.getItem("ch-admin-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`} suppressHydrationWarning>
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
