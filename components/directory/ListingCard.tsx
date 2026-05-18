// components/directory/ListingCard.tsx
// Used on category hubs and search results.

import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import type { Listing } from "@/types/listing";
import { StarRating } from "@/components/shared/StarRating";

interface Props {
  listing: Listing;
  position: number;
}

export function ListingCard({ listing, position }: Props) {
  const hero = listing.images[0];

  return (
    <article className="group relative rounded-2xl border bg-card p-4 sm:p-5 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        {hero && (
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={hero.url}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              sizes="128px"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-muted-foreground">{position}.</span>
            <h3 className="text-lg font-semibold text-foreground">
              <Link
                href={listing.permalinks.listing}
                className="after:absolute after:inset-0 after:rounded-2xl"
              >
                {listing.name}
              </Link>
            </h3>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <StarRating value={listing.rating.aggregate} size="sm" />
            <span className="font-medium text-foreground">
              {listing.rating.aggregate.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({listing.rating.count.toLocaleString()} review{listing.rating.count === 1 ? "" : "s"})
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            <span className="truncate">
              {listing.address.suburb}, {listing.address.state} {listing.address.postcode}
            </span>
          </p>

          {listing.peopleOftenSay.length > 0 && (
            <ul className="mt-2 hidden sm:flex flex-wrap gap-1">
              {listing.peopleOftenSay.slice(0, 3).map((t) => (
                <li
                  key={t.theme}
                  className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 ring-1 ring-emerald-200"
                >
                  {t.theme}
                </li>
              ))}
            </ul>
          )}
        </div>

        {listing.phone && (
          <a
            href={`tel:${listing.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            aria-label={`Call ${listing.name}`}
          >
            <Phone className="h-4 w-4" aria-hidden />
            Call
          </a>
        )}
      </div>
    </article>
  );
}
