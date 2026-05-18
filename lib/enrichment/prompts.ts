// lib/enrichment/prompts.ts
// All LLM prompts in one place — easy to A/B and audit.

export const PEOPLE_OFTEN_SAY_SYSTEM_PROMPT = `You analyse customer reviews and extract the top recurring themes.

Rules:
- Return 3 to 5 themes.
- Each theme is a short noun phrase (2-4 words), title case. e.g. "Fast Response Time", "Fair Pricing", "Cleaned Up After".
- Skip themes mentioned in fewer than 2 reviews.
- Assign sentiment: "positive", "neutral", or "negative".
- Output strict JSON: an array of {theme, mentions, sentiment, exampleQuote}.
- exampleQuote: a short (<=120 char) verbatim snippet from one review supporting the theme.
- Do not include any other text.`;

export function buildPeopleOftenSayUserPrompt(reviews: Array<{ rating: number; text: string }>) {
  const numbered = reviews
    .map((r, i) => `${i + 1}. (${r.rating}★) ${r.text.replace(/\s+/g, " ").trim()}`)
    .join("\n");
  return `Reviews:\n${numbered}\n\nReturn the JSON array now.`;
}

export const FAQ_SYSTEM_PROMPT = `You generate exactly 3 frequently-asked questions for a local business listing page.

Rules:
- Return strict JSON: an array of exactly 3 {question, answer} objects.
- The first FAQ must ask about emergency/after-hours availability if relevant to the category; otherwise about service-area coverage.
- The second FAQ must reference the aggregate rating, e.g. "What is the average rating for [Business] in [Suburb]?".
- The third FAQ must be category-specific (pricing, qualifications, common services).
- Answers must be 1-3 sentences, factual, derived only from the provided data.
- Never invent phone numbers, prices, or specific years.
- Do not include any text outside the JSON.`;

export function buildFAQUserPrompt(args: {
  name: string;
  category: string;
  suburb: string;
  state: string;
  rating: number;
  reviewsCount: number;
  description?: string;
}) {
  return `Business: ${args.name}
Category: ${args.category}
Location: ${args.suburb}, ${args.state}
Aggregate rating: ${args.rating.toFixed(1)} from ${args.reviewsCount} reviews
${args.description ? `Description: ${args.description}` : ""}

Return the JSON array of 3 FAQs now.`;
}
