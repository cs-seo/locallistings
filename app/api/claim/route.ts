// app/api/claim/route.ts
// POST /api/claim — "Claim this Listing" submissions.
// Lighter rate limit than leads since claim attempts are rarer; still gate by IP hash.

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { getServiceRoleSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ClaimSchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional().nullable(),
  role: z.string().max(60).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const buckets = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function hashIp(ip: string | null): string {
  const salt = process.env.IP_HASH_SALT ?? "default-dev-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip ?? "unknown"}`).digest("hex");
}

function rateLimit(ipHash: string): boolean {
  const now = Date.now();
  const b = buckets.get(ipHash);
  if (!b || b.resetAt < now) {
    buckets.set(ipHash, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count >= LIMIT) return false;
  b.count++;
  return true;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = ClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;
  const ipHash = hashIp(ip);
  if (!rateLimit(ipHash)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = getServiceRoleSupabase();
  const { error } = await supabase.from("claims").insert({
    listing_id: parsed.data.listingId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    role: parsed.data.role ?? null,
    notes: parsed.data.notes ?? null,
    status: "pending",
  });
  if (error) {
    console.error("[claim] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save claim" }, { status: 500 });
  }

  void notifyClaim({
    listingId: parsed.data.listingId,
    name: parsed.data.name,
    email: parsed.data.email,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

async function notifyClaim(payload: { listingId: string; name: string; email: string }) {
  const webhook = process.env.CLAIM_NOTIFICATION_WEBHOOK;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[claim] notification webhook failed:", (err as Error).message);
  }
}
