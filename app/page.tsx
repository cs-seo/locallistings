// app/page.tsx — homepage. Server Component, no DB calls so it renders even
// before any listings have been ingested.

import Link from "next/link";
import { Search, MapPin, Star } from "lucide-react";

const FEATURED_CATEGORIES = [
  { label: "Plumbers", slug: "plumbers" },
  { label: "Electricians", slug: "electricians" },
  { label: "Roofers", slug: "roofers" },
  { label: "Locksmiths", slug: "locksmiths" },
  { label: "Mechanics", slug: "mechanics" },
  { label: "Dentists", slug: "dentists" },
  { label: "Hair Salons", slug: "hair-salons" },
  { label: "Childcare", slug: "childcare" },
] as const;

const FEATURED_SUBURBS: Array<{ label: string; state: string; stateSlug: string; suburbSlug: string }> = [
  { label: "Melbourne CBD", state: "VIC", stateSlug: "vic", suburbSlug: "melbourne" },
  { label: "Richmond", state: "VIC", stateSlug: "vic", suburbSlug: "richmond" },
  { label: "Geelong", state: "VIC", stateSlug: "vic", suburbSlug: "geelong" },
  { label: "Sydney CBD", state: "NSW", stateSlug: "nsw", suburbSlug: "sydney" },
  { label: "Bondi", state: "NSW", stateSlug: "nsw", suburbSlug: "bondi" },
  { label: "Brisbane CBD", state: "QLD", stateSlug: "qld", suburbSlug: "brisbane" },
  { label: "Perth CBD", state: "WA", stateSlug: "wa", suburbSlug: "perth" },
  { label: "Adelaide CBD", state: "SA", stateSlug: "sa", suburbSlug: "adelaide" },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Find a trusted local business in Australia
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Compare top-rated tradies, services and shops across every Australian suburb. Verified Google reviews,
            real photos, and a free quote in two clicks.
          </p>

          {/* Search form posts to /search?q=... — page itself is a TODO but the form is wired */}
          <form
            action="/search"
            method="get"
            className="mt-8 mx-auto max-w-2xl flex flex-col sm:flex-row gap-2 rounded-2xl bg-card p-2 border shadow-sm"
            role="search"
          >
            <label className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
              <input
                type="text"
                name="q"
                placeholder="What service do you need?"
                className="flex-1 bg-transparent outline-none text-sm py-3"
                aria-label="Search for a service or business"
              />
            </label>
            <label className="flex-1 flex items-center gap-2 px-3 sm:border-l">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden />
              <input
                type="text"
                name="suburb"
                placeholder="Suburb or postcode"
                className="flex-1 bg-transparent outline-none text-sm py-3"
                aria-label="Suburb or postcode"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-foreground">Popular categories</h2>
        <ul className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURED_CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/locations/vic/melbourne/${c.slug}`}
                className="block rounded-xl border bg-card p-4 text-sm font-medium hover:border-primary hover:shadow-sm transition"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular suburbs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-semibold text-foreground">Browse by city</h2>
        <ul className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURED_SUBURBS.map((s) => (
            <li key={`${s.stateSlug}-${s.suburbSlug}`}>
              <Link
                href={`/locations/${s.stateSlug}/${s.suburbSlug}`}
                className="block rounded-xl border bg-card p-4 hover:border-primary hover:shadow-sm transition"
              >
                <span className="text-sm font-medium">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.state}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Trust strip */}
      <section className="border-t bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">Verified reviews</div>
            <p className="mt-1 text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-amber-500" aria-hidden /> Sourced direct from Google
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">Free to use</div>
            <p className="mt-1 text-sm text-muted-foreground">No signup. No fees. No nonsense.</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">Free quotes</div>
            <p className="mt-1 text-sm text-muted-foreground">Message any business in seconds.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
