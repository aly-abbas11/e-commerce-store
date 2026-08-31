"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { MediaField } from "@/components/admin/media-field";
import { adminFetch, AdminAuthError } from "@/components/admin/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductOption = { id: string; name: string };

type SlideRow = {
  id: string;
  product_id?: string;
  image_url?: string;
  title?: string | null;
  subtitle?: string | null;
  sort_order?: number;
  status?: string;
  is_demo?: boolean;
  products?: { id?: string; name?: string; slug?: string; stock_status?: string } | null;
};

export function HeroSlidesForm({
  slides: initialSlides,
  products,
  blockers,
}: {
  slides: SlideRow[];
  products: ProductOption[];
  blockers: string[];
}) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    productId: products[0]?.id ?? "",
    imageUrl: "",
    title: "",
    subtitle: "",
  });

  const publishedCount = useMemo(
    () => slides.filter((s) => s.status === "published").length,
    [slides]
  );

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      if (err instanceof AdminAuthError) router.replace("/admin/login");
      else setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function createSlide() {
    await run(async () => {
      await adminFetch("/api/admin/hero/slides", {
        method: "POST",
        body: JSON.stringify({
          doc: {
            productId: draft.productId,
            imageUrl: draft.imageUrl,
            title: draft.title,
            subtitle: draft.subtitle,
          },
        }),
      });
      setDraft((d) => ({ ...d, imageUrl: "", title: "", subtitle: "" }));
    });
  }

  async function patchSlide(id: string, action: "save" | "publish" | "unpublish", row: SlideRow) {
    await run(async () => {
      await adminFetch(`/api/admin/hero/slides/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action,
          doc: {
            productId: row.product_id,
            imageUrl: row.image_url,
            title: row.title ?? "",
            subtitle: row.subtitle ?? "",
            sortOrder: row.sort_order,
            isDemo: row.is_demo,
          },
        }),
      });
    });
  }

  async function removeSlide(id: string) {
    if (!confirm("Delete this hero slide?")) return;
    await run(async () => {
      await adminFetch(`/api/admin/hero/slides/${id}`, { method: "DELETE" });
    });
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = slides.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= slides.length) return;
    const next = [...slides];
    const tmp = next[idx];
    next[idx] = next[swap];
    next[swap] = tmp;
    setSlides(next);
    await run(async () => {
      await adminFetch("/api/admin/hero/slides", {
        method: "POST",
        body: JSON.stringify({ action: "reorder", orderedIds: next.map((s) => s.id) }),
      });
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Home2 hero slides</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Product campaign slides for <code>/home2</code>. Published: {publishedCount}/8.
        </p>
      </div>

      {blockers.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Home preview is not ready to publish</p>
          <ul className="mt-1 list-disc pl-5">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Add slide
        </h2>
        <div className="space-y-1.5">
          <Label>Product</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.productId}
            onChange={(e) => setDraft((d) => ({ ...d, productId: e.target.value }))}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <MediaField
          label="Slide image"
          urls={draft.imageUrl ? [draft.imageUrl] : []}
          onChange={(urls) => setDraft((d) => ({ ...d, imageUrl: urls[urls.length - 1] ?? "" }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Title override</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Defaults to product name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitle</Label>
            <Input
              value={draft.subtitle}
              onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
            />
          </div>
        </div>
        <Button onClick={createSlide} disabled={busy || !draft.productId || !draft.imageUrl}>
          Save draft slide
        </Button>
      </div>

      <div className="space-y-3">
        {slides.length === 0 && (
          <p className="text-sm text-muted-foreground">No slides yet. Add at least one.</p>
        )}
        {slides.map((slide, index) => (
          <div key={slide.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image_url || ""}
              alt=""
              className="h-24 w-24 rounded-md object-cover bg-muted"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-medium">
                {slide.title || slide.products?.name || "Untitled"}{" "}
                <span className="text-xs font-normal uppercase text-muted-foreground">
                  {slide.status}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || index === 0}
                  onClick={() => move(slide.id, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || index === slides.length - 1}
                  onClick={() => move(slide.id, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                {slide.status === "published" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => patchSlide(slide.id, "unpublish", slide)}
                  >
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => patchSlide(slide.id, "publish", slide)}
                  >
                    Publish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => removeSlide(slide.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
