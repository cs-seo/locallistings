# locallistings.com.au

Programmatic-SEO business directory for Australia. Next.js 14 (App Router) · TypeScript · Tailwind + shadcn/ui · Supabase Postgres · Netlify (ISR + Functions).

## Quickstart

```bash
pnpm install
cp .env.example .env.local      # fill in keys (see below)
pnpm dlx supabase db push       # apply migrations in /supabase/migrations
pnpm dev                        # local at http://localhost:3000

# One-off scrape + ingest
pnpm ingest --search "plumbers in Richmond VIC"
pnpm ingest --jobs ./scripts/jobs/vic-plumbers.json
```

## Env

All keys live in `.env.example`. Never commit real values — set them on Netlify under **Site settings → Environment variables**.

- `APIFY_API_TOKEN` — Apify Google Maps Scraper
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` — for AI-enriched "People Often Say" + FAQs (falls back to deterministic heuristic if absent)
- `REVALIDATE_SECRET` — required for `/api/revalidate`
- `IP_HASH_SALT` — used to hash IPs in `leads`/`claims` for abuse-rate-limiting

## Architecture in one paragraph

Apify scrapes Google Maps → `scripts/ingest.ts` normalizes the payload via `lib/apify/mapListing.ts` → in parallel: `lib/images/downloadAndRename.ts` re-encodes + uploads images with SEO-friendly filenames, `lib/enrichment/peopleOftenSay.ts` extracts review themes, `lib/enrichment/generateFAQs.ts` produces 3 schema-marked FAQs → the merged `Listing` is upserted into Supabase → `/api/revalidate` triggers ISR for changed paths. Pages read from Supabase via `lib/supabase/queries.ts` and emit `LocalBusiness` + `FAQPage` + `BreadcrumbList` JSON-LD from `components/listing/ListingJsonLd.tsx`.

## Project structure

See [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) for the annotated tree.
