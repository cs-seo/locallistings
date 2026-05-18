// components/listing/ListingGallery.tsx
// Mobile-first masonry-ish gallery. First image is hero-sized for LCP; rest are a tight grid.

import Image from "next/image";
import type { ListingImage } from "@/types/listing";

interface Props {
  images: ListingImage[];
}

export function ListingGallery({ images }: Props) {
  if (images.length === 0) return null;
  const [primary, ...rest] = images;

  return (
    <section aria-label={`Photos of ${primary.alt.split(" - ")[0]}`} className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={primary.url}
          alt={primary.alt}
          width={primary.width}
          height={primary.height}
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="h-full w-full object-cover"
        />
      </div>

      {rest.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rest.slice(0, 8).map((img) => (
            <li key={img.url} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={img.url}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 200px"
                className="h-full w-full object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
