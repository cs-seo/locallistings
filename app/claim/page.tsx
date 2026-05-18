// app/claim/page.tsx
// /claim?id=[listing-id] — SSR-friendly claim page used by the no-JS fallback link.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServiceRoleSupabase } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import { ClaimPageForm } from "./ClaimPageForm";

export const metadata: Metadata = {
  title: "Claim your business listing | LocalListings",
  robots: { index: false, follow: true },
};

interface PageProps {
  searchParams: { id?: string };
}

export default async function ClaimPage({ searchParams }: PageProps) {
  if (!searchParams.id) notFound();

  const supabase = getServiceRoleSupabase();
  const { data } = await supabase.from("listings").select("data").eq("id", searchParams.id).maybeSingle();
  const listing = (data?.data as Listing | undefined) ?? null;
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Claim {listing.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Free to claim. We&apos;ll verify ownership before granting access to update the listing for{" "}
        <strong>
          {listing.address.suburb}, {listing.address.state}
        </strong>
        .
      </p>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <ClaimPageForm listingId={listing.id} businessName={listing.name} />
      </div>

      <noscript>
        <p className="mt-4 text-sm text-muted-foreground">JavaScript is disabled — use the form above.</p>
      </noscript>
    </div>
  );
}
