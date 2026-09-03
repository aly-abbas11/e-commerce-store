"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, Tag, Copy, Check, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Show modal once per session
    const hasSeenModal = sessionStorage.getItem("vg_promo_modal_seen");
    if (!hasSeenModal) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleClose() {
    sessionStorage.setItem("vg_promo_modal_seen", "true");
    setIsOpen(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText("VOLT10");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      handleClose();
    }, 1500);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Visual */}
        <div className="bg-gradient-to-br from-[#1F3626] to-[#2A4833] p-6 text-white text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-400/30">
            <Gift className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            Exclusive Welcome Offer
          </span>
          <h2 className="text-xl font-bold tracking-tight">Get 10% OFF Your First Order!</h2>
          <p className="text-xs text-white/80 max-w-xs mx-auto">
            Use code <strong className="text-amber-300 font-mono">VOLT10</strong> at checkout for orders over Rs. 3,000.
          </p>
        </div>

        {/* Action Body */}
        <div className="p-6 space-y-4 text-center">
          <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 flex items-center justify-between">
            <div className="text-left">
              <div className="text-[10px] text-gray-500 font-semibold uppercase">PROMO CODE</div>
              <div className="text-lg font-bold text-[#1F3626] font-mono tracking-wider">VOLT10</div>
            </div>
            <Button
              onClick={handleCopy}
              className="bg-[#1F3626] hover:bg-[#2a4633] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleClose}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition underline block mx-auto"
          >
            No thanks, I&apos;ll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}
