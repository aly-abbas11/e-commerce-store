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
        <div className="space-y-6 text-sm leading-relaxed text-[var(--g-charcoal)]">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--g-charcoal)] mb-2">What We Collect</h2>
            <p>
              When you place an order or contact us, we collect your name, phone number, email address,
              shipping address, and order details to process, deliver, and support your purchases.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--g-charcoal)] mb-2">How We Use Information</h2>
            <p>
              We use personal information to fulfill Cash on Delivery (COD) orders, send order confirmations,
              manage warranty requests, provide support, and improve storefront performance. We do not sell your personal information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--g-charcoal)] mb-2">Third-Party Advertising &amp; Google AdSense</h2>
            <p className="mb-2">
              We may use third-party advertising companies, including Google AdSense, to serve advertisements when you visit our website. These companies may use cookies, web beacons, and similar technologies to collect information about your visits to this and other websites in order to provide targeted advertisements about goods and services of interest to you.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong>Google AdSense Cookies:</strong> Google, as a third-party vendor, uses cookies to serve ads on our site.
              </li>
              <li>
                <strong>Google DART Cookie:</strong> Google&rsquo;s use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet.
              </li>
              <li>
                <strong>Opt-Out Options:</strong> Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--g-forest)] underline font-medium">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-[var(--g-forest)] underline font-medium">aboutads.info</a>.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--g-charcoal)] mb-2">Cookies &amp; Tracking</h2>
            <p>
              We use cookies to maintain cart sessions, analyze website traffic, and deliver a personalized browsing experience. You can control cookie preferences through your browser settings or our site consent manager.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--g-charcoal)] mb-2">Contact &amp; Privacy Requests</h2>
            <p>
              If you have questions regarding this Privacy Policy or wish to request data correction/deletion, please contact our privacy team via our <a href="/contact" className="text-[var(--g-forest)] underline font-medium">Contact Page</a> or email <span className="font-semibold">support@voltgear.pk</span>.
            </p>
          </div>
        </div>
      )}
    </GadgetArticleShell>
  );
}
