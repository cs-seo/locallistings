// lib/enrichment/peopleOftenSay.ts
// Extracts 3-5 recurring themes from reviews using Anthropic Claude Haiku.
// Falls back to a deterministic keyword-frequency heuristic if the API is unavailable.

import Anthropic from "@anthropic-ai/sdk";
import type { PeopleOftenSayTag, Review } from "@/types/listing";
import { PEOPLE_OFTEN_SAY_SYSTEM_PROMPT, buildPeopleOftenSayUserPrompt } from "./prompts";

const MODEL = process.env.ANTHROPIC_THEME_MODEL ?? "claude-haiku-4-5-20251001";

export async function extractPeopleOftenSay(reviews: Review[]): Promise<PeopleOftenSayTag[]> {
  if (reviews.length < 3) return [];

  // Cap input — first 50 reviews are plenty for theme extraction and keep cost predictable.
  const sample = reviews.slice(0, 50).map((r) => ({ rating: r.rating, text: r.text }));

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: PEOPLE_OFTEN_SAY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPeopleOftenSayUserPrompt(sample) }],
    });
    const text = resp.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    const parsed = JSON.parse(extractJsonArray(text));
    return validateTags(parsed);
  } catch (err) {
    console.warn("[peopleOftenSay] LLM failed, falling back to heuristic:", (err as Error).message);
    return heuristicThemes(reviews);
  }
}

function extractJsonArray(s: string): string {
  // Strip code fences or leading prose if the model added any.
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  return start >= 0 && end > start ? s.slice(start, end + 1) : s;
}

function validateTags(parsed: unknown): PeopleOftenSayTag[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (t): t is PeopleOftenSayTag =>
        typeof t === "object" &&
        t !== null &&
        typeof (t as PeopleOftenSayTag).theme === "string" &&
        typeof (t as PeopleOftenSayTag).mentions === "number" &&
        ["positive", "neutral", "negative"].includes((t as PeopleOftenSayTag).sentiment),
    )
    .slice(0, 5);
}

/** Fallback when no API key is configured or the call fails. */
function heuristicThemes(reviews: Review[]): PeopleOftenSayTag[] {
  const keywords: Record<string, { mentions: number; sentiment: "positive" | "neutral" | "negative"; quote?: string }> = {
    "Fast Response Time": { mentions: 0, sentiment: "positive" },
    "Fair Pricing": { mentions: 0, sentiment: "positive" },
    "Professional Service": { mentions: 0, sentiment: "positive" },
    "Clean Workmanship": { mentions: 0, sentiment: "positive" },
    "Friendly Staff": { mentions: 0, sentiment: "positive" },
    "On Time": { mentions: 0, sentiment: "positive" },
  };
  const matchers: Array<[keyof typeof keywords, RegExp]> = [
    ["Fast Response Time", /\b(quick|fast|prompt|responsive|same.?day)\b/i],
    ["Fair Pricing", /\b(fair|reasonable|good\s+price|affordable|honest\s+price)\b/i],
    ["Professional Service", /\b(professional|knowledgeable|expert)\b/i],
    ["Clean Workmanship", /\b(clean(ed)?\s+up|tidy|neat)\b/i],
    ["Friendly Staff", /\b(friendly|polite|kind|helpful)\b/i],
    ["On Time", /\b(on time|punctual|turned up when)\b/i],
  ];
  for (const r of reviews) {
    for (const [theme, re] of matchers) {
      if (re.test(r.text)) {
        keywords[theme].mentions++;
        if (!keywords[theme].quote) keywords[theme].quote = r.text.slice(0, 120);
      }
    }
  }
  return Object.entries(keywords)
    .filter(([, v]) => v.mentions >= 2)
    .sort((a, b) => b[1].mentions - a[1].mentions)
    .slice(0, 5)
    .map(([theme, v]) => ({
      theme,
      mentions: v.mentions,
      sentiment: v.sentiment,
      exampleQuote: v.quote ?? null,
    }));
}
