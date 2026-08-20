import { fetchFromSanity } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { normalizeSettings } from "@/lib/site-config";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Public site configuration for client components (cart drawer, checkout).
 * All normalization and fallback logic lives in normalizeSettings() so the
 * storefront has exactly one source of truth. Falls back to the canonical
 * operational defaults (PKR 5,000 free-shipping threshold, Rs 199 shipping
 * fee) when Sanity is not configured.
 */
export async function GET() {
  try {
    const settings = await fetchFromSanity<SiteSettings | null>(
      siteSettingsQuery
    );
    return Response.json(normalizeSettings(settings));
  } catch {
    return Response.json(normalizeSettings(null));
  }
}