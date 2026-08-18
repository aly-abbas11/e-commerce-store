"use client";

import { useEffect, useState } from "react";

interface UrgencyTickerProps {
  message?: string;
  endDate?: string;
  endTime?: string;
  className?: string;
}

function getTimeRemaining(endDate: string, endTime: string) {
  const now = new Date();
  const end = new Date(`${endDate}T${endTime || "23:59:59"}`);
  const diff = Math.max(0, end.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function UrgencyTicker({
  message = "LIMITED STOCK LEFT!",
  endDate = "2026-08-31",
  endTime = "23:59:59",
  className = "",
}: UrgencyTickerProps) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => setTime(getTimeRemaining(endDate, endTime));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate, endTime]);

  return (
    <div
      className={`relative overflow-hidden bg-emerald-900 text-white ${className}`}
      role="region"
      aria-label="Urgency announcement"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes ticker-scroll-reduced {
  0% { transform: translateX(0); }
  100% { transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: ticker-scroll-reduced 0s linear !important; }
}
`,
        }}
      />
      <div
        className="ticker-track flex whitespace-nowrap py-2.5"
        style={{
          animation: "ticker-scroll 30s linear infinite",
          width: "max-content",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-6" aria-hidden={i > 1}>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              {message}
            </span>
            <span className="text-emerald-500">•</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              ENDS IN
            </span>
            <span className="flex items-center gap-1">
              <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums">
                {String(time.days).padStart(2, "0")}
              </span>
              <span className="text-emerald-300">d</span>
              <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums">
                {String(time.hours).padStart(2, "0")}
              </span>
              <span className="text-emerald-300">h</span>
              <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums">
                {String(time.minutes).padStart(2, "0")}
              </span>
              <span className="text-emerald-300">m</span>
              <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums">
                {String(time.seconds).padStart(2, "0")}
              </span>
              <span className="text-emerald-300">s</span>
            </span>
            <span className="text-emerald-500">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
