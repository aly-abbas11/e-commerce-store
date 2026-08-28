import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/db/admin-store";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return <SettingsForm settings={settings as never} />;
}
