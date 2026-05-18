// app/locations/[state]/[suburb]/[category]/page.tsx
// Category hub — the "Plumbers in Richmond" money page.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import {
  getListingsByCategorySuburb,
  getCategorySuburbMeta,
  getNearbySuburbs,
} from "@/lib/supabase/queries";
import { isStateSlug, stateSlugToCode } from "@/lib/routing/slugs";
import { buildCategoryTitle } from "@/lib/seo/titles";
import { buildCategoryMetaDescription } from "@/lib/seo/descriptions";
import { CategoryHeader } from "@/components/directory/CategoryHeader";
import { ResultsList } from "@/components/directory/ResultsList";
import { SuburbNav } from "@/components/directory/SuburbNav";

export const revalidate = 86_400;
export const dynamicParams = true;

interface PageProps {
  params: { state: string; suburb: string; category: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isStateSlug(params.state)) return {};
  const meta = await getCategorySuburbMeta(params);
  if (!meta) return {};
  const { listings } = await getListingsByCategorySuburb({ ...params, limit: 3 });
  return {
    title: buildCategoryTitle({
      category: meta.category,
      suburb: meta.suburb,
      state: stateSlugToCode(params.state),
    }),
    description: buildCategoryMetaDescription({
      category: meta.category,
      suburb: meta.suburb,
      topBusinesses: listings.map((l) => l.name),
    }),
    alternates: {
      canonical: `https://locallistings.com.au/locations/${params.state}/${params.suburb}/${params.category}`,
    },
  };
}

export default async function CategoryHubPage({ params }: PageProps) {
  if (!isStateSlug(params.state)) notFound();

  const [meta, results, nearby] = await Promise.all([
    getCategorySuburbMeta(params),
    getListingsByCategorySuburb({ ...params, limit: 50 }),
    getNearbySuburbs(params),
  ]);

  if (!meta || results.total === 0) notFound();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: results.listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://locallistings.com.au${l.permalinks.listing}`,
      name: l.name,
    })),
  };

  return (
    <>
      <Script
        id="category-itemlist-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <CategoryHeader
          category={meta.category}
          suburb={meta.suburb}
          state={meta.state}
          totalResults={results.total}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-9">
            <ResultsList listings={results.listings} />
          </main>
          <aside className="lg:col-span-3">
            <SuburbNav
              category={meta.category}
              currentSuburb={meta.suburb}
              stateSlug={params.state}
              categorySlug={params.category}
              nearby={nearby}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
