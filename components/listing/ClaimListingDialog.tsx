// components/listing/ClaimListingDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Listing } from "@/types/listing";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
}

export function ClaimListingDialog({ open, onOpenChange, listing }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const payload = {
      listingId: listing.id,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      notes: formData.get("notes"),
    };
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {status === "success" ? (
          <>
            <DialogHeader>
              <DialogTitle>Claim request received</DialogTitle>
              <DialogDescription>
                We&apos;ve received your claim for <strong>{listing.name}</strong>. Our team will verify ownership
                and email you within one business day.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Claim {listing.name}</DialogTitle>
              <DialogDescription>
                Free to claim. We&apos;ll verify ownership before granting access to update the listing.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="claim-name">Your name</Label>
                <Input id="claim-name" name="name" required autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="claim-role">Your role</Label>
                <Input id="claim-role" name="role" placeholder="Owner / Manager" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="claim-email">Work email</Label>
                <Input id="claim-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="claim-phone">Phone</Label>
                <Input id="claim-phone" name="phone" type="tel" autoComplete="tel" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="claim-notes">Anything we should know? (optional)</Label>
              <Textarea id="claim-notes" name="notes" rows={3} />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={status === "submitting"} className="bg-amber-600 hover:bg-amber-700">
                {status === "submitting" ? "Submitting…" : "Submit claim"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
