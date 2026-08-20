import { unstable_cache } from "next/cache";

import { fetchFromSanity } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/types";
import { bodyFont as bodyInter } from "@/lib/fonts/body-inter";
import { bodyFont as bodyJakarta } from "@/lib/fonts/body-jakarta";
import { bodyFont as bodyManrope } from "@/lib/fonts/body-manrope";
import { headingFont as headingSora } from "@/lib/fonts/heading-sora";
import { headingFont as headingSpaceGrotesk } from "@/lib/fonts/heading-space-grotesk";

export const getSettings = unstable_cache(
  async () => {
    return await fetchFromSanity<SiteSettings | null>(siteSettingsQuery);
  },
  ["site-settings"],
  { revalidate: 60 }
);

export type ThemeFonts = {
  heading: { variable: string };
  body: { variable: string };
};

export function resolveFonts(settings: SiteSettings | null): ThemeFonts {
  const headingPreset = settings?.headingFont ?? "sora";
  const bodyPreset = settings?.bodyFont ?? "jakarta";

  const heading =
    headingPreset === "space-grotesk" ? headingSpaceGrotesk : headingSora;
  const body =
    bodyPreset === "inter" ? bodyInter : bodyPreset === "manrope" ? bodyManrope : bodyJakarta;

  return { heading, body };
}
