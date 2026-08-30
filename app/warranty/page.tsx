import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";


import { getSettings } from "@/lib/sanity/settings";
import {
  normalizeSettings,
  returnsLabel,
  warrantyLabel,
} from "@/lib/site-config";

export const metadata = {
  title: "Warranty & Returns",
  description: "VoltGear warranty and return policy details.",
};

export default async function WarrantyPage() {
  const settings = await getSettings().catch(() => null);
  const config = normalizeSettings(settings);
  const email = config.supportEmail;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 lg:px-8">
      <div className="text-center sm:text-left mb-12">
        <p className="text-[13px] font-bold uppercase tracking-widest text-primary">Support & Policies</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">Warranty & Returns</h1>
        <p className="mt-3 text-[15px] font-medium text-slate-500 max-w-xl leading-relaxed mx-auto sm:mx-0">
          Every VoltGear product comes with our commitment to quality. Here is our straightforward coverage policy to give you peace of mind.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {config.warrantyMonths ? (
          <div className="rounded-2xl border border-border/50 bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">{warrantyLabel(config.warrantyMonths)}</h2>
            <p className="mt-2 text-[14px] font-medium text-slate-500 leading-relaxed">
              Complete coverage against manufacturing defects and hardware failures for {config.warrantyMonths} months straight from the date of purchase.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
             <div className="w-14 h-14 rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Warranty Coverage</h2>
            <p className="mt-2 text-[14px] font-medium text-slate-500 leading-relaxed">
              Warranty terms are currently being finalized. Contact us with your order number and we&apos;ll take care of any issues immediately.
            </p>
          </div>
        )}
        
        {config.returnWindowDays ? (
          <div className="rounded-2xl border border-border/50 bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 rounded-[16px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
              <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">{returnsLabel(config.returnWindowDays)}</h2>
            <p className="mt-2 text-[14px] font-medium text-slate-500 leading-relaxed">
              Changed your mind? You can effortlessly return unused products within {config.returnWindowDays} days of delivery for a full refund.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="w-14 h-14 rounded-[16px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
              <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Returns</h2>
            <p className="mt-2 text-[14px] font-medium text-slate-500 leading-relaxed">
              Return terms are currently being finalized. Contact us with your order number and we&apos;ll process a swift resolution.
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 bg-white rounded-3xl border border-border/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
         <div className="p-8 md:p-12 border-b border-border/40">
           <h2 className="text-xl font-extrabold tracking-tight text-slate-900">How to Claim Warranty</h2>
           <ol className="mt-8 space-y-8">
             <li className="flex gap-5">
               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-[13px] font-bold text-primary">1</span>
               <div className="pt-1.5">
                 <h4 className="text-[15px] font-bold text-slate-800">Initiate Contact</h4>
                 <p className="text-[14px] font-medium text-slate-500 mt-1 leading-relaxed">
                   {email ? (
                     <>Send an email directly to <a href={`mailto:${email}`} className="text-primary hover:underline font-semibold">{email}</a> with your official order number.</>
                   ) : (
                     <>Visit our <a href="/contact" className="text-primary hover:underline font-semibold">contact page</a> and submit a ticket with your official order number.</>
                   )}
                 </p>
               </div>
             </li>
             <li className="flex gap-5">
               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-[13px] font-bold text-primary">2</span>
               <div className="pt-1.5">
                 <h4 className="text-[15px] font-bold text-slate-800">Detail the Issue</h4>
                 <p className="text-[14px] font-medium text-slate-500 mt-1 leading-relaxed">Describe the fault clearly. Attach high-resolution photos or a short video demonstrating the defect to radically speed up processing.</p>
               </div>
             </li>
             <li className="flex gap-5">
               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-[13px] font-bold text-primary">3</span>
               <div className="pt-1.5">
                 <h4 className="text-[15px] font-bold text-slate-800">Receive Resolution</h4>
                 <p className="text-[14px] font-medium text-slate-500 mt-1 leading-relaxed">We will rapidly review your claim via our technical team and arrange a hassle-free replacement or authorized repair.</p>
               </div>
             </li>
           </ol>
         </div>

         {config.returnWindowDays && (
           <div className="p-8 md:p-12 bg-slate-50/50">
             <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Return Policy Standards</h2>
             <ul className="mt-6 space-y-4">
               <li className="flex items-start gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                 <p className="text-[14px] font-medium text-slate-600 leading-relaxed">Products must be in their original packaging and strictly unused condition to qualify for processing.</p>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                 <p className="text-[14px] font-medium text-slate-600 leading-relaxed">Gift-wrapped orders receive a full complete refund, including the premium wrapping fee.</p>
               </li>
             </ul>
           </div>
         )}
      </div>

      <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Need further assistance?</h3>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Our customer support division is ready to assist you.</p>
          </div>
        </div>
        <a href={email ? `mailto:${email}` : "/contact"} className="whitespace-nowrap px-8 py-3.5 rounded-xl bg-white border border-primary/20 text-primary font-bold text-[14px] shadow-sm hover:shadow-md hover:border-primary/40 transition-all text-center">
           {email ? "Email Support Team" : "Contact Us"}
        </a>
      </div>
    </div>
  );
}