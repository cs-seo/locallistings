// lib/supabase/queries.ts
// All read paths used by the App Router. Server-only.

import "server-only";
import { getServiceRoleSupabase } from "./server";
import type { Listing, AustralianStateSlug } from "@/types/listing";
import { isStateSlug } from "@/lib/routing/slugs";

const LISTING_COLUMNS = "data"; // we store the canonical Listing JSON in a single `data` jsonb column

/** Fetch a single listing by its route params. Returns null if not found. */
export async function getListingBySlug(params: {
  state: string;
  suburb: string;
  slug: string;
}): Promise<Listing | null> {
  if (!isStateSlug(params.state)) return null;

  const supabase = getServiceRoleSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("state_slug", params.state)
    .eq("suburb_slug", params.suburb)
    .eq("slug", params.slug)
    .maybeSingle();

  if (error) {
    console.error("[queries] getListingBySlug:", error.message);
    return null;
  }
  return (data?.data as Listing) ?? null;
}

/** For generateStaticParams() — top-N most-viewed (or most-reviewed) listings. */
export async function getTopListingSlugs(
  args: { limit?: number } = {},
): Promise<
  Array<{ stateSlug: AustralianStateSlug; suburbSlug: string; slug: string }>
> {
  const supabase = getServiceRoleSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("state_slug, suburb_slug, slug")
    .order("review_count", { ascending: false })
    .limit(args.limit ?? 5_000);
  if (error || !data) return [];
  return data.map((r) => ({
    stateSlug: r.state_slug as AustralianStateSlug,
    suburbSlug: r.suburb_slug,
    slug: r.slug,
  }));
}

export interface CategorySuburbResult {
  listings: Listing[];
  total: number;
}

/** Category hub query — listings of one category in one suburb, ordered by rating × count. */
export async function getListingsByCategorySuburb(params: {
  state: string;
  suburb: string;
  category: string;
  limit?: number;
  offset?: number;
}): Promise<CategorySuburbResult> {
  if (!isStateSlug(params.state)) return { listings: [], total: 0 };

  const supabase = getServiceRoleSupabase();
  const { data, count, error } = await supabase
    .from("listings")
    .select("data", { count: "exact" })
    .eq("state_slug", params.state)
    .eq("suburb_slug", params.suburb)
    .eq("category_slug", params.category)
    .order("rating_score", { ascending: false })
    .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 50) - 1);

  if (error || !data) {
    console.error("[queries] getListingsByCategorySuburb:", error?.message);
    return { listings: [], total: 0 };
  }
  return {
    listings: data.map((r) => r.data as Listing),
    total: count ?? data.length,
  };
}

/** Nearby suburbs for the internal-linking module on category hubs. */
export async function getNearbySuburbs(params: {
  state: string;
  suburb: string;
  category: string;
  limit?: number;
}): Promise<Array<{ suburb: string; suburbSlug: string; count: number }>> {
  if (!isStateSlug(params.state)) return [];
  const supabase = getServiceRoleSupabase();
  const { data, error } = await supabase.rpc("nearby_suburbs_for_category", {
    p_state: params.state,
    p_suburb: params.suburb,
    p_category: params.category,
    p_limit: params.limit ?? 8,
  });
  if (error || !data) return [];
  return data as Array<{ suburb: string; suburbSlug: string; count: number }>;
}

/** Resolve a (state, suburb, category) route to the human labels for headings. */
export async function getCategorySuburbMeta(params: {
  state: string;
  suburb: string;
  category: string;
}): Promise<{ suburb: string; state: string; category: string } | null> {
  if (!isStateSlug(params.state)) return null;
  const supabase = getServiceRoleSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("data")
    .eq("state_slug", params.state)
    .eq("suburb_slug", params.suburb)
    .eq("category_slug", params.category)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const l = data.data as Listing;
  return { suburb: l.address.suburb, state: l.address.state, category: l.category.label };
}
