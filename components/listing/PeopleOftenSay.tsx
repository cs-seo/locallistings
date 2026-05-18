// components/listing/PeopleOftenSay.tsx
// Renders the AI-extracted review themes as scannable tags above the review feed.

import type { PeopleOftenSayTag } from "@/types/listing";
import { ThumbsUp } from "lucide-react";

interface Props {
  tags: PeopleOftenSayTag[];
}

const sentimentStyles: Record<PeopleOftenSayTag["sentiment"], string> = {
  positive: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  neutral: "bg-slate-50 text-slate-800 ring-slate-200",
  negative: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function PeopleOftenSay({ tags }: Props) {
  return (
    <section aria-labelledby="people-often-say-heading">
      <div className="flex items-center gap-2">
        <ThumbsUp className="h-5 w-5 text-foreground" aria-hidden />
        <h2 id="people-often-say-heading" className="text-xl font-semibold text-foreground">
          People often say
        </h2>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag.theme}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ring-1 ${sentimentStyles[tag.sentiment]}`}
              title={tag.exampleQuote ?? undefined}
            >
              <span className="font-medium">{tag.theme}</span>
              <span className="opacity-70">· {tag.mentions}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
