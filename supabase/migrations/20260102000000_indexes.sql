-- supabase/migrations/20260102000000_indexes.sql

-- Hot path: category hub queries.
create index listings_category_lookup_idx
  on listings (state_slug, suburb_slug, category_slug, rating_score desc);

-- Hot path: top-listings for generateStaticParams() and homepage.
create index listings_review_count_idx
  on listings (review_count desc);

-- Search: trigram index over the canonical name for fuzzy /search?q=.
create index listings_name_trgm_idx
  on listings using gin (name gin_trgm_ops);

-- Reverse-lookup: state-only pages enumerate suburbs.
create index listings_state_idx
  on listings (state_slug);

-- Leads / claims by listing.
create index leads_listing_idx on leads (listing_id, created_at desc);
create index claims_listing_idx on claims (listing_id, created_at desc);
