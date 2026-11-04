import Image from "next/image";
import { imageUrl, isOptimisableImage } from "@/lib/format";

export function Thumb({ id, alt, className = "h-14 w-11", w = 200 }: { id?: string; alt: string; className?: string; w?: number }) {
  if (!id) return <div className={`${className} rounded-md bg-ink/5`} />;
  const src = imageUrl(id, w);
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-md bg-ink/5 ${className}`}>
      <Image src={src} alt={alt} fill sizes={`${w / 2}px`} className="object-cover" unoptimized={!isOptimisableImage(src)} />
    </div>
  );
}
