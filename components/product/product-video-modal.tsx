"use client";

import React, { useState } from "react";
import { Play, X, Video, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductVideoModalProps {
  videoUrl?: string;
  productName: string;
}

export function ProductVideoModal({ videoUrl, productName }: ProductVideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
      >
        <Play className="h-3.5 w-3.5 fill-current" />
        <span>Watch Demo Video (TikTok / Reels)</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Title */}
            <div className="p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 inset-x-0 z-0 text-white space-y-0.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> VoltGear Verified Demo
              </span>
              <h3 className="text-sm font-bold truncate max-w-[220px]">{productName}</h3>
            </div>

            {/* Video Container */}
            <div className="relative aspect-[9/16] w-full bg-neutral-900 flex items-center justify-center">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="p-6 text-center space-y-3 text-white">
                  <div className="h-16 w-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                    <Video className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-base">Watch Live Hands-On Reel</h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Check out unboxing & charging speed test on our official Instagram & TikTok channel.
                  </p>
                  <Button
                    onClick={() => window.open("https://instagram.com", "_blank")}
                    className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 mx-auto"
                  >
                    <span>Open Instagram Reel</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
