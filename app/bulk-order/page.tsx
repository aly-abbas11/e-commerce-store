"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Package, Send, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { warrantyLabel } from "@/lib/site-config";
import { useSiteConfig } from "@/lib/use-site-config";

export default function BulkOrderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const config = useSiteConfig();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "bulk-order-inquiry" }),
      });
    } catch {}
    setSending(false);
    setSubmitted(true);
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk &amp; Wholesale Orders</h1>
          <p className="mt-3 text-muted-foreground">
            Looking to order VoltGear products in bulk for your business, corporate gifts, or
            reselling? We offer competitive pricing for orders of 10+ units.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-4 text-center">
              <Package className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-medium">10+ Units</p>
              <p className="text-xs text-muted-foreground">Volume discounts start here</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center">
              <Truck className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-muted-foreground">On all bulk orders</p>
            </div>
            {config.warrantyMonths && (
              <div className="rounded-xl border bg-card p-4 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm font-medium">Warranty Included</p>
                <p className="text-xs text-muted-foreground">{warrantyLabel(config.warrantyMonths)}</p>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          <h2 className="text-lg font-semibold">Pricing Tiers</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Discounts apply based on order quantity</li>
            <li>• Contact us for a custom quote for 200+ units</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 text-lg font-semibold">Inquiry Submitted!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We&rsquo;ll get back to you with a custom quote.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-semibold">Request a Quote</h2>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input id="company" name="company" required placeholder="Your Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-name">Contact Name *</Label>
                <Input id="contact-name" name="contactName" required placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input id="contact-email" name="email" type="email" required placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" name="phone" type="tel" placeholder="+92 300 0000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Estimated Quantity *</Label>
                <Input id="quantity" name="quantity" type="number" min="10" required placeholder="e.g. 50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Additional Details</Label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Tell us about your needs..."
                  className="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background"
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Submit Inquiry</>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
