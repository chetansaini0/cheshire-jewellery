"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { UIProvider, useUI } from "@/components/providers/UIProvider";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { cartOpen, searchOpen } = useUI();
  const pathname = usePathname();
  const supplierApp = pathname?.startsWith("/supplier");

  useEffect(() => {
    document.body.style.overflow = cartOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, searchOpen]);

  if (supplierApp) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <ShellInner>{children}</ShellInner>
    </UIProvider>
  );
}
