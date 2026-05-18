// components/listing/ListingJsonLd.tsx
// Single source of truth for structured data on the listing page.
// Emits LocalBusiness (or specific sub-type), FAQPage, and BreadcrumbList in one <script>.

import type { Listing } from "@/types/listing";

interface Props {
  listing: Listing;
}

export function ListingJsonLd({ listing }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://locallistings.com.au";
  const url = `${siteUrl}${listing.permalinks.listing}`;

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": listing.category.schemaType,
    "@id": url,
    name: listing.name,
    url,
    telephone: listing.phone ?? undefined,
    image: listing.images.map((i) => i.url),
    description: listing.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address.street,
      addressLocality: listing.address.suburb,
      addressRegion: listing.address.state,
      postalCode: listing.address.postcode,
      addressCountry: "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: listing.geo.lat,
      longitude: listing.geo.lng,
    },
    aggregateRating:
      listing.rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: listing.rating.aggregate.toFixed(1),
            reviewCount: listing.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: listing.reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.publishedAt,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.text,
    })),
    openingHoursSpecification: listing.openingHours
      ?.filter((h) => !h.closed && h.opens && h.closes)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${h.day}`,
        opens: h.opens,
        closes: h.closes,
      })),
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: listing.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: listing.address.state,
        item: `${siteUrl}/locations/${listing.address.stateSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: listing.address.suburb,
        item: `${siteUrl}/locations/${listing.address.stateSlug}/${listing.address.suburbSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: listing.category.label,
        item: `${siteUrl}${listing.permalinks.category}`,
      },
      { "@type": "ListItem", position: 5, name: listing.name, item: url },
    ],
  };

  const payload = [localBusiness, faqPage, breadcrumb];

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- structured data is trusted, produced by our code
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
