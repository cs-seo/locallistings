// components/listing/ReviewFeed.tsx
// SSR list of GMB reviews. Show first 5, then a client-side "Show more" island.

"use client";

import { useState } from "react";
import type { Review, Rating } from "@/types/listing";
import { StarRating } from "@/components/shared/StarRating";
import { Button } from "@/components/ui/button";

interface Props {
  reviews: Review[];
  rating: Rating;
}

const INITIAL = 5;
const PAGE = 10;

export function ReviewFeed({ reviews, rating }: Props) {
  const [shown, setShown] = useState(INITIAL);

  return (
    <section aria-labelledby="reviews-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="reviews-heading" className="text-2xl font-semibold text-foreground">
          Customer reviews
        </h2>
        {rating.count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <StarRating value={rating.aggregate} />
            <span className="text-muted-foreground">
              {rating.aggregate.toFixed(1)} ({rating.count.toLocaleString()})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No reviews yet — be the first to leave one on Google.</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {reviews.slice(0, shown).map((r) => (
            <li key={r.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{r.author}</span>
                  <StarRating value={r.rating} size="sm" />
                </div>
                <time dateTime={r.publishedAt} className="text-xs text-muted-foreground">
                  {new Date(r.publishedAt).toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "short",
                  })}
                </time>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>

              {r.ownerResponse && (
                <div className="mt-4 rounded-lg bg-muted/60 p-3 text-sm">
                  <div className="font-medium text-foreground">Owner&apos;s reply</div>
                  <p className="mt-1 text-muted-foreground">{r.ownerResponse.text}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {shown < reviews.length && (
        <div className="mt-5 text-center">
          <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
            Show {Math.min(PAGE, reviews.length - shown)} more reviews
          </Button>
        </div>
      )}
    </section>
  );
}
