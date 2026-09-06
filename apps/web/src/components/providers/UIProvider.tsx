"use client";

import { createContext, useContext, useMemo, useState } from "react";

type UIContextValue = {
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  toggleCart: () => void;
  toggleSearch: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const value = useMemo(
    () => ({
      cartOpen,
      searchOpen,
      setCartOpen,
      setSearchOpen,
      toggleCart: () => setCartOpen((v) => !v),
      toggleSearch: () => setSearchOpen((v) => !v),
    }),
    [cartOpen, searchOpen]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
