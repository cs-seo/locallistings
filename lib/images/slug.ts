// lib/images/slug.ts
// Single source of truth for slug normalization. Used for URLs, filenames, and DB keys.

/**
 * Convert a free-form string to a URL/filename-safe slug.
 *
 *   "Fixed & Fast Plumbing"  -> "fixed-fast-plumbing"
 *   "St Kilda East"          -> "st-kilda-east"
 *   "O'Brien's Café"         -> "obriens-cafe"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // strip combining diacritics (U+0300..U+036F) after NFKD decomposition
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // drop straight + curly apostrophes entirely, so "O'Brien" -> "obrien"
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphens
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .replace(/-{2,}/g, "-"); // collapse runs of hyphens
}

/**
 * Build a deterministic image filename per the SEO convention:
 *   [business-slug]-[suburb-slug]-[category-slug]-NN.<ext>
 *
 * `index` is 0-based; we pad to 2 digits.
 */
export function buildImageFilename(args: {
  businessSlug: string;
  suburbSlug: string;
  categorySlug: string;
  index: number;
  extension: "jpg" | "jpeg" | "webp" | "png";
}): string {
  const idx = String(args.index + 1).padStart(2, "0");
  return `${args.businessSlug}-${args.suburbSlug}-${args.categorySlug}-${idx}.${args.extension}`;
}
