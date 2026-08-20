import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { TrustBar } from "@/components/sections/trust-bar";
import { getSettings, resolveFonts } from "@/lib/sanity/settings";
import { normalizeSettings } from "@/lib/site-config";
import { resolveTheme, themeCssVars, themePreviewScript } from "@/lib/theme";
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  const settings: SiteSettings | null = await getSettings().catch(() => null);
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

  const theme = resolveTheme(settings);
  const { heading, body } = resolveFonts(settings);
  const brandVars = themeCssVars(settings);
  const brandName = settings?.brandName || "VoltGear";

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
      className={cn(theme === "dark" && "dark", heading.variable, body.variable)}
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
        {CLARITY_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_ID}");`,
            }}
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <CartProvider>
          <WishlistProvider>
          <UrgencyTicker announcement={config.announcement} />
          <Navbar settings={settings} />
          <main className="flex-1">{children}</main>
          <TrustBar settings={settings} />
          <Footer settings={settings} />
          <CartDrawer />
          <ReviewReminderPopup />
          <CartEffects />
          <CompareBarWrapper />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}