// app/api/leads/route.ts
// POST /api/leads — contact form on every listing page.
//
// On Netlify this deploys as a Function automatically (Next.js adapter).
// Returns:
//   201 { ok: true } on success
//   400 { error } on validation failure
//   429 { error } if rate-limited

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { getServiceRoleSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const LeadSchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional().nullable(),
  message: z.string().min(5).max(2000),
});

// In-memory leaky bucket — fine for one Function instance, swap for Upstash Redis at scale.
const buckets = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1h

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

function hashIp(ip: string | null): string {
  const salt = process.env.IP_HASH_SALT ?? "default-dev-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip ?? "unknown"}`).digest("hex");
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
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
  const { error } = await supabase.from("leads").insert({
    listing_id: parsed.data.listingId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message: parsed.data.message,
    ip_hash: ipHash,
    user_agent: req.headers.get("user-agent") ?? null,
  });
  if (error) {
    console.error("[leads] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
  }

  // Hook for downstream notification (email, Slack, CRM) — best-effort, don't block the response.
  void notifyLead({
    listingId: parsed.data.listingId,
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

async function notifyLead(payload: { listingId: string; name: string; email: string; message: string }) {
  const webhook = process.env.LEAD_NOTIFICATION_WEBHOOK;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[leads] notification webhook failed:", (err as Error).message);
  }
}
