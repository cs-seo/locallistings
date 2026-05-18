// scripts/ingest.ts
// Orchestrates: Apify scrape -> normalize -> enrich (themes + FAQs) -> images -> upsert into Supabase.
//
// Run:
//   pnpm tsx scripts/ingest.ts --search "plumbers in Richmond VIC" --search "plumbers in Geelong VIC"
//
// Or chunked via a JSON job file:
//   pnpm tsx scripts/ingest.ts --jobs ./scripts/jobs/vic-plumbers.json

import { parseArgs } from "node:util";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { runGoogleMapsScraper } from "@/lib/apify/runScraper";
import { mapApifyToListing, type ApifyRawPlace } from "@/lib/apify/mapListing";
import { downloadAndRenameImages } from "@/lib/images/downloadAndRename";
import { extractPeopleOftenSay } from "@/lib/enrichment/peopleOftenSay";
import { generateFAQs } from "@/lib/enrichment/generateFAQs";
import { getServiceRoleSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/images/slug";
import type { Listing, ListingFAQ } from "@/types/listing";

const PLACEHOLDER_FAQS: [ListingFAQ, ListingFAQ, ListingFAQ] = [
  { question: "placeholder", answer: "placeholder" },
  { question: "placeholder", answer: "placeholder" },
  { question: "placeholder", answer: "placeholder" },
];

interface Job {
  search: string;
  maxPlaces?: number;
  reviewsPerPlace?: number;
}

async function main() {
  const { values } = parseArgs({
    options: {
      search: { type: "string", multiple: true },
      jobs: { type: "string" },
      dryRun: { type: "boolean", default: false },
    },
  });

  const jobs: Job[] = [];
  if (values.jobs) {
    const raw = await fs.readFile(values.jobs, "utf8");
    jobs.push(...(JSON.parse(raw) as Job[]));
  }
  for (const s of values.search ?? []) jobs.push({ search: s });
  if (jobs.length === 0) {
    console.error("No --search or --jobs provided.");
    process.exit(1);
  }

  console.log(`[ingest] ${jobs.length} job(s)`);
  const supabase = getServiceRoleSupabase();
  const upsertedPaths: string[] = [];

  for (const job of jobs) {
    console.log(`\n[ingest] scraping: "${job.search}"`);
    const { runId, places } = await runGoogleMapsScraper({
      searchStringsArray: [job.search],
      maxCrawledPlacesPerSearch: job.maxPlaces ?? 100,
      scrapeReviewsCount: job.reviewsPerPlace ?? 30,
    });
    console.log(`[ingest] got ${places.length} place(s) from run ${runId}`);

    for (const raw of places) {
      try {
        const listing = await processOne(raw, runId);
        if (values.dryRun) {
          console.log("[dry-run]", listing.permalinks.listing);
          continue;
        }
        await upsertListing(supabase, listing);
        upsertedPaths.push(listing.permalinks.listing);
        console.log("  ✓", listing.permalinks.listing);
      } catch (err) {
        console.warn("  ✗ skipped", raw.title, "-", (err as Error).message);
      }
    }
  }

  // Trigger ISR revalidation for everything we touched.
  if (!values.dryRun && upsertedPaths.length > 0) {
    await triggerRevalidate(upsertedPaths);
  }
}

async function processOne(raw: ApifyRawPlace, runId: string): Promise<Listing> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // First pass — map without enrichment, just to get derived slugs & labels.
  const stub = mapApifyToListing(raw, {
    id,
    now,
    actorRunId: runId,
    images: [],
    peopleOftenSay: [],
    faqs: PLACEHOLDER_FAQS,
  });

  // Now do the parallel work using the derived slugs.
  const [images, peopleOftenSay, faqs] = await Promise.all([
    downloadAndRenameImages({
      sourceUrls: raw.imageUrls ?? [],
      businessName: raw.title,
      businessSlug: stub.slug,
      suburb: stub.address.suburb,
      suburbSlug: stub.address.suburbSlug,
      state: stub.address.state,
      category: stub.category.label,
      categorySlug: stub.category.slug,
    }),
    extractPeopleOftenSay(stub.reviews),
    generateFAQs({
      name: stub.name,
      category: stub.category.label,
      suburb: stub.address.suburb,
      state: stub.address.state,
      rating: stub.rating.aggregate,
      reviewsCount: stub.rating.count,
      description: stub.description,
    }),
  ]);

  // Final listing with everything merged in.
  return mapApifyToListing(raw, { id, now, actorRunId: runId, images, peopleOftenSay, faqs });
}

async function upsertListing(supabase: ReturnType<typeof getServiceRoleSupabase>, l: Listing) {
  // The `listings` table stores denormalized hot-path columns + the full canonical JSON.
  // On conflict (placeId) we overwrite — that's the dedupe key from Google.
  const { error } = await supabase.from("listings").upsert(
    {
      id: l.id,
      place_id: l.source.placeId,
      slug: l.slug,
      state_slug: l.address.stateSlug,
      suburb_slug: l.address.suburbSlug,
      category_slug: l.category.slug,
      name: l.name,
      review_count: l.rating.count,
      // composite score for ordering on category hubs: rating × log(review count)
      rating_score: l.rating.aggregate * Math.log10(Math.max(1, l.rating.count) + 1),
      data: l,
      updated_at: l.updatedAt,
    },
    { onConflict: "place_id" },
  );
  if (error) throw new Error(`upsert failed: ${error.message}`);
}

async function triggerRevalidate(paths: string[]) {
  const url = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`
    : "http://localhost:3000/api/revalidate";
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.warn("[ingest] REVALIDATE_SECRET not set, skipping revalidation");
    return;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
    body: JSON.stringify({ paths }),
  });
  console.log(`[ingest] revalidate -> ${res.status} for ${paths.length} path(s)`);
}

// Use slugify here so tsx doesn't tree-shake the import if we ever decide to add tests.
void slugify;

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
