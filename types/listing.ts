// types/listing.ts
// Canonical, app-wide Listing type. Mirrors /schemas/listing.schema.json.
// All components and queries import from this file.

export type AustralianState = "VIC" | "NSW" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
export type AustralianStateSlug = "vic" | "nsw" | "qld" | "wa" | "sa" | "tas" | "act" | "nt";

export type SchemaBusinessType =
  | "LocalBusiness"
  | "Plumber"
  | "Electrician"
  | "HVACBusiness"
  | "Locksmith"
  | "RoofingContractor"
  | "GeneralContractor"
  | "AutoRepair"
  | "Dentist"
  | "MedicalBusiness"
  | "Restaurant"
  | "BeautySalon"
  | "HairSalon"
  | "ChildCare"
  | "Store";

export interface ListingCategory {
  slug: string;
  label: string;
  schemaType: SchemaBusinessType;
}

export interface ListingAddress {
  street: string;
  suburb: string;
  suburbSlug: string;
  state: AustralianState;
  stateSlug: AustralianStateSlug;
  postcode: string;
  country: "AU";
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface OpeningHoursDay {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  opens: string | null; // "HH:mm"
  closes: string | null;
  closed?: boolean;
}

export interface Rating {
  aggregate: number; // 0-5
  count: number;
}

export interface Review {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  publishedAt: string; // ISO
  ownerResponse?: { text: string; publishedAt: string } | null;
}

export interface PeopleOftenSayTag {
  theme: string;
  mentions: number;
  sentiment: "positive" | "neutral" | "negative";
  exampleQuote?: string | null;
}

export interface ListingFAQ {
  question: string;
  answer: string;
}

export interface ListingImage {
  url: string;
  filename: string; // [business-slug]-[suburb-slug]-[category-slug]-NN.jpg
  alt: string;
  width: number;
  height: number;
  isPrimary?: boolean;
  sourceUrl?: string;
}

export interface ClaimStatus {
  status: "unclaimed" | "pending" | "verified";
  verifiedAt?: string | null;
  ownerUserId?: string | null;
}

export interface Listing {
  id: string;
  slug: string;
  name: string;
  category: ListingCategory;
  subCategories?: string[];
  description?: string;
  phone: string | null;
  website: string | null;
  address: ListingAddress;
  geo: GeoCoordinates;
  openingHours?: OpeningHoursDay[];
  rating: Rating;
  reviews: Review[];
  peopleOftenSay: PeopleOftenSayTag[]; // 0-5 items
  faqs: [ListingFAQ, ListingFAQ, ListingFAQ]; // exactly 3
  images: ListingImage[];
  claim?: ClaimStatus;
  source: {
    provider: "apify:google-maps-scraper";
    placeId: string | null;
    scrapedAt: string;
    actorRunId: string | null;
  };
  permalinks: {
    listing: string; // /vic/richmond/fixed-fast-plumbing
    category: string; // /locations/vic/richmond/plumbers
  };
  seo: {
    title: string;
    metaDescription: string;
    canonical?: string;
  };
  createdAt: string;
  updatedAt: string;
}
