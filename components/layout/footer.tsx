import Image from "next/image";
import Link from "next/link";

import { imageUrl } from "@/lib/sanity/image";
import { FALLBACK_SHOP_TYPES, shopTypeLinks, type ShopType } from "@/lib/categories";
import { Separator } from "@/components/ui/separator";
import { getSocialIcon } from "@/components/icons/social-icons";
import type { SiteSettings } from "@/lib/types";

export function Footer({
  settings,
  shopTypes = FALLBACK_SHOP_TYPES,
}: {
  settings: SiteSettings | null;
  shopTypes?: ShopType[];
}) {
  const links = shopTypeLinks(shopTypes);
  const brandName = settings?.brandName || "VoltGear";
  const logoUrl = settings?.logo
    ? imageUrl(settings.logo, { w: 120 })
    : undefined;

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="space-y-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={brandName}
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <p className="text-lg font-bold">
              {brandName}
              <span className="text-primary">.</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {settings?.tagline ||
              "Premium electronics accessories. Smarter tech for everyday life."}
          </p>
          <div className="flex gap-2">
            {(settings?.socialLinks ?? [])
              .filter(
                (social) =>
                  social.platform &&
                  social.url &&
                  social.url.startsWith("http")
              )
              .map(
              (social) =>
                social.platform &&
                social.url && (
                  <a
                    key={social.platform}
                    href={social.url}
                    aria-label={social.platform}
                    target={social.url.startsWith("http") ? "_blank" : undefined}
                    rel={social.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex h-11 w-11 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    {(() => {
                      const Icon = getSocialIcon(social.platform);
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </a>
                )
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Shop</h3>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/about"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/bulk-order"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Bulk Orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Support</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/track"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Track Order
              </Link>
            </li>
            <li>
              <Link
                href="/warranty"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Warranty &amp; Returns
              </Link>
            </li>
            <li>
              <Link
                href="/shipping-returns"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Shipping &amp; Returns
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Get in Touch</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {settings?.email && <li>{settings.email}</li>}
            {settings?.phone && <li>{settings.phone}</li>}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>

      <Separator />
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row lg:px-8">
        <p>
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
        <p className="flex gap-2">
          <Link
            href="/privacy-policy"
            className="flex min-h-11 items-center hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="flex min-h-11 items-center hover:text-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href="/admin/broadcast"
            className="flex min-h-11 items-center hover:text-foreground"
          >
            Admin
          </Link>
        </p>
        <p>Powered by Next.js, Sanity &amp; Cloudinary</p>
      </div>
    </footer>
  );
}