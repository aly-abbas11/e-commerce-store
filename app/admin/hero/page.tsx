import type { Metadata } from "next";

import { HeroForm } from "@/components/admin/hero-form";
import { getAdminHero } from "@/lib/db/admin-store";

export const metadata: Metadata = {
  title: "Hero",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const hero = await getAdminHero();
  return <HeroForm hero={hero as never} />;
}
