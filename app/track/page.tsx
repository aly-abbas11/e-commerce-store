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
      <div className="mb-10 text-center sm:text-left">
        <p className="text-[13px] font-bold uppercase tracking-widest text-primary">
          Customer Support
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
          Track Your Order
        </h1>
        <p className="mt-3 text-[15px] font-medium text-slate-500 max-w-lg mx-auto sm:mx-0 leading-relaxed">
          Enter your order number and the email address used during checkout to monitor shipping and delivery status.
        </p>
      </div>
      <TrackOrder />
    </div>
  );
}
