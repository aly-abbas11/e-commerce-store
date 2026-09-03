"use client";

import { useEffect, useRef } from "react";

interface AdSenseUnitProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  responsive?: boolean;
  className?: string;
}

export function AdSenseUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdSenseUnitProps) {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
  const pushed = useRef(false);

  useEffect(() => {
    if (!pubId || pushed.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.warn("AdSense push error:", err);
    }
  }, [pubId]);

  if (!pubId) {
    // Hidden or neutral placeholder when AdSense Pub ID is not configured
    return null;
  }

  return (
    <div className={`adsense-wrapper my-6 overflow-hidden text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={pubId}
        data-ad-slot={slot || "1234567890"}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
