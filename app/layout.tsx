import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";

import { AppChrome } from "@/components/layout/app-chrome";
import { DemoBanner } from "@/components/demo/demo-banner";
import { shouldLoadClarity } from "@/lib/clarity-rules";
import { publicSiteUrl } from "@/lib/deploy-rules";
import { FALLBACK_SHOP_TYPES } from "@/lib/categories";
import { fetchShopTypes } from "@/lib/db/store";
import { getSettings, resolveFonts } from "@/lib/sanity/settings";
import { pathnameFromHeaders } from "@/lib/storefront-layout-rules";
import { normalizeSettings } from "@/lib/site-config";
import { themeCssVars, themePreviewScript } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";
import "./globals.css";

const CartDrawer = dynamic(
  () =>
    import("@/components/cart/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false, loading: () => null }
);

const ReviewReminderPopup = dynamic(
  () =>
    import("@/components/reviews/review-reminder-popup").then(
      (m) => m.ReviewReminderPopup
    ),
  { ssr: false, loading: () => null }
);

const CartEffects = dynamic(
  () => import("@/components/effects/cart-effects").then((m) => m.CartEffects),
  { ssr: false, loading: () => null }
);

const UrgencyTicker = dynamic(
  () =>
    import("@/components/sections/urgency-ticker").then((m) => m.UrgencyTicker),
  { ssr: false, loading: () => null }
);

const CompareBarWrapper = dynamic(
  () =>
    import("@/components/product/compare-bar-wrapper").then(
      (m) => m.CompareBarWrapper
    ),
  { ssr: false, loading: () => null }
);

const SITE_URL = publicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VoltGear — Premium Electronics Accessories",
    template: "%s | VoltGear",
  },
  description:
    "Shop smartwatches, power banks, chargers and earbuds. Premium electronics accessories with fast shipping.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "VoltGear",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltGear — Premium Electronics Accessories",
    description:
      "Shop smartwatches, power banks, chargers and earbuds. Premium electronics accessories with fast shipping.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = headers();
  const pathname = pathnameFromHeaders({
    "x-pathname": hdrs.get("x-pathname"),
    "next-url": hdrs.get("next-url"),
  });
  const skipStorefrontFetch = pathname.startsWith("/admin");

  const settings: SiteSettings | null = skipStorefrontFetch
    ? null
    : await getSettings().catch(() => null);
  const shopTypes = skipStorefrontFetch
    ? FALLBACK_SHOP_TYPES
    : await fetchShopTypes().catch(() => FALLBACK_SHOP_TYPES);
  const config = normalizeSettings(settings);

  if (settings?.seo?.title) {
    metadata.title = {
      default: settings.seo.title,
      template: `%s | ${settings.brandName}`,
    };
  }
  if (settings?.seo?.description) {
    metadata.description = settings.seo.description;
  }


  const { heading, body } = resolveFonts(settings);
  const brandVars = themeCssVars(settings);
  const brandName = settings?.brandName || "VoltGear";
  const loadClarity = shouldLoadClarity({
    id: CLARITY_ID,
    isAdmin: !pathname || pathname.startsWith("/admin"),
    host: hdrs.get("x-forwarded-host") || hdrs.get("host") || "",
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: brandName,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brandName,
      url: SITE_URL,
      ...(settings?.logo
        ? { logo: `${SITE_URL}/api/logo` }
        : {}),
    },
  ];

  return (
    <html
      lang="en"
      className={cn(heading.variable, body.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {brandVars && (
          <style dangerouslySetInnerHTML={{ __html: `:root{${brandVars}}` }} />
        )}
        <script
          dangerouslySetInnerHTML={{ __html: themePreviewScript() }}
        />
        {GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`,
              }}
            />
          </>
        )}
        {loadClarity && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_ID}");`,
            }}
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <AppChrome
          settings={settings}
          shopTypes={shopTypes}
          urgencyTicker={<UrgencyTicker announcement={config.announcement} />}
          cartDrawer={<CartDrawer />}
          reviewReminder={<ReviewReminderPopup />}
          cartEffects={<CartEffects />}
          compareBar={<CompareBarWrapper />}
          demoBanner={<DemoBanner />}
        >
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
