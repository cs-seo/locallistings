-- supabase/migrations/20260101000000_init.sql
-- Schema for locallistings.com.au — listings, leads, claims.

set search_path = public;

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- =====================================================================
-- listings
-- One row per business. Hot-path columns are denormalized; `data` holds
-- the canonical Listing JSON (mirrors /schemas/listing.schema.json).
-- =====================================================================
create table listings (
  id              uuid primary key default uuid_generate_v4(),
  place_id        text unique not null,             -- Google Place ID — dedupe key
  slug            text not null,
  name            text not null,
  state_slug      text not null check (state_slug in ('vic','nsw','qld','wa','sa','tas','act','nt')),
  suburb_slug     text not null,
  category_slug   text not null,
  review_count    integer not null default 0,
  rating_score    double precision not null default 0,
  data            jsonb not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index listings_unique_path on listings (state_slug, suburb_slug, slug);

-- =====================================================================
-- leads — contact form submissions
-- =====================================================================
create table leads (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid not null references listings(id) on delete cascade,
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  ip_hash      text,                                -- sha256(ip + salt) for abuse-rate-limiting
  user_agent   text,
  status       text not null default 'new'
               check (status in ('new','forwarded','contacted','closed')),
  created_at   timestamptz not null default now()
);

-- =====================================================================
-- claims — "Claim this Listing" submissions
-- =====================================================================
create table claims (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid not null references listings(id) on delete cascade,
  name         text not null,
  email        text not null,
  phone        text,
  role         text,
  notes        text,
  status       text not null default 'pending'
               check (status in ('pending','verifying','verified','rejected')),
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- =====================================================================
-- nearby_suburbs_for_category
-- RPC: returns suburbs within ~25km of `p_suburb` that also have listings
-- in `p_category`, ordered by distance.
-- =====================================================================
create or replace function nearby_suburbs_for_category(
  p_state text,
  p_suburb text,
  p_category text,
  p_limit integer default 8
)
returns table(suburb text, "suburbSlug" text, count bigint)
language sql
stable
as $$
  with center as (
    select (data->'geo'->>'lat')::double precision as lat,
           (data->'geo'->>'lng')::double precision as lng
    from listings
    where state_slug = p_state and suburb_slug = p_suburb
    limit 1
  ),
  candidates as (
    select
      data->'address'->>'suburb' as suburb,
      suburb_slug,
      (data->'geo'->>'lat')::double precision as lat,
      (data->'geo'->>'lng')::double precision as lng
    from listings, center
    where listings.state_slug = p_state
      and listings.category_slug = p_category
      and listings.suburb_slug <> p_suburb
      -- crude bounding box: ~25km at AU latitudes
      and abs((data->'geo'->>'lat')::double precision - center.lat) < 0.25
      and abs((data->'geo'->>'lng')::double precision - center.lng) < 0.30
  )
  select c.suburb, c.suburb_slug as "suburbSlug", count(*)::bigint
  from candidates c, center
  group by c.suburb, c.suburb_slug, center.lat, center.lng
  order by min(
    -- haversine-ish; good enough for nearest-suburb ranking
    (c.lat - center.lat) * (c.lat - center.lat) +
    (c.lng - center.lng) * (c.lng - center.lng)
  ) asc
  limit p_limit;
$$;
