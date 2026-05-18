// components/listing/LeadForm.tsx
"use client";

// Sticky right-column lead form: "Send a message to [Business]"
// Posts to /api/leads which writes to Supabase + emails the business (once verified).

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck } from "lucide-react";

interface Props {
  listingId: string;
  businessName: string;
  category: string;
}

export function LeadForm({ listingId, businessName, category }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    const form = new FormData(e.currentTarget);

    // Honeypot — bots will fill this, real users won't.
    if (form.get("website_url")) {
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          message: form.get("message"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Request failed");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <section
        id="lead-form"
        aria-live="polite"
        className="rounded-2xl border bg-emerald-50 ring-1 ring-emerald-200 p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-emerald-900">Message sent</h2>
        <p className="mt-1 text-sm text-emerald-900/80">
          Thanks — we&apos;ve passed your enquiry to {businessName}. They typically reply within a few hours.
        </p>
      </section>
    );
  }

  return (
    <section id="lead-form" className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Send a message to {businessName}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Free quote. No obligation. Usually replies within a few hours.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Honeypot — hidden from users */}
        <div className="hidden" aria-hidden>
          <Label htmlFor="website_url">Website</Label>
          <Input id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-name">Your name</Label>
          <Input id="lead-name" name="name" required autoComplete="name" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="lead-email">Email</Label>
            <Input id="lead-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-phone">Phone</Label>
            <Input id="lead-phone" name="phone" type="tel" autoComplete="tel" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lead-message">What do you need help with?</Label>
          <Textarea
            id="lead-message"
            name="message"
            rows={4}
            required
            placeholder={`Hi, I'm looking for a ${category.toLowerCase()}…`}
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">{errorMessage ?? "Something went wrong. Please try again."}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Your details are only shared with {businessName}.
        </p>
      </form>
    </section>
  );
}
