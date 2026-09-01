"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearAdminToken } from "@/lib/admin-token";
import { isAdminLoginPath } from "@/lib/storefront-layout-rules";
import { cn } from "@/lib/utils";

import { adminFetch } from "./admin-fetch";

const NAV = [
  { href: "/admin", label: "Home", exact: true },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Shop types" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/broadcast", label: "Messaging" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (isAdminLoginPath(pathname)) {
    return <>{children}</>;
  }

  async function logout() {
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
    } catch {
      // still clear local token
    }
    clearAdminToken();
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-dvh bg-[var(--g-cream)]">
      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-40 w-56 border-r p-4 md:static md:block",
          !open && "max-md:hidden"
        )}
      >
        <p className="admin-sidebar-brand mb-6 text-sm font-semibold tracking-tight">
          Store admin
        </p>
        <nav className="space-y-1" aria-label="Admin">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "admin-nav-link block rounded-md px-3 py-2 text-sm transition-colors",
                  active && "admin-nav-link-active"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="admin-sign-out mt-8 w-full justify-start hover:bg-transparent"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </aside>
      <div className="admin-main flex min-w-0 flex-1 flex-col">
        <header className="admin-mobile-bar flex items-center gap-2 border-b px-4 py-3 md:hidden">
          <Button
            variant="outline"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <span className="text-sm font-medium">Admin</span>
        </header>
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
