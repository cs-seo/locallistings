# locallistings.com.au — Project Structure

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Postgres) + Netlify (ISR + Functions)**

```
locallistings/
├── .env.local                              # APIFY_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL
├── .env.example
├── netlify.toml                            # build cmd, ISR headers, function bundling, redirect rules
├── next.config.mjs                         # image domains (lh3.googleusercontent.com etc.), experimental.ppr, redirects
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
│
├── app/                                    # App Router — all routes here
│   ├── layout.tsx                          # Root layout: <html>, fonts, global header/footer, analytics
│   ├── page.tsx                            # Homepage: search bar, popular categories, popular suburbs
│   ├── globals.css                         # Tailwind base + design tokens
│   ├── sitemap.ts                          # Dynamic sitemap index (split by state)
│   ├── robots.ts
│   ├── opengraph-image.tsx                 # Default OG image
│   │
│   ├── locations/                          # Directory hub pages (category × suburb)
│   │   └── [state]/
│   │       ├── page.tsx                    # /locations/vic — suburb index for state
│   │       └── [suburb]/
│   │           ├── page.tsx                # /locations/vic/richmond — all categories in suburb
│   │           └── [category]/
│   │               ├── page.tsx            # /locations/vic/richmond/plumbers — THE money page
│   │               ├── loading.tsx
│   │               └── opengraph-image.tsx
│   │
│   ├── [state]/                            # Single listing routes (flat for SEO)
│   │   └── [suburb]/
│   │       └── [slug]/
│   │           ├── page.tsx                # /vic/richmond/fixed-fast-plumbing — single listing
│   │           ├── loading.tsx
│   │           ├── not-found.tsx
│   │           └── opengraph-image.tsx
│   │
│   ├── search/
│   │   └── page.tsx                        # /search?q=plumber&suburb=richmond
│   │
│   ├── claim/
│   │   └── page.tsx                        # /claim?id=[id] — lead-capture page
│   │
│   └── api/                                # Route handlers (also deploy as Netlify Functions)
│       ├── leads/route.ts                  # POST contact form → Supabase + email notification
│       ├── claim/route.ts                  # POST claim listing → Supabase + ownership flow
│       ├── revalidate/route.ts             # ISR webhook (called from Apify finish hook)
│       └── og/[id]/route.ts                # On-demand OG image generation
│
├── components/
│   ├── ui/                                 # shadcn primitives (Button, Card, Dialog, Input, etc.)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── listing/                            # Single-listing UI
│   │   ├── ListingHero.tsx                 # Name, rating, quick-action buttons, claim badge
│   │   ├── ListingAbout.tsx                # Description + business meta
│   │   ├── PeopleOftenSay.tsx              # AI-summarized review theme tags
│   │   ├── ReviewFeed.tsx                  # Paginated GMB review list
│   │   ├── ListingFAQs.tsx                 # 3 programmatic FAQs (renders FAQPage JSON-LD inline)
│   │   ├── ClaimListingCTA.tsx             # Sticky/inline claim card + modal trigger
│   │   ├── ClaimListingDialog.tsx          # shadcn Dialog wrapping the claim form
│   │   ├── LeadForm.tsx                    # "Send message to business" — sticky desktop sidebar
│   │   ├── OpeningHours.tsx
│   │   ├── MapEmbed.tsx                    # Lazy-loaded Mapbox/Leaflet wrapper
│   │   ├── ListingGallery.tsx              # Optimized <Image/> grid with proper alt text
│   │   ├── ListingBreadcrumbs.tsx          # Renders BreadcrumbList JSON-LD inline
│   │   └── ListingJsonLd.tsx               # LocalBusiness + sub-type schema injector
│   │
│   ├── directory/                          # Category-hub UI (/locations/...)
│   │   ├── CategoryHeader.tsx
│   │   ├── ListingCard.tsx                 # Card used in category lists + search
│   │   ├── ResultsList.tsx
│   │   ├── FilterBar.tsx
│   │   └── SuburbNav.tsx                   # Nearby suburb internal-linking module
│   │
│   ├── search/
│   │   ├── HeroSearchBar.tsx
│   │   └── Autocomplete.tsx
│   │
│   └── shared/
│       ├── SiteHeader.tsx
│       ├── SiteFooter.tsx
│       ├── StarRating.tsx
│       └── OptimizedImage.tsx              # Wraps next/image with our alt-text convention
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser client
│   │   ├── server.ts                       # Server client with service role
│   │   └── queries.ts                      # getListingBySlug, getListingsByCategorySuburb, etc.
│   │
│   ├── apify/
│   │   ├── client.ts                       # Apify SDK wrapper, reads APIFY_API_TOKEN from env
│   │   ├── runScraper.ts                   # Triggers google-maps-scraper actor
│   │   ├── mapListing.ts                   # Raw Apify payload → normalized Listing
│   │   └── types.ts                        # Raw Apify response types
│   │
│   ├── enrichment/
│   │   ├── peopleOftenSay.ts               # Review-theme extraction (Claude Haiku or local heuristic)
│   │   ├── generateFAQs.ts                 # Builds the 3 programmatic FAQs per listing
│   │   └── prompts.ts                      # Centralized LLM prompts
│   │
│   ├── images/
│   │   ├── downloadAndRename.ts            # Pulls GMB image, renames per convention, uploads to Supabase Storage
│   │   ├── slug.ts                         # normalizeSlug() shared util
│   │   └── altText.ts                      # buildAltText(name, category, suburb, state)
│   │
│   ├── seo/
│   │   ├── titles.ts                       # buildListingTitle, buildCategoryTitle
│   │   ├── descriptions.ts
│   │   └── jsonld.ts                       # buildLocalBusinessSchema, buildFAQSchema, buildBreadcrumbSchema
│   │
│   ├── routing/
│   │   ├── slugs.ts                        # State/suburb/business slug helpers, reverse lookups
│   │   └── permalinks.ts                   # listingHref(), categoryHref()
│   │
│   └── utils.ts                            # cn() etc.
│
├── types/
│   ├── listing.ts                          # The canonical Listing type
│   ├── review.ts
│   ├── faq.ts
│   └── apify.ts                            # Raw Apify dataset item type
│
├── schemas/                                # JSON Schema (drives validation in the pipeline)
│   ├── listing.schema.json
│   ├── review.schema.json
│   └── apify-raw.schema.json
│
├── scripts/                                # Node CLI scripts — run via `pnpm tsx scripts/...`
│   ├── ingest.ts                           # Pull from Apify dataset → map → enrich → write to Supabase
│   ├── reingest-suburb.ts                  # Re-scrape a specific suburb/category combo
│   ├── enrich-existing.ts                  # Backfill PeopleOftenSay / FAQs on existing listings
│   └── generate-sitemaps.ts                # Materialize sitemap chunks (>50k URLs / file)
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260101000000_init.sql         # listings, reviews, faqs, claims, leads, suburbs, categories
│   │   ├── 20260102000000_indexes.sql      # Composite (state, suburb, category) + trgm for search
│   │   └── 20260103000000_rls.sql          # Row-level security: public read, service-role write
│   ├── seed.sql
│   └── functions/
│       └── revalidate-on-write.sql         # Trigger that POSTs to /api/revalidate on UPDATE
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-default.png
│
└── tests/
    ├── unit/
    │   ├── mapListing.test.ts
    │   ├── peopleOftenSay.test.ts
    │   └── jsonld.test.ts
    └── e2e/
        └── listing-page.spec.ts            # Playwright: a11y, JSON-LD validity, Core Web Vitals budget
```

## Key architectural notes

**Routing.** The two distinct URL patterns live in two separate route trees inside `app/`. Single-listing routes (`/[state]/[suburb]/[slug]`) sit at the root level — flat for SEO authority — while category hubs are namespaced under `/locations/...`. There's no risk of collision because `[state]` segments are constrained to a fixed set of state slugs (`vic`, `nsw`, `qld`, `wa`, `sa`, `tas`, `act`, `nt`) validated in `lib/routing/slugs.ts`, with a `notFound()` thrown otherwise. Anything not matching falls through to 404.

**ISR + Netlify.** `generateStaticParams()` in each `page.tsx` pre-builds the top-traffic pages at deploy time; the long tail uses `dynamicParams = true` with `revalidate = 86400`. The Apify finish webhook hits `/api/revalidate` to evict specific paths when a listing changes.

**Data flow.** Apify → `scripts/ingest.ts` → `lib/apify/mapListing.ts` (normalize) → `lib/enrichment/*` (themes + FAQs) → `lib/images/downloadAndRename.ts` (rename + upload to Supabase Storage) → Supabase tables. Pages read from Supabase via server-side queries in `lib/supabase/queries.ts`.

**Secrets.** All Apify and Supabase keys are environment-only. The token you shared earlier should be rotated and stored as `APIFY_API_TOKEN` in Netlify's env panel.
