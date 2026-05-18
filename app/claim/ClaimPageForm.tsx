// app/claim/ClaimPageForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  listingId: string;
  businessName: string;
}

export function ClaimPageForm({ listingId, businessName }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        role: form.get("role"),
        notes: form.get("notes"),
      }),
    });
    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-lg bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-200">
        <h2 className="font-semibold">Claim request received</h2>
        <p className="mt-1 text-sm">
          We&apos;ve received your claim for <strong>{businessName}</strong>. Our team will verify ownership and email
          you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cp-name">Your name</Label>
          <Input id="cp-name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-role">Your role</Label>
          <Input id="cp-role" name="role" placeholder="Owner / Manager" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-email">Work email</Label>
          <Input id="cp-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-phone">Phone</Label>
          <Input id="cp-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cp-notes">Anything we should know? (optional)</Label>
        <Textarea id="cp-notes" name="notes" rows={3} />
      </div>
      {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
      <Button type="submit" disabled={status === "submitting"} className="bg-amber-600 hover:bg-amber-700">
        {status === "submitting" ? "Submitting…" : "Submit claim"}
      </Button>
    </form>
  );
}
