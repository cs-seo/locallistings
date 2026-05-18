// components/directory/ResultsList.tsx
import type { Listing } from "@/types/listing";
import { ListingCard } from "./ListingCard";

interface Props {
  listings: Listing[];
}

export function ResultsList({ listings }: Props) {
  if (listings.length === 0) {
    return <p className="text-sm text-muted-foreground">No results found.</p>;
  }

  return (
    <ol className="space-y-3" aria-label="Search results">
      {listings.map((l, i) => (
        <li key={l.id}>
          <ListingCard listing={l} position={i + 1} />
        </li>
      ))}
    </ol>
  );
}
