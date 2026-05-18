-- supabase/migrations/20260103000000_rls.sql
-- Row-level security. Public read on listings (the directory is meant to be public).
-- Leads/claims are write-only from the anon role and only readable by service_role.

alter table listings enable row level security;
alter table leads    enable row level security;
alter table claims   enable row level security;

-- Listings: anyone can read. Writes go through service_role (ingest script + API).
create policy "listings public read"
  on listings for select
  using (true);

create policy "listings service write"
  on listings for all
  to service_role
  using (true) with check (true);

-- Leads: anyone can INSERT (the contact form). Reads only by service_role.
create policy "leads anon insert"
  on leads for insert
  to anon
  with check (true);

create policy "leads service read"
  on leads for select
  to service_role
  using (true);

create policy "leads service all"
  on leads for all
  to service_role
  using (true) with check (true);

-- Claims: same pattern as leads.
create policy "claims anon insert"
  on claims for insert
  to anon
  with check (true);

create policy "claims service read"
  on claims for select
  to service_role
  using (true);

create policy "claims service all"
  on claims for all
  to service_role
  using (true) with check (true);
