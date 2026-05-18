// components/directory/CategoryHeader.tsx
// Above-the-fold header on category hubs — H1 + intro copy keyed to (category, suburb, state).

interface Props {
  category: string;
  suburb: string;
  state: string;
  totalResults: number;
}

export function CategoryHeader({ category, suburb, state, totalResults }: Props) {
  return (
    <header className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">
        {suburb}, {state}
      </p>
      <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Best {category} in {suburb}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Compare {totalResults.toLocaleString()} top-rated {category.toLowerCase()} in {suburb}. Read verified Google
        reviews, see opening hours and photos, and request a free quote in a couple of clicks.
      </p>
    </header>
  );
}
