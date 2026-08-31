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
  const page = await loadCmsPage("privacy-policy");
  return {
    title: page?.seo?.title || page?.title || "Privacy Policy",
    description:
      page?.seo?.description ||
      page?.excerpt ||
      "How we collect, use, and protect your information.",
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await loadCmsPage("privacy-policy");
  const brand = normalizeSettings(await getSettings().catch(() => null)).storeName;

  return (
    <GadgetArticleShell
      eyebrow="Company"
      title={page?.title || "Privacy policy"}
      description={
        page?.excerpt ||
        `How ${brand} handles order details, contact info, and site usage data.`
      }
      coverUrl={cmsCover(page)}
      backHref="/contact"
      backLabel="Contact us"
    >
      {page?.sections?.length ? (
        <GadgetCmsSections page={page} />
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--g-charcoal)]">What we collect</h2>
          <p>
            When you place an order or contact us, we may collect your name, phone, email,
            shipping address, and order details so we can fulfill and support your purchase.
          </p>
          <h2 className="text-2xl font-semibold text-[var(--g-charcoal)]">How we use it</h2>
          <p>
            We use this information to process COD orders, send updates, handle warranty or
            return requests, and improve the storefront. We do not sell your personal data.
          </p>
          <h2 className="text-2xl font-semibold text-[var(--g-charcoal)]">Questions</h2>
          <p>
            For privacy requests, reach us via the contact page. We will respond as soon as we
            can.
          </p>
        </div>
      )}
    </GadgetArticleShell>
  );
}
