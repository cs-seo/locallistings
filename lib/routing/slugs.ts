// lib/routing/slugs.ts
import type { AustralianState, AustralianStateSlug } from "@/types/listing";

export const STATE_SLUGS: readonly AustralianStateSlug[] = [
  "vic",
  "nsw",
  "qld",
  "wa",
  "sa",
  "tas",
  "act",
  "nt",
] as const;

const STATE_SLUG_TO_CODE: Record<AustralianStateSlug, AustralianState> = {
  vic: "VIC",
  nsw: "NSW",
  qld: "QLD",
  wa: "WA",
  sa: "SA",
  tas: "TAS",
  act: "ACT",
  nt: "NT",
};

export function isStateSlug(value: string): value is AustralianStateSlug {
  return (STATE_SLUGS as readonly string[]).includes(value);
}

export function stateSlugToCode(slug: AustralianStateSlug): AustralianState {
  return STATE_SLUG_TO_CODE[slug];
}
