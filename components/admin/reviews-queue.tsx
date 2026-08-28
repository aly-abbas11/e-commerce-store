"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { adminFetch, AdminAuthError } from "@/components/admin/admin-fetch";
import { Button } from "@/components/ui/button";

type Submission = {
  id: string;
  name?: string;
  email?: string;
  rating?: number;
  comment?: string;
  status?: string;
  product_name?: string;
  created_at?: string;
};

export function ReviewsQueue({ reviews }: { reviews: Submission[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    setError(null);
    try {
      await adminFetch("/api/admin/reviews", {
        method: "PATCH",
        body: JSON.stringify({ id, action }),
      });
      router.refresh();
    } catch (err) {
      if (err instanceof AdminAuthError) router.replace("/admin/login");
      else setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Review submissions</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {r.name || "Anonymous"} · {r.rating ?? "—"}/5
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.product_name || "Product"} · {r.email} · {r.status}
                  </p>
                  <p className="mt-2 text-sm">{r.comment}</p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy === r.id} onClick={() => act(r.id, "approve")}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy === r.id}
                      onClick={() => act(r.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
