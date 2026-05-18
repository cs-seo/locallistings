// components/listing/MapEmbed.tsx
// Lazy Google Maps embed — uses the no-key embed URL so we don't pay until volume warrants it.
// At scale, swap for Mapbox / MapLibre static tiles, also lazy-loaded.

import type { GeoCoordinates, ListingAddress } from "@/types/listing";

interface Props {
  geo: GeoCoordinates;
  name: string;
  address: ListingAddress;
}

export function MapEmbed({ geo, name, address }: Props) {
  const q = encodeURIComponent(
    `${name}, ${address.street}, ${address.suburb} ${address.state} ${address.postcode}`,
  );
  // No-key embed. Google supports loading this without an API key in <iframe>.
  const src = `https://www.google.com/maps?q=${q}&ll=${geo.lat},${geo.lng}&z=15&output=embed`;

  return (
    <section className="rounded-2xl border bg-card overflow-hidden shadow-sm" aria-label={`Map showing ${name}`}>
      <iframe
        src={src}
        title={`Map showing ${name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-64 w-full"
        allow="geolocation"
      />
      <div className="p-4 text-sm">
        <div className="font-medium text-foreground">{name}</div>
        <address className="not-italic text-muted-foreground">
          {address.street}, {address.suburb} {address.state} {address.postcode}
        </address>
      </div>
    </section>
  );
}
