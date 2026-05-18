// components/listing/ListingBreadcrumbs.tsx
// Visible breadcrumb nav. The BreadcrumbList JSON-LD is emitted by ListingJsonLd.

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Listing } from "@/types/listing";
import { stateHref, suburbHref, categoryHref } from "@/lib/routing/permalinks";

interface Props {
  listing: Listing;
}

export function ListingBreadcrumbs({ listing }: Props) {
  const { address, category, name } = listing;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link href="/" className="inline-flex items-center hover:text-foreground" aria-label="Home">
            <Home className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <Link href={stateHref(address.stateSlug)} className="hover:text-foreground">
            {address.state}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <Link
            href={suburbHref({ stateSlug: address.stateSlug, suburbSlug: address.suburbSlug })}
            className="hover:text-foreground"
          >
            {address.suburb}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <Link
            href={categoryHref({
              stateSlug: address.stateSlug,
              suburbSlug: address.suburbSlug,
              categorySlug: category.slug,
            })}
            className="hover:text-foreground"
          >
            {category.label}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li aria-current="page" className="text-foreground font-medium truncate max-w-[60ch]">
          {name}
        </li>
      </ol>
    </nav>
  );
}
