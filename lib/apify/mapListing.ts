// lib/apify/mapListing.ts
// Pure function: raw Apify google-maps-scraper item -> normalized Listing.
// No I/O here. Image download/upload and AI enrichment happen in separate steps
// (lib/images/downloadAndRename.ts, lib/enrichment/*) and are merged in via scripts/ingest.ts.

import type {
  Listing,
  ListingCategory,
  AustralianState,
  AustralianStateSlug,
  OpeningHoursDay,
  Review,
} from "@/types/listing";
import { slugify } from "@/lib/images/slug";
import { buildAltText } from "@/lib/images/altText";
import { buildListingTitle } from "@/lib/seo/titles";
import { buildListingMetaDescription } from "@/lib/seo/descriptions";

/** Subset of the raw Apify google-maps-scraper payload we consume. */
export interface ApifyRawPlace {
  placeId: string;
  title: string;
  categoryName?: string;
  categories?: string[];
  description?: string;
  phone?: string | null;
  phoneUnformatted?: string | null;
  website?: string | null;
  address?: string;
  street?: string;
  city?: string; // suburb in AU terms
  state?: string; // "Victoria" | "VIC" | ...
  postalCode?: string;
  countryCode?: string;
  location?: { lat: number; lng: number };
  totalScore?: number; // aggregate rating
  reviewsCount?: number;
  imageUrls?: string[];
  openingHours?: Array<{ day: string; hours: string }>;
  reviews?: Array<{
    reviewId?: string;
    name: string;
    stars: number;
    text?: string | null;
    publishedAtDate: string;
    responseFromOwnerText?: string | null;
    responseFromOwnerDate?: string | null;
  }>;
}

const STATE_MAP: Record<string, { code: AustralianState; slug: AustralianStateSlug }> = {
  victoria: { code: "VIC", slug: "vic" },
  vic: { code: "VIC", slug: "vic" },
  "new south wales": { code: "NSW", slug: "nsw" },
  nsw: { code: "NSW", slug: "nsw" },
  queensland: { code: "QLD", slug: "qld" },
  qld: { code: "QLD", slug: "qld" },
  "western australia": { code: "WA", slug: "wa" },
  wa: { code: "WA", slug: "wa" },
  "south australia": { code: "SA", slug: "sa" },
  sa: { code: "SA", slug: "sa" },
  tasmania: { code: "TAS", slug: "tas" },
  tas: { code: "TAS", slug: "tas" },
  "australian capital territory": { code: "ACT", slug: "act" },
  act: { code: "ACT", slug: "act" },
  "northern territory": { code: "NT", slug: "nt" },
  nt: { code: "NT", slug: "nt" },
};

/** Map an Apify category string to schema.org LocalBusiness sub-type. */
function inferSchemaType(category: string): ListingCategory["schemaType"] {
  const c = category.toLowerCase();
  if (c.includes("plumb")) return "Plumber";
  if (c.includes("electric")) return "Electrician";
  if (c.includes("hvac") || c.includes("air condition") || c.includes("heating")) return "HVACBusiness";
  if (c.includes("locksmith")) return "Locksmith";
  if (c.includes("roof")) return "RoofingContractor";
  if (c.includes("builder") || c.includes("contractor")) return "GeneralContractor";
  if (c.includes("mechanic") || c.includes("auto")) return "AutoRepair";
  if (c.includes("dentist")) return "Dentist";
  if (c.includes("doctor") || c.includes("medical") || c.includes("clinic")) return "MedicalBusiness";
  if (c.includes("restaurant") || c.includes("cafe")) return "Restaurant";
  if (c.includes("beauty")) return "BeautySalon";
  if (c.includes("hair") || c.includes("barber")) return "HairSalon";
  if (c.includes("child") || c.includes("daycare")) return "ChildCare";
  return "LocalBusiness";
}

function parseState(rawState: string | undefined) {
  if (!rawState) return null;
  return STATE_MAP[rawState.trim().toLowerCase()] ?? null;
}

function parseHours(raw: ApifyRawPlace["openingHours"]): OpeningHoursDay[] {
  if (!raw) return [];
  return raw
    .map<OpeningHoursDay | null>((h) => {
      const day = h.day as OpeningHoursDay["day"];
      if (!day) return null;
      if (!h.hours || /closed/i.test(h.hours)) {
        return { day, opens: null, closes: null, closed: true };
      }
      // "9:00 AM–5:00 PM" or "9 AM to 5 PM" — basic parse, swap for a more robust util in prod
      const match = h.hours.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?.*?(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!match) return { day, opens: null, closes: null };
      const to24 = (h: string, m: string | undefined, ampm: string | undefined) => {
        let hh = parseInt(h, 10);
        if (ampm?.toUpperCase() === "PM" && hh < 12) hh += 12;
        if (ampm?.toUpperCase() === "AM" && hh === 12) hh = 0;
        return `${String(hh).padStart(2, "0")}:${m ?? "00"}`;
      };
      return {
        day,
        opens: to24(match[1], match[2], match[3]),
        closes: to24(match[4], match[5], match[6]),
        closed: false,
      };
    })
    .filter((h): h is OpeningHoursDay => h !== null);
}

function mapReviews(raw: ApifyRawPlace["reviews"]): Review[] {
  if (!raw) return [];
  return raw
    .filter((r) => r.text && r.text.trim().length > 0)
    .map((r, i) => ({
      id: r.reviewId ?? `r_${i}`,
      author: r.name,
      rating: Math.min(5, Math.max(1, Math.round(r.stars))) as Review["rating"],
      text: r.text!.trim(),
      publishedAt: r.publishedAtDate,
      ownerResponse:
        r.responseFromOwnerText && r.responseFromOwnerDate
          ? { text: r.responseFromOwnerText, publishedAt: r.responseFromOwnerDate }
          : null,
    }));
}

export interface MapListingDeps {
  /** Pre-computed by lib/enrichment/peopleOftenSay.ts */
  peopleOftenSay: Listing["peopleOftenSay"];
  /** Pre-computed by lib/enrichment/generateFAQs.ts (must return exactly 3). */
  faqs: Listing["faqs"];
  /** Image records produced by lib/images/downloadAndRename.ts after CDN upload. */
  images: Listing["images"];
  /** UUID, generated in the ingest script. */
  id: string;
  now: string; // ISO timestamp, injected for deterministic tests
  actorRunId: string | null;
}

export function mapApifyToListing(raw: ApifyRawPlace, deps: MapListingDeps): Listing {
  const stateInfo = parseState(raw.state);
  if (!stateInfo) throw new Error(`Unknown state for placeId=${raw.placeId}: ${raw.state}`);
  if (!raw.city) throw new Error(`Missing suburb (city) for placeId=${raw.placeId}`);
  if (!raw.location) throw new Error(`Missing geo for placeId=${raw.placeId}`);

  const suburbSlug = slugify(raw.city);
  const categoryLabel = raw.categoryName ?? raw.categories?.[0] ?? "Local Business";
  const category: ListingCategory = {
    slug: slugify(categoryLabel),
    label: categoryLabel,
    schemaType: inferSchemaType(categoryLabel),
  };
  const businessSlug = slugify(raw.title);

  const permalinkListing = `/${stateInfo.slug}/${suburbSlug}/${businessSlug}`;
  const permalinkCategory = `/locations/${stateInfo.slug}/${suburbSlug}/${category.slug}`;

  // Re-stamp image alt text using the canonical convention. The filename was already
  // set during the download step, but we re-apply alt to keep one source of truth.
  const images = deps.images.map((img, i) => ({
    ...img,
    alt: buildAltText({
      businessName: raw.title,
      category: category.label,
      suburb: raw.city!,
      state: stateInfo.code,
    }),
    isPrimary: img.isPrimary ?? i === 0,
  }));

  return {
    id: deps.id,
    slug: businessSlug,
    name: raw.title,
    category,
    subCategories: raw.categories?.filter((c) => c !== category.label) ?? [],
    description: raw.description,
    phone: raw.phoneUnformatted ?? raw.phone ?? null,
    website: raw.website ?? null,
    address: {
      street: raw.street ?? raw.address ?? "",
      suburb: raw.city,
      suburbSlug,
      state: stateInfo.code,
      stateSlug: stateInfo.slug,
      postcode: raw.postalCode ?? "",
      country: "AU",
    },
    geo: { lat: raw.location.lat, lng: raw.location.lng },
    openingHours: parseHours(raw.openingHours),
    rating: {
      aggregate: raw.totalScore ?? 0,
      count: raw.reviewsCount ?? raw.reviews?.length ?? 0,
    },
    reviews: mapReviews(raw.reviews),
    peopleOftenSay: deps.peopleOftenSay,
    faqs: deps.faqs,
    images,
    claim: { status: "unclaimed", verifiedAt: null, ownerUserId: null },
    source: {
      provider: "apify:google-maps-scraper",
      placeId: raw.placeId,
      scrapedAt: deps.now,
      actorRunId: deps.actorRunId,
    },
    permalinks: { listing: permalinkListing, category: permalinkCategory },
    seo: {
      title: buildListingTitle({ name: raw.title, category: category.label, suburb: raw.city, state: stateInfo.code }),
      metaDescription: buildListingMetaDescription({
        name: raw.title,
        category: category.label,
        suburb: raw.city,
        rating: raw.totalScore,
        reviewsCount: raw.reviewsCount,
      }),
      canonical: `https://locallistings.com.au${permalinkListing}`,
    },
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}
