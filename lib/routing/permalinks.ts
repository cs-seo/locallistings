// lib/routing/permalinks.ts
import type { AustralianStateSlug } from "@/types/listing";

export function listingHref(args: {
  stateSlug: AustralianStateSlug;
  suburbSlug: string;
  slug: string;
}): string {
  return `/${args.stateSlug}/${args.suburbSlug}/${args.slug}`;
}

export function categoryHref(args: {
  stateSlug: AustralianStateSlug;
  suburbSlug: string;
  categorySlug: string;
}): string {
  return `/locations/${args.stateSlug}/${args.suburbSlug}/${args.categorySlug}`;
}

export function suburbHref(args: {
  stateSlug: AustralianStateSlug;
  suburbSlug: string;
}): string {
  return `/locations/${args.stateSlug}/${args.suburbSlug}`;
}

export function stateHref(stateSlug: AustralianStateSlug): string {
  return `/locations/${stateSlug}`;
}
