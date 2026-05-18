// lib/seo/descriptions.ts

/**
 * Single-listing meta description.
 */
export function buildListingMetaDescription(args: {
  name: string;
  category: string;
  suburb: string;
  rating?: number;
  reviewsCount?: number;
}): string {
  const ratingFragment =
    args.rating && args.reviewsCount
      ? ` Rated ${args.rating.toFixed(1)}/5 by ${args.reviewsCount} customers.`
      : "";
  const base = `${args.name} is a ${args.category.toLowerCase()} based in ${args.suburb}.${ratingFragment} Read reviews, see contact details, and request a free quote.`;
  return base.length <= 165 ? base : base.slice(0, 162) + "…";
}

/**
 * Category hub meta description per spec.
 */
export function buildCategoryMetaDescription(args: {
  category: string;
  suburb: string;
  topBusinesses: string[];
}): string {
  const sample = args.topBusinesses.slice(0, 3).join(", ");
  const base = `Looking for top-rated ${args.category} in ${args.suburb}? Check out ${sample}, and more. Read real customer reviews and get a quote today.`;
  return base.length <= 165 ? base : base.slice(0, 162) + "…";
}
