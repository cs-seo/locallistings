// components/directory/SuburbNav.tsx
// Internal-linking module: "Plumbers in nearby suburbs" — boosts crawl coverage and topical authority.

import Link from "next/link";
import type { AustralianStateSlug } from "@/types/listing";
import { categoryHref } from "@/lib/routing/permalinks";

interface Props {
  category: string;
  currentSuburb: string;
  stateSlug: string;
  categorySlug: string;
  nearby: Array<{ suburb: string; suburbSlug: string; count: number }>;
}

export function SuburbNav({ category, currentSuburb, stateSlug, categorySlug, nearby }: Props) {
  if (nearby.length === 0) return null;

  return (
    <nav
      aria-label={`${category} in nearby suburbs`}
      className="rounded-2xl border bg-card p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-foreground">
        {category} near {currentSuburb}
      </h2>
      <ul className="mt-3 space-y-2">
        {nearby.map((s) => (
          <li key={s.suburbSlug}>
            <Link
              href={categoryHref({
                stateSlug: stateSlug as AustralianStateSlug,
                suburbSlug: s.suburbSlug,
                categorySlug,
              })}
              className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>
                {category} in {s.suburb}
              </span>
              <span className="text-xs opacity-70">{s.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
