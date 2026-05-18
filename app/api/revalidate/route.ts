// app/api/revalidate/route.ts
// On-demand ISR revalidation. Called by:
//   - scripts/ingest.ts after upserts
//   - Supabase trigger / cron after manual edits
//
// Body: { paths: string[] }
// Header: x-revalidate-secret  must match REVALIDATE_SECRET env var.

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { paths?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paths = body.paths;
  if (!Array.isArray(paths) || !paths.every((p): p is string => typeof p === "string")) {
    return NextResponse.json({ error: "paths must be string[]" }, { status: 400 });
  }

  for (const p of paths) revalidatePath(p);
  return NextResponse.json({ revalidated: paths.length, paths });
}
