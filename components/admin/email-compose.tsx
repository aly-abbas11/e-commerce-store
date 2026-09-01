"use client";

import { useState } from "react";

import { adminFetch } from "@/components/admin/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TEMPLATES: { id: string; label: string; subject: string; text: string }[] = [
  {
    id: "blank",
    label: "Blank",
    subject: "",
    text: "",
  },
  {
    id: "promo",
    label: "Promo",
    subject: "Something new from VoltGear",
    text: "Hi,\n\nWe thought you’d like this update from our store.\n\nShop now: https://voltgear-coral.vercel.app/products2\n\n— VoltGear",
  },
  {
    id: "restock",
    label: "Back in stock",
    subject: "It’s back in stock",
    text: "Hi,\n\nAn item you might want is available again.\n\nBrowse the shop: https://voltgear-coral.vercel.app/products2\n\n— VoltGear",
  },
];

export function EmailCompose() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [confirmPermission, setConfirmPermission] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(id: string) {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setText(t.text);
  }

  async function send() {
    setBusy(true);
    setError(null);
    setResult(null);
    const recipients = to
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const data = (await adminFetch("/api/admin/email/send", {
        method: "POST",
        body: JSON.stringify({
          to: recipients.length === 1 ? recipients[0] : recipients,
          subject,
          text,
          confirmPermission,
        }),
      })) as { sent?: number; failed?: { email: string }[] };
      setResult(
        `Sent ${data.sent ?? 0}. Failed: ${data.failed?.length ?? 0}${
          data.failed?.length
            ? ` (${data.failed.map((f) => f.email).join(", ")})`
            : ""
        }`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Email</h2>
      <p className="text-sm text-muted-foreground">
        Send from your domain mail (Resend / FROM_EMAIL). One address, or several
        separated by commas.
      </p>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <Button
            key={t.id}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => applyTemplate(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">To</span>
        <Input
          placeholder="customer@email.com or many, comma-separated"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Subject</span>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          className="min-h-[140px] w-full rounded-md border px-3 py-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirmPermission}
          onChange={(e) => setConfirmPermission(e.target.checked)}
        />
        <span>
          I have permission to email these people (required for bulk / more than
          one address).
        </span>
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {result ? (
        <p className="text-sm text-[var(--g-forest)]">{result}</p>
      ) : null}
      <Button
        type="button"
        disabled={busy || !to.trim() || !subject.trim() || !text.trim()}
        onClick={send}
      >
        {busy ? "Sending…" : "Send email"}
      </Button>
    </div>
  );
}
