// app/layout.tsx — root layout. Header/footer + analytics + global styles.

import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://locallistings.com.au"),
  title: {
    default: "LocalListings — find trusted Australian businesses",
    template: "%s | LocalListings",
  },
  description:
    "Find and compare top-rated local businesses across Australia. Read real customer reviews and request a free quote in seconds.",
  openGraph: { siteName: "LocalListings", locale: "en_AU", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="min-h-screen flex flex-col bg-white text-slate-900">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white"
          >
            <MapPin className="h-4 w-4" />
          </span>
          <span>
            Local<span className="text-emerald-600">Listings</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/locations/vic/melbourne" className="hover:text-slate-900">
            Melbourne
          </Link>
          <Link href="/locations/nsw/sydney" className="hover:text-slate-900">
            Sydney
          </Link>
          <Link href="/locations/qld/brisbane" className="hover:text-slate-900">
            Brisbane
          </Link>
          <Link
            href="/claim"
            className="rounded-lg bg-slate-900 text-white px-4 py-2 hover:bg-slate-800"
          >
            Claim your listing
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-base">
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white"
              >
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <span>
                Local<span className="text-emerald-600">Listings</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-slate-600">
              Independent business directory covering every Australian suburb. Verified Google reviews, real photos,
              free quotes — no ads, no lead-selling.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-900">Browse</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/locations/vic/melbourne" className="hover:text-slate-900">
                  Melbourne
                </Link>
              </li>
              <li>
                <Link href="/locations/nsw/sydney" className="hover:text-slate-900">
                  Sydney
                </Link>
              </li>
              <li>
                <Link href="/locations/qld/brisbane" className="hover:text-slate-900">
                  Brisbane
                </Link>
              </li>
              <li>
                <Link href="/locations/wa/perth" className="hover:text-slate-900">
                  Perth
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-900">For business</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/claim" className="hover:text-slate-900">
                  Claim your listing
                </Link>
              </li>
              <li>
                <a href="mailto:hello@locallistings.com.au" className="hover:text-slate-900">
                  Contact us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {year} LocalListings. Independent business directory. Listings sourced from public profiles.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
