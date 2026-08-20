import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { getSettings } from "@/lib/sanity/settings";
import {
  normalizeSettings,
  returnsLabel,
  warrantyLabel,
} from "@/lib/site-config";

export const metadata = {
  title: "Warranty & Returns",
  description: "VoltGear warranty and return policy details.",
};

export default async function WarrantyPage() {
  const settings = await getSettings().catch(() => null);
  const config = normalizeSettings(settings);
  const email = config.supportEmail;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Warranty &amp; Returns</h1>
      <p className="mt-3 text-muted-foreground">
        Every VoltGear product comes with our commitment to quality. Here&apos;s what&apos;s covered.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {config.warrantyMonths ? (
          <div className="rounded-xl border bg-card p-5">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">{warrantyLabel(config.warrantyMonths)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Coverage on manufacturing defects and hardware failures for{" "}
              {config.warrantyMonths} months from the date of purchase.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-5">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">Warranty Coverage</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Warranty terms are currently being finalized. Contact us with your order number
              and we&apos;ll take care of any issues.
            </p>
          </div>
        )}
        {config.returnWindowDays ? (
          <div className="rounded-xl border bg-card p-5">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">{returnsLabel(config.returnWindowDays)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Changed your mind? Return unused products within {config.returnWindowDays} days
              for a full refund.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-5">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">Returns</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Return terms are currently being finalized. Contact us with your order number
              and we&apos;ll help you out.
            </p>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      <h2 className="text-lg font-semibold">How to Claim Warranty</h2>
      <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
          {email ? (
            <span>
              Contact us at{" "}
              <a href={`mailto:${email}`} className="font-medium text-primary hover:underline">
                {email}
              </a>{" "}
              with your order number.
            </span>
          ) : (
            <span>
              Contact us via our{" "}
              <a href="/contact" className="font-medium text-primary hover:underline">
                contact page
              </a>{" "}
              with your order number.
            </span>
          )}
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
          <span>Describe the issue and attach photos/videos if possible.</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
          <span>We&apos;ll review your case and arrange a replacement or repair.</span>
        </li>
      </ol>

      {config.returnWindowDays && (
        <>
          <Separator className="my-8" />

          <h2 className="text-lg font-semibold">Return Policy</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Products must be in original packaging and unused condition.</li>
            <li>• Gift-wrapped orders receive a full refund including the wrapping fee.</li>
          </ul>
        </>
      )}

      <div className="mt-8 rounded-xl bg-muted/40 p-5">
        <div className="flex items-center gap-2 font-medium">
          <Mail className="h-4 w-4 text-primary" />
          Need help?
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {email ? (
            <>
              Email us at{" "}
              <a href={`mailto:${email}`} className="text-primary hover:underline">
                {email}
              </a>{" "}
              or visit our{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>
              .
            </>
          ) : (
            <>
              Visit our{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>{" "}
              and we&apos;ll get back to you.
            </>
          )}
        </p>
      </div>
    </div>
  );
}