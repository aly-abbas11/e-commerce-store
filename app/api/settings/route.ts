import { fetchFromSanity } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Public site configuration for client components (cart drawer, checkout).
 * Only non-sensitive fields are exposed. Falls back to sane defaults when
 * Sanity is not configured so the storefront still works without it.
 */
export async function GET() {
  try {
    const settings = await fetchFromSanity<SiteSettings | null>(
      siteSettingsQuery
    );
    return Response.json({
      brandName: settings?.brandName || "VoltGear",
      freeShippingThreshold: settings?.freeShippingThreshold ?? 5000,
      shippingFee: settings?.shippingFee ?? 199,
      returnPolicy:
        settings?.returnPolicy ||
        "Free returns within 7 days — no questions asked.",
      warrantyInfo: settings?.warrantyInfo || "2-year warranty included.",
      currency: settings?.currency || "PKR",
      email: settings?.email || "",
    });
  } catch {
    return Response.json({
      brandName: "VoltGear",
      freeShippingThreshold: 5000,
      shippingFee: 199,
      returnPolicy: "Free returns within 7 days — no questions asked.",
      warrantyInfo: "2-year warranty included.",
      currency: "PKR",
      email: "",
    });
  }
}
