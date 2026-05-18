// app/[state]/[suburb]/[slug]/page.tsx
// Single Listing Page route. Server Component — ISR enabled.
// URL: /[state]/[suburb]/[slug] e.g. /vic/richmond/fixed-fast-plumbing

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListingBySlug, getTopListingSlugs } from "@/lib/supabase/queries";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingAbout } from "@/components/listing/ListingAbout";
import { PeopleOftenSay } from "@/components/listing/PeopleOftenSay";
import { ReviewFeed } from "@/components/listing/ReviewFeed";
import { ListingFAQs } from "@/components/listing/ListingFAQs";
import { ClaimListingCTA } from "@/components/listing/ClaimListingCTA";
import { LeadForm } from "@/components/listing/LeadForm";
import { OpeningHours } from "@/components/listing/OpeningHours";
import { MapEmbed } from "@/components/listing/MapEmbed";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { ListingBreadcrumbs } from "@/components/listing/ListingBreadcrumbs";
import { ListingJsonLd } from "@/components/listing/ListingJsonLd";

export const revalidate = 86_400; // 24h ISR — invalidated on demand via /api/revalidate
export const dynamicParams = true;

interface PageProps {
  params: { state: string; suburb: string; slug: string };
}

/** Pre-build the top-traffic listings at deploy; long tail is on-demand ISR. */
export async function generateStaticParams() {
  // Resilient at build time: if Supabase isn't reachable (env var missing, DB
  // empty, etc.), return [] and let the long tail render on-demand via ISR.
  try {
    const top = await getTopListingSlugs({ limit: 5_000 });
    return top.map((l) => ({ state: l.stateSlug, suburb: l.suburbSlug, slug: l.slug }));
  } catch (err) {
    console.warn("[generateStaticParams] skipping pre-render:", (err as Error).message);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getListingBySlug(params);
  if (!listing) return {};
  return {
    title: listing.seo.title,
    description: listing.seo.metaDescription,
    alternates: { canonical: listing.seo.canonical },
    openGraph: {
      title: listing.seo.title,
      description: listing.seo.metaDescription,
      url: listing.seo.canonical,
      type: "website",
      images: listing.images[0] ? [{ url: listing.images[0].url, alt: listing.images[0].alt }] : [],
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListingBySlug(params);
  if (!listing) notFound();

  return (
    <>
      <ListingJsonLd listing={listing} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <ListingBreadcrumbs listing={listing} />

        <ListingHero listing={listing} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column — wide */}
          <main className="lg:col-span-8 space-y-10">
            <ListingAbout listing={listing} />

            {listing.images.length > 0 && <ListingGallery images={listing.images} />}

            {listing.peopleOftenSay.length > 0 && (
              <PeopleOftenSay tags={listing.peopleOftenSay} />
            )}

            <ReviewFeed reviews={listing.reviews} rating={listing.rating} />

            <ListingFAQs faqs={listing.faqs} />

            {/* Inline claim CTA for mobile/below-the-fold conversion */}
            <ClaimListingCTA listing={listing} variant="inline" />
          </main>

          {/* Right column — sticky sidebar on desktop */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <LeadForm
                listingId={listing.id}
                businessName={listing.name}
                category={listing.category.label}
              />
              {listing.openingHours && listing.openingHours.length > 0 && (
                <OpeningHours hours={listing.openingHours} />
              )}
              <MapEmbed geo={listing.geo} name={listing.name} address={listing.address} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
