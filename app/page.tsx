// app/page.tsx — homepage. Server Component, no DB calls so it renders even
// before any listings have been ingested.

import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  CheckCircle2,
  Wrench,
  Zap,
  Hammer,
  Key,
  Car,
  Stethoscope,
  Scissors,
  Baby,
  ArrowRight,
} from "lucide-react";

const FEATURED_CATEGORIES = [
  { label: "Plumbers", slug: "plumbers", icon: Wrench, blurb: "Drips, blockages, hot water" },
  { label: "Electricians", slug: "electricians", icon: Zap, blurb: "Power, lighting, switchboards" },
  { label: "Roofers", slug: "roofers", icon: Hammer, blurb: "Leaks, gutters, full re-roofs" },
  { label: "Locksmiths", slug: "locksmiths", icon: Key, blurb: "24/7 lockouts, rekeying" },
  { label: "Mechanics", slug: "mechanics", icon: Car, blurb: "Servicing, repairs, roadworthy" },
  { label: "Dentists", slug: "dentists", icon: Stethoscope, blurb: "Check-ups, emergency, cosmetic" },
  { label: "Hair Salons", slug: "hair-salons", icon: Scissors, blurb: "Cuts, colour, styling" },
  { label: "Childcare", slug: "childcare", icon: Baby, blurb: "Daycare, kinder, OSHC" },
] as const;

const FEATURED_SUBURBS: Array<{
  label: string;
  state: string;
  stateSlug: string;
  suburbSlug: string;
  blurb: string;
}> = [
  { label: "Melbourne", state: "VIC", stateSlug: "vic", suburbSlug: "melbourne", blurb: "CBD & inner-city" },
  { label: "Richmond", state: "VIC", stateSlug: "vic", suburbSlug: "richmond", blurb: "Inner east, VIC" },
  { label: "Geelong", state: "VIC", stateSlug: "vic", suburbSlug: "geelong", blurb: "Coastal, VIC" },
  { label: "Frankston", state: "VIC", stateSlug: "vic", suburbSlug: "frankston", blurb: "Bayside, VIC" },
  { label: "Sydney", state: "NSW", stateSlug: "nsw", suburbSlug: "sydney", blurb: "CBD, NSW" },
  { label: "Bondi", state: "NSW", stateSlug: "nsw", suburbSlug: "bondi", blurb: "Eastern beaches, NSW" },
  { label: "Brisbane", state: "QLD", stateSlug: "qld", suburbSlug: "brisbane", blurb: "CBD, QLD" },
  { label: "Perth", state: "WA", stateSlug: "wa", suburbSlug: "perth", blurb: "CBD, WA" },
];

const HOW_IT_WORKS = [
  {
    n: "1",
    title: "Search",
    body: "Tell us what you need and where you are. We index every local business in Australia — not just those who pay.",
  },
  {
    n: "2",
    title: "Compare",
    body: "Side-by-side ratings, verified reviews, real photos, opening hours. Filter to your suburb in one click.",
  },
  {
    n: "3",
    title: "Get a quote",
    body: "Message a business directly from their listing. No middleman, no lead-selling — your details only go to them.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white border-b">
        {/* Decorative blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-amber-200/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Verified Google reviews · No ads
          </span>

          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.05]">
            Find a trusted local business{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              anywhere in Australia
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
            Compare top-rated tradies, services and shops across every Australian suburb. Real reviews, real photos, free
            quotes in two clicks.
          </p>

          {/* Search */}
          <form
            action="/search"
            method="get"
            className="mt-10 mx-auto max-w-2xl flex flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 border border-slate-200 shadow-xl shadow-emerald-900/5"
            role="search"
          >
            <label className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="q"
                placeholder="What service do you need?"
                className="flex-1 bg-transparent outline-none text-base py-3 placeholder:text-slate-400"
                aria-label="Search for a service or business"
              />
            </label>
            <label className="flex-1 flex items-center gap-2 px-3 sm:border-l border-slate-200">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="suburb"
                placeholder="Suburb or postcode"
                className="flex-1 bg-transparent outline-none text-base py-3 placeholder:text-slate-400"
                aria-label="Suburb or postcode"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white px-6 py-3 text-sm font-semibold hover:bg-emerald-700 shadow-sm"
            >
              Search <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>

          {/* Trust badges */}
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Free to use
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              No sign-up required
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Independent reviews
            </li>
          </ul>
        </div>
      </section>

      {/* Stats banner */}
      <section className="border-b bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { stat: "1,200+", label: "Suburbs covered" },
            { stat: "65+", label: "Service categories" },
            { stat: "100%", label: "Verified reviews" },
            { stat: "<2 min", label: "Average reply time" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{s.stat}</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Popular categories</h2>
            <p className="mt-2 text-slate-600">The services Australians need most often — fully indexed and ranked.</p>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FEATURED_CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.slug}>
                <Link
                  href={`/locations/vic/melbourne/${c.slug}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 group-hover:bg-emerald-100 transition">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{c.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{c.blurb}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works */}
      <section className="border-y bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">How LocalListings works</h2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              Three steps from "I need someone" to "they showed up and did the job".
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <li
                key={step.n}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="absolute -top-4 left-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold ring-4 ring-slate-50">
                  {step.n}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Popular suburbs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Browse by city</h2>
            <p className="mt-2 text-slate-600">Every suburb, postcode and regional town across Australia.</p>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURED_SUBURBS.map((s) => (
            <li key={`${s.stateSlug}-${s.suburbSlug}`}>
              <Link
                href={`/locations/${s.stateSlug}/${s.suburbSlug}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{s.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.blurb}</div>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Testimonials / social proof */}
      <section className="border-y bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">What people are saying</h2>
            <p className="mt-2 text-slate-600">Real feedback from real Australians.</p>
          </div>

          <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Found a 24/7 plumber in Richmond in literally 90 seconds — they were at the door an hour later. Saved my floorboards.",
                author: "Priya S.",
                role: "Richmond, VIC",
              },
              {
                quote:
                  "The 'People often say' tags actually told me what mattered. Picked the electrician with 'fair pricing' showing up 5 times.",
                author: "Marcus H.",
                role: "Geelong, VIC",
              },
              {
                quote:
                  "Used it to claim my own business listing. Done in 30 seconds and now I'm getting quote requests every week.",
                author: "Kara T.",
                role: "Bondi, NSW",
              },
            ].map((t) => (
              <li key={t.author} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-0.5 text-amber-500" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-700">"{t.quote}"</blockquote>
                <div className="mt-4 text-sm">
                  <div className="font-semibold text-slate-900">{t.author}</div>
                  <div className="text-slate-500">{t.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* For businesses CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 sm:p-14 text-center text-white relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight relative">Run a local business?</h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto relative">
            Claim your free listing in under a minute. Respond to reviews, update your details, and capture customer
            enquiries directly. No fees, ever.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center relative">
            <Link
              href="/claim"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white px-6 py-3 text-sm font-semibold hover:bg-emerald-400"
            >
              <Phone className="h-4 w-4" aria-hidden /> Claim your listing
            </Link>
            <Link
              href="/locations/vic/melbourne"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 text-white px-6 py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20"
            >
              See an example listing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
