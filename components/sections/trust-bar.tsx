import { Banknote, RotateCcw, ShieldCheck, Truck, Award } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  normalizeSettings,
  returnsLabel,
  warrantyLabel,
} from "@/lib/site-config";
import type { SiteSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function TrustBar({ settings }: { settings: SiteSettings | null }) {
  const config = normalizeSettings(settings);

  const items = [
    {
      icon: Truck,
      label: `Free shipping over ${formatPrice(config.freeShippingThreshold)}`,
      sub: "Fast delivery, tracked",
    },
    {
      icon: ShieldCheck,
      label: "Secure checkout",
      sub: "SSL encrypted payments",
    },
    ...(config.codEnabled
      ? [
          {
            icon: Banknote,
            label: "Cash on Delivery",
            sub: "Pay when it arrives",
          },
        ]
      : []),
    ...(config.warrantyMonths
      ? [
          {
            icon: Award,
            label: warrantyLabel(config.warrantyMonths),
            sub: "Full manufacturer coverage",
          },
        ]
      : []),
    ...(config.returnWindowDays
      ? [
          {
            icon: RotateCcw,
            label: returnsLabel(config.returnWindowDays),
            sub: "No questions asked",
          },
        ]
      : []),
  ];

  return (
    <section className="border-t bg-muted/40">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 px-4 py-6 sm:gap-0 sm:divide-x sm:divide-border lg:px-8">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-2 py-2 sm:px-8 sm:py-0"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <item.icon
                className="h-5 w-5 text-primary"
                strokeWidth={2}
                aria-hidden
              />
            </div>
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <Separator />
    </section>
  );
}