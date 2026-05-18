// components/listing/ListingFAQs.tsx
// Renders the 3 programmatic FAQs. JSON-LD for FAQPage is emitted by ListingJsonLd,
// which keeps schema concerns in one place.

import type { ListingFAQ } from "@/types/listing";

interface Props {
  faqs: readonly ListingFAQ[];
}

export function ListingFAQs({ faqs }: Props) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-semibold text-foreground">
        Frequently asked questions
      </h2>
      <div className="mt-4 divide-y rounded-2xl border bg-card">
        {faqs.map((faq) => (
          <details key={faq.question} className="group p-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
              <span>{faq.question}</span>
              <span
                aria-hidden
                className="mt-1 inline-block h-5 w-5 shrink-0 rounded-full border text-center text-sm leading-[18px] group-open:rotate-45 transition-transform"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
