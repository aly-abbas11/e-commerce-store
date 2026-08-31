import type { Metadata } from "next";

import {
  GadgetArticleShell,
  GadgetCmsSections,
  cmsCover,
  loadCmsPage,
} from "@/components/gadget/gadget-article-shell";
import { getSettings } from "@/lib/sanity/settings";
import { normalizeSettings } from "@/lib/site-config";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadCmsPage("terms-of-service");
  return {
    title: page?.seo?.title || page?.title || "Terms and Conditions",
    description:
      page?.seo?.description ||
      page?.excerpt ||
      "Terms for shopping, COD, and using this storefront.",
    alternates: { canonical: "/terms-of-service" },
  };
}

export default async function TermsPage() {
  const page = await loadCmsPage("terms-of-service");
  const brand = normalizeSettings(await getSettings().catch(() => null)).storeName;

  return (
    <GadgetArticleShell
      eyebrow="Company"
      title={page?.title || "Terms and conditions"}
      description={
        page?.excerpt ||
        `Rules for ordering from ${brand}, cash on delivery, and using this website.`
      }
      coverUrl={cmsCover(page)}
      backHref="/faq"
      backLabel="Customer care"
    >
      {page?.sections?.length ? (
        <GadgetCmsSections page={page} />
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--g-charcoal)]">Orders</h2>
          <p>
            By placing an order you confirm your contact and delivery details are accurate.
            We may call or message to confirm COD orders before dispatch.
          </p>
          <h2 className="text-2xl font-semibold text-[var(--g-charcoal)]">Pricing & stock</h2>
          <p>
            Prices and availability can change. If an item cannot be fulfilled, we will contact
            you promptly with options.
          </p>
          <h2 className="text-2xl font-semibold text-[var(--g-charcoal)]">Policies</h2>
          <p>
            Shipping, returns, and warranty details are described on their dedicated Care pages
            and form part of these terms.
          </p>
        </div>
      )}
    </GadgetArticleShell>
  );
}
