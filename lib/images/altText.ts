// lib/images/altText.ts
import type { AustralianState } from "@/types/listing";

/**
 * Auto-generated image alt text per spec:
 *   "[Business Name] - [Service Category] in [Suburb, State]"
 */
export function buildAltText(args: {
  businessName: string;
  category: string;
  suburb: string;
  state: AustralianState;
}): string {
  return `${args.businessName} - ${args.category} in ${args.suburb}, ${args.state}`;
}
