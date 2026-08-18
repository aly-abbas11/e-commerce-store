"use client";

import { useState } from "react";
import { Camera, Loader2, Send, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/upload";

export function ReviewForm({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    try {
      let image: string | undefined;
      if (photo) {
        const uploaded = await uploadImage(photo);
        image = uploaded.secureUrl;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          rating,
          name: data.name,
          email: data.email,
          comment: data.comment,
          ...(image ? { image } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-muted/40 p-5 text-sm">
        <p className="font-semibold">Thanks for your review!</p>
        <p className="mt-1 text-muted-foreground">
          It&rsquo;s been submitted for approval and will appear here shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <Label>Your rating *</Label>
        <div className="mt-1.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="p-1"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  (hover || rating) >= value
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>
        {rating === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Tap a star to rate.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="review-name">Name *</Label>
          <Input id="review-name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="review-email">Email *</Label>
          <Input
            id="review-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="review-comment">Review *</Label>
        <Textarea
          id="review-comment"
          name="comment"
          rows={4}
          required
          placeholder="What did you like or dislike about this product?"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Attach a photo (optional)</Label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Camera className="h-4 w-4" />
          {photo ? photo.name : "Add a photo of the product"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setPhoto(file);
              setPhotoUrl(file ? URL.createObjectURL(file) : null);
            }}
          />
        </label>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Selected review photo"
            className="mt-2 max-h-40 rounded-lg border object-cover"
          />
        )}
        {photo && (
          <button
            type="button"
            onClick={() => {
              setPhoto(null);
              setPhotoUrl(null);
            }}
            className="text-xs text-muted-foreground underline"
          >
            Remove photo
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting || rating === 0}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit review
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Reviews are checked before publishing. We&rsquo;ll verify your order to
        mark you as a verified buyer.
      </p>
    </form>
  );
}
