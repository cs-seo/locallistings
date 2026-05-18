// lib/images/downloadAndRename.ts
// Pulls GMB image URLs from the Apify payload, renames per the SEO convention,
// uploads to Supabase Storage, and returns ListingImage records ready to be embedded
// in the Listing row.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { ListingImage, AustralianState } from "@/types/listing";
import { buildImageFilename } from "./slug";
import { buildAltText } from "./altText";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "listing-images";
const PUBLIC_CDN_BASE =
  process.env.NEXT_PUBLIC_IMAGE_CDN_BASE ?? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface DownloadArgs {
  sourceUrls: string[];
  businessName: string;
  businessSlug: string;
  suburb: string;
  suburbSlug: string;
  state: AustralianState;
  category: string;
  categorySlug: string;
  /** Cap to avoid runaway downloads — GMB sometimes returns 100+ photos. */
  maxImages?: number;
}

/**
 * Download → resize (max 1600w) → re-encode webp → upload to Supabase Storage.
 * Returns the ListingImage records to merge into the Listing.
 */
export async function downloadAndRenameImages(args: DownloadArgs): Promise<ListingImage[]> {
  const max = args.maxImages ?? 12;
  const urls = args.sourceUrls.slice(0, max);

  const out: ListingImage[] = [];

  for (let i = 0; i < urls.length; i++) {
    const sourceUrl = urls[i];
    try {
      const res = await fetch(sourceUrl);
      if (!res.ok) continue;
      const inputBuffer = Buffer.from(await res.arrayBuffer());

      // Re-encode to webp, capped width 1600 (most GMB images are >2000px).
      const pipeline = sharp(inputBuffer).rotate().resize({ width: 1600, withoutEnlargement: true });
      const { data: webpBuffer, info } = await pipeline
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });

      const filename = buildImageFilename({
        businessSlug: args.businessSlug,
        suburbSlug: args.suburbSlug,
        categorySlug: args.categorySlug,
        index: i,
        extension: "webp",
      });
      const objectPath = `${args.state.toLowerCase()}/${args.suburbSlug}/${args.businessSlug}/${filename}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, webpBuffer, {
          contentType: "image/webp",
          cacheControl: "public, max-age=31536000, immutable",
          upsert: true,
        });

      if (error) {
        console.warn(`[images] upload failed for ${objectPath}:`, error.message);
        continue;
      }

      out.push({
        url: `${PUBLIC_CDN_BASE}/${objectPath}`,
        filename,
        alt: buildAltText({
          businessName: args.businessName,
          category: args.category,
          suburb: args.suburb,
          state: args.state,
        }),
        width: info.width,
        height: info.height,
        isPrimary: i === 0,
        sourceUrl,
      });
    } catch (err) {
      console.warn(`[images] failed to process ${sourceUrl}:`, (err as Error).message);
    }
  }

  return out;
}
