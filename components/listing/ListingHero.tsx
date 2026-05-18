// components/listing/ListingHero.tsx
// Hero band: name, rating, address, primary actions, claim badge.
// Server Component — no interactivity here; CTAs are <a>/<Link> or small client islands.

import Link from "next/link";
import { Phone, Globe, MessageSquare, MapPin, BadgeCheck } from "lucide-react";
import type { Listing } from "@/types/listing";
import { StarRating } from "@/components/shared/StarRating";
import { Button } from "@/components/ui/button";
import { ClaimListingCTA } from "./ClaimListingCTA";

interface Props {
  listing: Listing;
}

export function ListingHero({ listing }: Props) {
  const { name, rating, category, address, phone, website, claim } = listing;
  const isUnclaimed = !claim || claim.status !== "verified";

  return (
    <section className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{category.label}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {address.suburb}, {address.state}
            </span>
            {claim?.status === "verified" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified
              </span>
            )}
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StarRating value={rating.aggregate} />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{rating.aggregate.toFixed(1)}</strong>
              {" "}
              ({rating.count.toLocaleString()} review{rating.count === 1 ? "" : "s"})
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {phone && (
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <a href={`tel:${phone}`} aria-label={`Call ${name}`}>
                  <Phone className="mr-2 h-4 w-4" aria-hidden /> Call now
                </a>
              </Button>
            )}
            {website && (
              <Button asChild size="lg" variant="outline">
                <a href={website} target="_blank" rel="noopener noreferrer nofollow">
                  <Globe className="mr-2 h-4 w-4" aria-hidden /> Visit website
                </a>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link href="#lead-form">
                <MessageSquare className="mr-2 h-4 w-4" aria-hidden /> Get a quote
              </Link>
            </Button>
          </div>
        </div>

        {/* Right side: claim badge on desktop hero */}
        {isUnclaimed && (
          <div className="lg:max-w-xs w-full">
            <ClaimListingCTA listing={listing} variant="hero" />
          </div>
        )}
      </div>
    </section>
  );
}
