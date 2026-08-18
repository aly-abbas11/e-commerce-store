"use client";

import { useEffect, useState } from "react";

export interface PublicSiteConfig {
  brandName: string;
  freeShippingThreshold: number;
  shippingFee: number;
  returnPolicy: string;
  warrantyInfo: string;
  currency: string;
  email: string;
}

const FALLBACK: PublicSiteConfig = {
  brandName: "VoltGear",
  freeShippingThreshold: 5000,
  shippingFee: 199,
  returnPolicy: "Free returns within 7 days — no questions asked.",
  warrantyInfo: "2-year warranty included.",
  currency: "PKR",
  email: "",
};

let cached: PublicSiteConfig | null = null;

/**
 * Loads public site config once per session (fetch is cached server-side too).
 */
export function useSiteConfig(): PublicSiteConfig {
  const [config, setConfig] = useState<PublicSiteConfig>(cached ?? FALLBACK);

  useEffect(() => {
    if (cached) return;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicSiteConfig | null) => {
        if (data) {
          cached = data;
          setConfig(data);
        }
      })
      .catch(() => {
        // fall back to defaults
      });
  }, []);

  return config;
}
