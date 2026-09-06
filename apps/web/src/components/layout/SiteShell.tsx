"use client";

import { useEffect } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { UIProvider, useUI } from "@/components/providers/UIProvider";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { cartOpen, searchOpen } = useUI();

  useEffect(() => {
    document.body.style.overflow = cartOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, searchOpen]);

  return (
    <>
      <SmoothScroll />
      <CustomCursor />
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
