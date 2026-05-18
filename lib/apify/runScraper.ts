// lib/apify/runScraper.ts
// Triggers the compass/crawler-google-places actor and returns the parsed dataset.

import { getApifyClient } from "./client";
import type { ApifyRawPlace } from "./mapListing";

const ACTOR_ID = process.env.APIFY_ACTOR_ID ?? "compass/crawler-google-places";

export interface ScraperInput {
  /** Free-form search terms, e.g. ["plumbers in Richmond, VIC"]. */
  searchStringsArray: string[];
  /** Max places per search term. */
  maxCrawledPlacesPerSearch?: number;
  /** Pull reviews — needed for AggregateRating & PeopleOftenSay. */
  scrapeReviewsCount?: number;
  language?: string;
}

export interface ScraperResult {
  runId: string;
  places: ApifyRawPlace[];
}

export async function runGoogleMapsScraper(input: ScraperInput): Promise<ScraperResult> {
  const client = getApifyClient();
  const run = await client.actor(ACTOR_ID).call({
    searchStringsArray: input.searchStringsArray,
    maxCrawledPlacesPerSearch: input.maxCrawledPlacesPerSearch ?? 100,
    scrapeReviewsCount: input.scrapeReviewsCount ?? 30,
    language: input.language ?? "en",
    countryCode: "au",
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return { runId: run.id, places: items as unknown as ApifyRawPlace[] };
}
