"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function GadgetSearchInput({
  id,
  name = "q",
  placeholder = "Search chargers, earbuds, watches…",
  className,
  size = "md",
  showSubmit = false,
}: {
  id: string;
  name?: string;
  placeholder?: string;
  className?: string;
  size?: "md" | "lg";
  showSubmit?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const tall = size === "lg";

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-full border bg-[var(--g-white)]/90 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        tall ? "h-12 sm:h-[3.15rem]" : "h-11",
        focused
          ? "border-[var(--g-forest)]/35 shadow-[0_0_0_4px_rgba(31,54,38,0.08),0_10px_28px_rgba(31,54,38,0.08)]"
          : "border-[var(--g-line)] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] hover:border-[var(--g-forest)]/20",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-3 flex items-center justify-center rounded-full transition duration-300",
          tall ? "left-3.5 h-8 w-8 sm:left-4" : "h-7 w-7",
          focused
            ? "bg-[var(--g-forest)] text-[var(--g-white)]"
            : "bg-[var(--g-cream-deep)] text-[var(--g-forest)]"
        )}
        aria-hidden
      >
        <Search className={tall ? "h-3.5 w-3.5" : "h-3.5 w-3.5"} strokeWidth={2} />
      </span>
      <input
        id={id}
        name={name}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "h-full w-full bg-transparent text-base text-[var(--g-charcoal)] outline-none placeholder:text-[var(--g-taupe)]/85",
          tall ? "pl-[3.35rem] sm:pl-14" : "pl-11",
          showSubmit ? "pr-20 sm:pr-24" : "pr-4"
        )}
      />
      {showSubmit ? (
        <button
          type="submit"
          className="gadget-press absolute right-1.5 hidden h-9 items-center rounded-full bg-gradient-to-b from-[#2a4633] to-[var(--g-forest)] px-3.5 text-[12px] font-semibold text-[var(--g-white)] shadow-[0_6px_16px_rgba(31,54,38,0.22)] transition hover:brightness-110 sm:right-2 sm:inline-flex"
        >
          Search
        </button>
      ) : null}
    </div>
  );
}
