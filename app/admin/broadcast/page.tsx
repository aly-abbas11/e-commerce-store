import type { Metadata } from "next";

import { BroadcastManager } from "@/components/messaging/broadcast-manager";

export const metadata: Metadata = {
  title: "Customer Messaging",
  robots: { index: false, follow: false },
};

export default function AdminBroadcastPage() {
  return (
    <div className="max-w-5xl">
      <BroadcastManager />
    </div>
  );
}
