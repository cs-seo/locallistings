// lib/apify/client.ts
// Thin wrapper around the official Apify SDK. Reads APIFY_API_TOKEN from env.

import { ApifyClient } from "apify-client";

let _client: ApifyClient | null = null;

export function getApifyClient(): ApifyClient {
  if (_client) return _client;
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error(
      "APIFY_API_TOKEN is not set. Add it to Netlify env / .env.local. Never commit the token.",
    );
  }
  _client = new ApifyClient({ token });
  return _client;
}
