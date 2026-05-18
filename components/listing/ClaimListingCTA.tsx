// components/listing/ClaimListingCTA.tsx
"use client";

// Two variants:
//   - "hero":   compact badge that lives in the hero on desktop
//   - "inline": full-width card rendered in the main column for mobile / below-the-fold

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import type { Listing } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { ClaimListingDialog } from "./ClaimListingDialog";

interface Props {
  listing: Listing;
  variant: "hero" | "inline";
}

export function ClaimListingCTA({ listing, variant }: Props) {
  const [open, setOpen] = useState(false);

  // Progressive enhancement: also renders an SSR-friendly link to /claim?id=... so the
  // CTA works without JS (and is crawlable). The Dialog hijacks click when JS is available.
  const fallbackHref = `/claim?id=${listing.id}`;

  if (variant === "hero") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-left transition hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label={`Claim the ${listing.name} listing`}
        >
          <div className="flex items-center gap-2 text-amber-900">
            <BadgeCheck className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold">Is this your business?</span>
          </div>
          <p className="mt-1 text-sm text-amber-900/80">
            Claim this listing to respond to reviews, update your details, and reach more customers.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-900 group-hover:underline">
            Claim this Listing <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </button>

        {/* Crawlable fallback for SSR / no-JS — visually hidden but in the DOM */}
        <Link href={fallbackHref} className="sr-only">
          Claim this Listing
        </Link>

        <ClaimListingDialog open={open} onOpenChange={setOpen} listing={listing} />
      </>
    );
  }

  // Inline variant
  return (
    <>
      <section
        aria-labelledby="claim-listing-heading"
        className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200 p-6 sm:p-8"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="claim-listing-heading" className="text-xl font-bold text-amber-950">
              Own {listing.name}?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-amber-900/80">
              Claim this listing to verify your details, respond to reviews, and unlock free lead-capture tools.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 shrink-0"
          >
            Claim this Listing
          </Button>
        </div>
        <Link href={fallbackHref} className="sr-only">
          Claim this Listing
        </Link>
      </section>

      <ClaimListingDialog open={open} onOpenChange={setOpen} listing={listing} />
    </>
  );
}
