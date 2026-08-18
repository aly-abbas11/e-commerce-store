import type { Metadata } from "next";

import { BroadcastManager } from "@/components/messaging/broadcast-manager";

export const metadata: Metadata = {
  title: "Customer Messaging",
  robots: { index: false, follow: false },
};

export default function AdminBroadcastPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <BroadcastManager />
    </div>
  );
}
