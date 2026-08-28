"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { FirstPartyTracker } from "@/components/analytics/first-party-tracker";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { GadgetFooter } from "@/components/gadget/gadget-footer";
import { GadgetNavbar } from "@/components/gadget/gadget-navbar";
import { TrustBar } from "@/components/sections/trust-bar";
import { chromeMode } from "@/lib/storefront-layout-rules";
import type { ShopType } from "@/lib/categories";
import type { SiteSettings } from "@/lib/types";

export function AppChrome({
  children,
  settings,
  shopTypes,
  cartDrawer,
  reviewReminder,
  cartEffects,
  urgencyTicker,
  compareBar,
  demoBanner,
}: {
  children: ReactNode;
  settings: SiteSettings | null;
  shopTypes: ShopType[];
  cartDrawer: ReactNode;
  reviewReminder: ReactNode;
  cartEffects: ReactNode;
  urgencyTicker: ReactNode;
  compareBar: ReactNode;
  demoBanner: ReactNode;
}) {
  const pathname = usePathname();
  if (!pathname) {
    return <>{children}</>;
  }
  const mode = chromeMode(pathname);

  if (mode === "admin") {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <WishlistProvider>
        {mode === "gadget" ? (
          <>
            {demoBanner}
            <GadgetNavbar settings={settings} shopTypes={shopTypes} />
            <main className="flex-1">{children}</main>
            <GadgetFooter settings={settings} shopTypes={shopTypes} />
            {cartDrawer}
            {cartEffects}
          </>
        ) : (
          <>
            <FirstPartyTracker />
            {urgencyTicker}
            {demoBanner}
            <Navbar settings={settings} shopTypes={shopTypes} />
            <main className="flex-1">{children}</main>
            <TrustBar settings={settings} />
            <Footer settings={settings} shopTypes={shopTypes} />
            {cartDrawer}
            {reviewReminder}
            {cartEffects}
            {compareBar}
          </>
        )}
      </WishlistProvider>
    </CartProvider>
  );
}
