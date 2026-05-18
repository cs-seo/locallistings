// lib/enrichment/generateFAQs.ts
// Generates exactly 3 programmatic FAQs per listing using Claude Haiku.
// Falls back to a deterministic template if the API is unavailable, so the pipeline
// never blocks on LLM failures.

import Anthropic from "@anthropic-ai/sdk";
import type { Listing, ListingFAQ } from "@/types/listing";
import { FAQ_SYSTEM_PROMPT, buildFAQUserPrompt } from "./prompts";

const MODEL = process.env.ANTHROPIC_FAQ_MODEL ?? "claude-haiku-4-5-20251001";

interface FAQArgs {
  name: string;
  category: string;
  suburb: string;
  state: string;
  rating: number;
  reviewsCount: number;
  description?: string;
}

export async function generateFAQs(args: FAQArgs): Promise<Listing["faqs"]> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: FAQ_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildFAQUserPrompt(args) }],
    });
    const text = resp.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start < 0 || end <= start) throw new Error("No JSON array in model output");
    const parsed = JSON.parse(text.slice(start, end + 1)) as ListingFAQ[];
    const cleaned = parsed
      .filter((f) => f && typeof f.question === "string" && typeof f.answer === "string")
      .slice(0, 3);
    if (cleaned.length !== 3) throw new Error("Model did not return 3 FAQs");
    return cleaned as Listing["faqs"];
  } catch (err) {
    console.warn("[faq] LLM failed, falling back to template:", (err as Error).message);
    return templateFAQs(args);
  }
}

function templateFAQs(args: FAQArgs): Listing["faqs"] {
  const cat = args.category;
  const catLower = cat.toLowerCase();
  return [
    {
      question: `Does ${args.name} offer emergency services in ${args.suburb}?`,
      answer: `${args.name} services the ${args.suburb} area. For after-hours or emergency availability, we recommend calling them directly to confirm.`,
    },
    {
      question: `What is the average rating for ${args.name} in ${args.suburb}?`,
      answer:
        args.reviewsCount > 0
          ? `${args.name} has an average rating of ${args.rating.toFixed(1)} out of 5 across ${args.reviewsCount} customer reviews.`
          : `${args.name} does not yet have customer reviews on Google. Be among the first to leave one after your visit.`,
    },
    {
      question: `How do I request a quote from ${args.name}?`,
      answer: `You can request a free quote from this ${catLower} using the contact form on this page, or by calling the number listed. Most local ${catLower}s respond within a few hours.`,
    },
  ];
}
