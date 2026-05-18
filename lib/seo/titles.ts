// lib/seo/titles.ts
import type { AustralianState } from "@/types/listing";

const SITE = "LocalListings";

/**
 * Listing title:  "Fixed Fast Plumbing — Plumber in Richmond VIC | LocalListings"
 * Kept under 70 chars where possible (Google truncates around 600px).
 */
export function buildListingTitle(args: {
  name: string;
  category: string;
  suburb: string;
  state: AustralianState;
}): string {
  const core = `${args.name} — ${args.category} in ${args.suburb} ${args.state}`;
  const full = `${core} | ${SITE}`;
  return full.length <= 70 ? full : core.slice(0, 67) + "…";
}

/**
 * Category hub title:  "Best Plumbers in Richmond VIC | LocalListings"
 */
export function buildCategoryTitle(args: {
  category: string;
  suburb: string;
  state: AustralianState;
}): string {
  return `Best ${args.category} in ${args.suburb} ${args.state} | ${SITE}`;
}
