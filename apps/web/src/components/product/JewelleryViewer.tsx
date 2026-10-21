"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

/**
 * Selective 3D viewer scaffold.
 * Load Three.js only on product pages that opt in — never sitewide.
 * Wire @react-three/fiber when product assets include GLB/360 media.
 */
function ViewerFallback() {
  return (
    <div className="flex aspect-square items-center justify-center border border-line bg-line text-xs tracking-[0.16em] uppercase text-muted">
      360° / 3D viewer ready
    </div>
  );
}

function JewelleryViewerInner() {
  return <ViewerFallback />;
}

export const JewelleryViewer = dynamic(() => Promise.resolve(JewelleryViewerInner), {
  ssr: false,
  loading: () => <ViewerFallback />,
});

export function Optional3DMount({ enabled = false }: { enabled?: boolean }) {
  if (!enabled) return null;
  return (
    <Suspense fallback={<ViewerFallback />}>
      <JewelleryViewer />
    </Suspense>
  );
}
