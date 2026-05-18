// app/not-found.tsx — global 404.
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        The listing or category page you were looking for may have moved or doesn&apos;t exist.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
