// components/listing/ListingAbout.tsx
import type { Listing } from "@/types/listing";

interface Props {
  listing: Listing;
}

export function ListingAbout({ listing }: Props) {
  return (
    <section aria-labelledby="about-heading">
      <h2 id="about-heading" className="text-2xl font-semibold text-foreground">
        About {listing.name}
      </h2>

      {listing.description ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{listing.description}</p>
      ) : (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {listing.name} is a {listing.category.label.toLowerCase()} servicing {listing.address.suburb},{" "}
          {listing.address.state}. View their contact details, photos and verified Google reviews below, or
          request a free quote using the form on this page.
        </p>
      )}

      <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="font-medium text-foreground">Address</dt>
          <dd className="text-muted-foreground">
            {listing.address.street}
            <br />
            {listing.address.suburb} {listing.address.state} {listing.address.postcode}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Services</dt>
          <dd className="text-muted-foreground">
            {[listing.category.label, ...(listing.subCategories ?? [])].slice(0, 6).join(" · ")}
          </dd>
        </div>
      </dl>
    </section>
  );
}
