"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function GadgetContactForm({
  heading = "Or send a message",
}: {
  heading?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "h-11 w-full rounded-xl border border-[var(--g-line)] bg-[var(--g-white)] px-3 text-sm text-[var(--g-charcoal)] outline-none placeholder:text-[var(--g-taupe)] focus:border-[var(--g-forest)]";
  const label = "text-xs font-semibold uppercase tracking-[0.12em] text-[var(--g-taupe)]";

  return (
    <div className="rounded-2xl border border-[var(--g-line)] bg-[var(--g-white)] p-6 sm:p-8">
      <h2 className="gadget-display text-2xl font-semibold tracking-[-0.03em] text-[var(--g-charcoal)]">
        {heading}
      </h2>
      <p className="mt-2 text-sm text-[var(--g-taupe)]">
        Prefer email? Leave your details and we&apos;ll get back to you.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="g-contact-name" className={label}>
              Name
            </label>
            <input
              id="g-contact-name"
              name="name"
              required
              placeholder="Your name"
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="g-contact-email" className={label}>
              Email
            </label>
            <input
              id="g-contact-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={field}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="g-contact-subject" className={label}>
            Subject
          </label>
          <input
            id="g-contact-subject"
            name="subject"
            required
            placeholder="Order help, warranty, wholesale…"
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="g-contact-message" className={label}>
            Message
          </label>
          <textarea
            id="g-contact-message"
            name="message"
            required
            rows={5}
            placeholder="Tell us more…"
            className="w-full rounded-xl border border-[var(--g-line)] bg-[var(--g-white)] px-3 py-2.5 text-sm text-[var(--g-charcoal)] outline-none placeholder:text-[var(--g-taupe)] focus:border-[var(--g-forest)]"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--g-forest)] px-6 text-sm font-semibold text-[var(--g-white)] transition hover:bg-[var(--g-forest-mid)] disabled:opacity-60 sm:w-auto"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send message
            </>
          )}
        </button>
        {status === "sent" ? (
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--g-forest)]">
            <CheckCircle2 className="h-4 w-4" />
            Thanks — we&apos;ll reply shortly.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-red-700">Something went wrong. Please try again or use WhatsApp.</p>
        ) : null}
      </form>
    </div>
  );
}
