"use client";

import React, { useState } from "react";
import { Sparkles, Tag, Copy, Check } from "lucide-react";

export function StorefrontAnnouncementBar() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("VOLT10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gradient-to-r from-[#1F3626] via-[#2A4833] to-[#1F3626] text-white py-2 px-3 text-xs font-medium border-b border-amber-500/30 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-center">
        {/* Flash Sale Banner */}
        <div className="flex items-center gap-1.5 shrink-0 mx-auto sm:mx-0">
          <span className="bg-amber-400 text-black text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
            ⚡ SALE
          </span>
          <span className="text-amber-200 font-semibold text-[11px] sm:text-xs truncate max-w-[200px] xs:max-w-[280px] sm:max-w-md">
            Blessed Friday: Up to 25% OFF!
          </span>
        </div>

        {/* Promo Code & Bank Deals Pill */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            <Tag className="h-3 w-3 text-amber-400" />
            <span className="text-[11px]">Use Code: <strong className="text-amber-300 font-mono">VOLT10</strong></span>
            <button
              type="button"
              onClick={handleCopy}
              className="ml-1 text-amber-300 hover:text-white transition"
              title="Copy Coupon Code"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          <span className="hidden lg:inline text-white/40">|</span>

          <span className="hidden lg:inline text-emerald-300 font-bold text-[11px]">
            💳 10% OFF EasyPaisa & 15% OFF HBL Cards
          </span>
        </div>
      </div>
    </div>
  );
}
