// app/layout.tsx — root layout. Header/footer + analytics + global styles.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://locallistings.com.au"),
  title: { default: "LocalListings — find trusted Australian businesses", template: "%s | LocalListings" },
  description:
    "Find and compare top-rated local businesses across Australia. Read real customer reviews and request a free quote in seconds.",
  openGraph: { siteName: "LocalListings", locale: "en_AU", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>
        <header className="border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <a href="/" className="font-bold text-lg tracking-tight">
              LocalListings
            </a>
          </div>
        </header>
        {children}
        <footer className="border-t mt-16 py-8 text-sm text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} LocalListings. All listings are sourced from public business profiles.
          </div>
        </footer>
      </body>
    </html>
  );
}
