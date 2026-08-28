import type { Metadata } from "next";

import { TrackOrder } from "@/components/orders/track-order";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Check the status of your VoltGear order — confirmation, shipping and delivery updates.",
};

export const revalidate = 60;

export default function TrackPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Support
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter the order number from your confirmation email and the email you used
          at checkout.
        </p>
      </div>
      <TrackOrder />
    </div>
  );
}
