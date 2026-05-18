// app/sitemap.ts — dynamic sitemap. Next will produce an index automatically if >50k URLs.
// For very large directories, switch to a sitemap-index strategy split by state.

import type { MetadataRoute } from "next";
import { getServiceRoleSupabase } from "@/lib/supabase/server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://locallistings.com.au";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getServiceRoleSupabase();
  const { data } = await supabase
    .from("listings")
    .select("state_slug, suburb_slug, slug, category_slug, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50_000);

  const entries: MetadataRoute.Sitemap = [{ url: SITE, lastModified: new Date(), priority: 1 }];
  const categoryPages = new Set<string>();

  for (const r of data ?? []) {
    entries.push({
      url: `${SITE}/${r.state_slug}/${r.suburb_slug}/${r.slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    categoryPages.add(`/locations/${r.state_slug}/${r.suburb_slug}/${r.category_slug}`);
  }

  for (const path of categoryPages) {
    entries.push({
      url: `${SITE}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  return entries;
}
