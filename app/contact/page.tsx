import { Metadata } from "next";
import Link from "next/link";
import {
  Headphones,
  ClipboardList,
  ShieldCheck,
  Briefcase,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  MapPin,
  ChevronRight,
  MessageCircle,
  Clock4,
  RotateCcw,
  Shield,
  Map
} from "lucide-react";
import { fetchSiteSettings } from "@/lib/db/store";

export const metadata: Metadata = {
  title: "Contact Us - VoltGear",
  description: "Have a question or need assistance? Our VoltGear team is ready to help with orders, product guidance, warranty and bulk inquiries.",
};

const QUICK_CARDS = [
  {
    icon: Headphones,
    title: "Customer Support",
    desc: "Get help with products, orders and general inquiries.",
    actionTitle: "Chat with Us",
    actionHref: "#chat",
  },
  {
    icon: ClipboardList,
    title: "Order Tracking Help",
    desc: "Check order status, shipping updates and deliveries.",
    actionTitle: "Track My Order",
    actionHref: "/track",
  },
  {
    icon: ShieldCheck,
    title: "Warranty & Returns",
    desc: "Warranty claims, returns and replacement support.",
    actionTitle: "Learn More",
    actionHref: "/warranty",
  },
  {
    icon: Briefcase,
    title: "Bulk Orders",
    desc: "For business, resellers and bulk purchase inquiries.",
    actionTitle: "Submit Inquiry",
    actionHref: "/bulk-order",
  },
];

const QUICK_HELP_LINKS = [
  "How to Track My Order",
  "Return & Refund Policy",
  "Warranty Information",
  "Product Compatibility",
  "Shipping Information",
  "Payment Methods",
];

const FAQS = [
  {
    icon: Clock4,
    title: "How can I track my order?",
    desc: "Get real-time updates on your order status and delivery.",
  },
  {
    icon: RotateCcw,
    title: "What is your return policy?",
    desc: "Learn about returns, refunds and replacement process.",
  },
  {
    icon: ShieldCheck,
    title: "How do I claim warranty?",
    desc: "Check eligibility and steps for warranty claims.",
  },
  {
    icon: Map, // Or another icon like 'Smartphone' or 'Layers'
    title: "Which products are compatible with my device?",
    desc: "Find the right accessories for your device.",
  },
];

export default async function ContactPage() {
  const settings = await fetchSiteSettings();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Area */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/5 to-transparent px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -m-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
            <div className="max-w-2xl relative z-10">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-primary uppercase mb-6 shadow-sm border border-primary/20">
                We&apos;re Here to Help
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
                Contact Us
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg max-w-lg font-medium leading-relaxed">
                Have a question or need assistance? Our VoltGear team is ready to help with orders, product guidance, warranty and bulk inquiries.
              </p>
            </div>
            {/* Visual Graphic Representation (3D Headphones area) */}
            <div className="relative z-10 hidden md:flex items-center justify-center shrink-0 w-[400px] h-[250px]">
               <div className="absolute top-10 right-20 w-16 h-16 bg-[#86D8C8] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm flex items-center justify-center shadow-md animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
                  </div>
               </div>
               <div className="relative w-48 h-48 rounded-full bg-gradient-to-tr from-[#319795] via-[#4FD1C5] to-[#B2F5EA] flex items-center justify-center shadow-lg transform -rotate-12 transition-transform hover:scale-105">
                  <Headphones className="w-24 h-24 text-white drop-shadow-md" strokeWidth={1.5} />
               </div>
            </div>
          </div>

          {/* Quick Cards Row */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {QUICK_CARDS.map((card, i) => (
              <div key={i} className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-secondary/30 text-primary">
                  <card.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-sm font-bold text-foreground">{card.title}</h3>
                <p className="mb-6 text-xs text-muted-foreground flex-1">{card.desc}</p>
                <Link
                  href={card.actionHref}
                  className="mt-auto block w-full rounded font-semibold text-primary py-2 text-xs border border-primary/20 hover:bg-primary/5 transition-colors"
                >
                  {card.actionTitle}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          
          {/* Left: Message Form */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">
              Send us a message
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Fill out the form and our team will get back to you.
            </p>
            <form className="space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    required
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-bold text-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    placeholder="03XX XXXXXXX"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="orderNum" className="text-xs font-bold text-foreground">
                    Order Number (if any)
                  </label>
                  <input
                    id="orderNum"
                    type="text"
                    placeholder="e.g. VG123456"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="topic" className="text-xs font-bold text-foreground">
                  Topic <span className="text-destructive">*</span>
                </label>
                <select
                  id="topic"
                  required
                  defaultValue=""
                  className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="" disabled>Select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Information</option>
                  <option value="warranty">Warranty Claim</option>
                  <option value="bulk">Bulk Order</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold text-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full resize-y rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  Send Message
                </button>
                <span className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-2">
                   <Shield className="h-4 w-4" />
                   Your information is secure and never shared.
                </span>
              </div>
            </form>
          </div>

          {/* Right: Info Panels */}
          <div className="flex flex-col gap-6">
            {/* Support Information Box */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-foreground">Support Information</h3>
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="mt-0.5 shrink-0 rounded-full border bg-secondary/30 p-2 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Us</p>
                    <p className="text-sm font-semibold">{settings?.email || "support@voltgear.pk"}</p>
                  </div>
                  <Link href={`mailto:${settings?.email || "support@voltgear.pk"}`} className="shrink-0 rounded bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20">
                    Email Us
                  </Link>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="mt-0.5 shrink-0 rounded-full border bg-secondary/30 p-2 text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Call Us</p>
                    <p className="text-sm font-semibold">{settings?.phone || "0321-VOLTGEAR"}</p>
                  </div>
                  <Link href={`tel:${settings?.phone || "03218654327"}`} className="shrink-0 rounded border border-input bg-card px-3 py-1 text-xs font-bold text-foreground hover:bg-secondary">
                    Call Now
                  </Link>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="mt-0.5 shrink-0 rounded-full border bg-secondary/30 p-2 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Support Hours</p>
                    <div className="text-sm font-medium text-foreground/80">
                      <p>Mon - Sat: 10:00 AM - 8:00 PM</p>
                      <p>Sunday: 12:00 PM - 6:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0 rounded-full border bg-secondary/30 p-2 text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Average Response Time</p>
                    <p className="text-sm font-medium text-foreground/80 mt-1">
                      We usually respond within 15-30 minutes during hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="mt-0.5 shrink-0 rounded-full border bg-secondary/30 p-2 text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Our Office</p>
                    <div className="text-xs font-medium text-foreground/80 leading-relaxed max-w-[200px]">
                      VoltGear (Pvt.) Ltd.<br/>
                      {settings?.address || "Office #5, 2nd Floor, Tech Plaza, F-11 Markaz, Islamabad, Pakistan."}
                    </div>
                  </div>
                  <button className="shrink-0 text-xs font-bold text-primary hover:underline mt-4">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Help Box */}
            <div className="rounded-2xl border border-border/50 bg-[#F8FBFA] p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4 text-primary">
                 <Headphones className="h-5 w-5" />
                 <h3 className="text-sm font-bold">Quick Help</h3>
               </div>
               <div className="space-y-1">
                 {QUICK_HELP_LINKS.map((link) => (
                   <Link key={link} href="#" className="flex items-center justify-between rounded-lg px-2 py-2.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-primary/5 hover:text-primary group">
                     {link}
                     <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                   </Link>
                 ))}
               </div>
            </div>

            {/* Still Need Help Box */}
            <div className="rounded-2xl bg-[#F0F7F6] border border-primary/20 p-6 flex flex-col items-start gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Still need help?</h3>
                <p className="text-xs text-muted-foreground">
                  Our support team is here for you. Start a live chat and we&apos;ll assist you right away.
                </p>
              </div>
              <button className="w-full flex justify-center items-center gap-2 rounded-lg bg-primary py-3 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover">
                <MessageCircle className="h-4 w-4" /> Start Live Chat
              </button>
              <p className="text-[10px] text-muted-foreground text-center w-full">
                Typically replies in minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Promises Row */}
      <section className="border-y bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary">
                 <Clock4 className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">Fast Response</p>
                 <p className="hidden text-[10px] text-muted-foreground sm:block">We reply within 15-30 minutes</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary">
                 <RotateCcw className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">Hassle-Free Support</p>
                 <p className="hidden text-[10px] text-muted-foreground sm:block">Easy warranty & returns process</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary">
                 <ShieldCheck className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">Secure & Trusted</p>
                 <p className="hidden text-[10px] text-muted-foreground sm:block">Your data is safe with us</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border text-primary">
                 <MapPin className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-xs font-bold sm:text-sm">Nationwide Support</p>
                 <p className="hidden text-[10px] text-muted-foreground sm:block">Serving customers across Pakistan</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
             <p className="text-sm text-muted-foreground mt-1">Quick answers to common questions.</p>
           </div>
           <Link href="/faq" className="hidden sm:flex text-sm font-semibold text-primary items-center gap-1 hover:underline">
             View all FAQs <ChevronRight className="h-4 w-4" />
           </Link>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FAQS.map((faq, i) => (
            <Link key={i} href="#" className="flex flex-col items-start rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 group">
              <div className="mb-4 flex items-center gap-3 w-full justify-between">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/30 text-primary border">
                   <faq.icon className="h-5 w-5" />
                 </div>
                 <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h4 className="mb-2 text-sm font-bold text-foreground leading-tight">{faq.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.desc}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center sm:hidden">
            <Link href="/faq" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
             View all FAQs <ChevronRight className="h-4 w-4" />
           </Link>
        </div>
      </section>
    </div>
  );
}
