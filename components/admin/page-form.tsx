"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PublishBar } from "@/components/admin/publish-bar";
import { adminFetch, AdminAuthError } from "@/components/admin/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify, type PublishStatus } from "@/lib/db/publish";

type PageRow = {
  id: string;
  title?: string;
  slug?: string;
  page_type?: string;
  excerpt?: string;
  cover_image_url?: string;
  author?: string;
  sections?: unknown;
  keywords?: string[];
  seo?: { title?: string; description?: string };
  status?: PublishStatus;
  draft?: Record<string, unknown> | null;
  is_demo?: boolean;
};

function fromRow(row?: PageRow | null) {
  const draft = row?.draft as Record<string, unknown> | undefined;
  return {
    title: String(draft?.title ?? row?.title ?? ""),
    slug: String(draft?.slug ?? row?.slug ?? ""),
    pageType: String(draft?.pageType ?? row?.page_type ?? "static"),
    excerpt: String(draft?.excerpt ?? row?.excerpt ?? ""),
    coverImage: String(draft?.coverImage ?? row?.cover_image_url ?? ""),
    author: String(draft?.author ?? row?.author ?? ""),
    sectionsText: JSON.stringify(draft?.sections ?? row?.sections ?? [], null, 2),
    keywords: ((draft?.keywords as string[]) ?? row?.keywords ?? []).join(", "),
    seoTitle: String((draft?.seo as { title?: string } | undefined)?.title ?? row?.seo?.title ?? ""),
    seoDescription: String(
      (draft?.seo as { description?: string } | undefined)?.description ?? row?.seo?.description ?? ""
    ),
    isDemo: Boolean(draft?.isDemo ?? row?.is_demo),
  };
}

export function PageForm({ page }: { page?: PageRow | null }) {
  const router = useRouter();
  const isNew = !page;
  const [form, setForm] = useState(() => fromRow(page));
  const [status, setStatus] = useState<PublishStatus>(page?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function doc() {
    let sections: unknown[] = [];
    try {
      sections = JSON.parse(form.sectionsText || "[]");
    } catch {
      throw new Error("Sections must be valid JSON.");
    }
    return {
      title: form.title,
      slug: form.slug,
      pageType: form.pageType === "blog" ? "blog" : "static",
      excerpt: form.excerpt,
      coverImage: form.coverImage,
      author: form.author,
      sections,
      keywords: form.keywords.split(",").map((s) => s.trim()).filter(Boolean),
      seo: { title: form.seoTitle, description: form.seoDescription },
      isDemo: form.isDemo,
    };
  }

  async function run(action: "create" | "save" | "publish" | "unpublish" | "discard" | "delete") {
    setSaving(true);
    setError(null);
    try {
      const payload = doc();
      if (action === "create") {
        const json = await adminFetch("/api/admin/pages", {
          method: "POST",
          body: JSON.stringify({ doc: payload }),
        });
        router.replace(`/admin/pages/${json.id}`);
        return;
      }
      if (!page?.id) return;
      if (action === "delete") {
        if (!confirm("Delete this page?")) return;
        await adminFetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
        router.replace("/admin/pages");
        return;
      }
      await adminFetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, doc: payload }),
      });
      if (action === "publish") setStatus("published");
      if (action === "unpublish") setStatus("unpublished");
      router.refresh();
    } catch (err) {
      if (err instanceof AdminAuthError) router.replace("/admin/login");
      else setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex justify-between gap-4">
        <h1 className="text-2xl font-semibold">{isNew ? "New page" : form.title || "Edit page"}</h1>
        {!isNew && (
          <Button variant="destructive" onClick={() => run("delete")}>
            Delete
          </Button>
        )}
      </div>
      {isNew ? (
        <Button onClick={() => run("create")} disabled={saving}>
          Save draft
        </Button>
      ) : (
        <PublishBar
          status={status}
          saving={saving}
          onSave={() => run("save")}
          onPublish={() => run("publish")}
          onUnpublish={() => run("unpublish")}
          onDiscard={() => run("discard")}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                title: e.target.value,
                slug: f.slug && f.slug !== slugify(f.title) ? f.slug : slugify(e.target.value),
              }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.pageType}
            onChange={(e) => setForm((f) => ({ ...f, pageType: e.target.value }))}
          >
            <option value="static">Static</option>
            <option value="blog">Blog</option>
          </select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Excerpt</Label>
          <Textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Cover image URL</Label>
          <Input value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Author</Label>
          <Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>SEO title</Label>
          <Input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>SEO description</Label>
          <Input
            value={form.seoDescription}
            onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Keywords (comma separated)</Label>
          <Input value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isDemo}
            onChange={(e) => setForm((f) => ({ ...f, isDemo: e.target.checked }))}
          />
          Demo — guests never see this page
        </label>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Body sections (JSON)</Label>
          <Textarea
            rows={12}
            className="font-mono text-xs"
            value={form.sectionsText}
            onChange={(e) => setForm((f) => ({ ...f, sectionsText: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
