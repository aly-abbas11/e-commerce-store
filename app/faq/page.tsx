import { Metadata } from "next";
import Link from "next/link";
import {
  Headphones,
  Search,
  Truck,
  ShieldCheck,
  Package,
  RotateCcw
} from "lucide-react";
import { CatalogBreadcrumbs } from "@/components/catalog/catalog-breadcrumbs";
import { FaqInteractive } from "./faq-interactive";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - VoltGear",
  description: "Find answers to common questions about shipping, orders, payments, warranty, and product support.",
};

export default function FaqPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Support", href: "/contact" },
    { label: "FAQ", current: true },
  ];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/5 to-transparent px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -m-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl z-0" />
        <div className="mx-auto max-w-7xl relative z-10">
          <CatalogBreadcrumbs items={breadcrumbs} />
          
          <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-12">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-primary uppercase mb-6 shadow-sm border border-primary/20">
                We&apos;re Here to Help
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
                Frequently Asked <br/><span className="text-primary">Questions</span>
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg max-w-lg font-medium leading-relaxed mb-8">
                Find answers to common questions about shipping, orders, payments, warranty, and product support. Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
              </p>
              
              <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search questions, e.g. delivery, warranty, payment..."
                  className="w-full rounded-lg border border-border bg-white py-3.5 pl-12 pr-24 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-primary p-2.5 text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </button>
              </div>
            </div>
            
            {/* Visual Graphic Representation (3D Headphones area replicated from Contact) */}
            <div className="relative hidden md:flex items-center justify-center shrink-0 w-[400px] h-[250px]">
               <div className="absolute top-10 right-20 w-16 h-16 bg-[#86D8C8] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm flex items-center justify-center shadow-md animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
                  </div>
               </div>
               <div className="relative w-56 h-56 rounded-full bg-gradient-to-tr from-[#319795] via-[#4FD1C5] to-[#B2F5EA] flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                  <Headphones className="w-28 h-28 text-white drop-shadow-md" strokeWidth={1.5} />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Application */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-border/80 bg-white/50 relative z-10">
         <FaqInteractive />
      </section>

      {/* Still Need Help Box */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F0F7F6] border border-primary/20 p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
           <div className="relative shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl shadow-primary/10 border border-primary/5 p-4">
              <Headphones className="w-12 h-12 text-[#319795]" strokeWidth={1.5} />
           </div>
           <div className="flex-1 text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#319795] mb-2">Still Need Help?</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3">We&apos;re here for you</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Our support team is ready to assist you with any order, product, or technical questions.
              </p>
           </div>
           <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0 pt-4 sm:pt-0">
             <Link href="/contact" className="w-full flex justify-center items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover">
                <Headphones className="h-4 w-4" /> Contact Support
             </Link>
             <Link href="/track" className="w-full flex justify-center items-center gap-2 rounded-lg bg-white border border-border px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-secondary">
                <Package className="h-4 w-4" /> Track Your Order
             </Link>
           </div>
        </div>
      </section>

      {/* Feature Promises Row */}
      <section className="border-t bg-secondary/20 mt-8">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-5">
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary drop-shadow-sm">
                 <Truck className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">Fast Delivery</p>
                 <p className="hidden text-[10px] text-muted-foreground xl:block">Across Pakistan</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary drop-shadow-sm">
                 <ShieldCheck className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">Secure Payments</p>
                 <p className="hidden text-[10px] text-muted-foreground xl:block">100% Safe Checkout</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary drop-shadow-sm">
                 <RotateCcw className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">7 Days Returns</p>
                 <p className="hidden text-[10px] text-muted-foreground xl:block">Easy & Hassle-free</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary drop-shadow-sm">
                 <ShieldCheck className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">1 Year Warranty</p>
                 <p className="hidden text-[10px] text-muted-foreground xl:block">On all products</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary drop-shadow-sm">
                 <Headphones className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">Dedicated Support</p>
                 <p className="hidden text-[10px] text-muted-foreground xl:block">We&apos;re here to help</p>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
