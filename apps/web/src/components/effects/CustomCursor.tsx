"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desktop custom cursor. System cursor stays visible as fallback
 * until the custom cursor has received its first move event.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<"dot" | "expand" | "cta">("dot");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (reduceMotion || isTouch) return;

    const el = ref.current;
    if (!el) return;

    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      if (!hasMoved) {
        hasMoved = true;
        el.classList.add("is-visible");
        document.documentElement.classList.add("custom-cursor-active");
        setActive(true);
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as
        | HTMLElement
        | null;
      if (!target) {
        setMode("dot");
        setLabel("");
        return;
      }
      const type = target.dataset.cursor || "expand";
      if (type === "view" || type === "shop") {
        setMode("cta");
        setLabel(type.toUpperCase());
      } else if (type === "drag") {
        setMode("cta");
        setLabel("DRAG");
      } else {
        setMode("expand");
        setLabel("");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver);
    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`cheshire-cursor ${active ? "is-visible" : ""} ${
        mode === "expand" ? "is-expanded" : ""
      } ${mode === "cta" ? "is-cta" : ""}`}
      aria-hidden
    >
      {label}
    </div>
  );
}
