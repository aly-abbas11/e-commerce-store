import { BadgeCheck, Banknote, RefreshCw, Truck } from "lucide-react";

export type TrustItem = {
  key: string;
  title: string;
  detail: string;
  icon: "cod" | "shipping" | "returns" | "curated";
};

const ICONS = {
  cod: Banknote,
  shipping: Truck,
  returns: RefreshCw,
  curated: BadgeCheck,
} as const;

export function GadgetTrustStrip({
  items,
  headline = "Exceptional Quality",
  accent = "Delivered",
}: {
  items: TrustItem[];
  headline?: string;
  accent?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section
      className="px-3 pb-5 pt-1 sm:px-4 sm:pb-6 lg:px-8"
      aria-label="Why shop with us"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.85rem] border border-[var(--g-line)] bg-[var(--g-white)] shadow-[0_14px_40px_rgba(31,54,38,0.07)] sm:rounded-full">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[var(--g-forest)] via-[var(--g-sage)] to-[var(--g-forest)] sm:w-2"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--g-sage)_35%,transparent),transparent_70%)]"
          aria-hidden
        />

        <div className="relative flex flex-col items-stretch gap-5 px-6 py-6 pl-7 sm:gap-6 sm:px-9 sm:py-5 md:flex-row md:items-center md:justify-between md:gap-8 md:px-11 md:py-5 lg:gap-10 lg:px-12">
          <h2 className="gadget-display shrink-0 text-center text-[1.35rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--g-charcoal)] sm:text-[1.5rem] md:max-w-[12ch] md:text-left lg:max-w-[13ch] lg:text-[1.65rem]">
            {headline}{" "}
            <span className="relative inline-block text-[var(--g-forest)]">
              {accent}
              <span
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[var(--g-sage)] to-transparent opacity-80"
                aria-hidden
              />
            </span>
          </h2>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-0 sm:gap-y-3 md:flex-nowrap md:justify-end">
            {items.map((item, i) => {
              const Icon = ICONS[item.icon];
              return (
                <li
                  key={item.key}
                  className={`group flex min-w-0 items-center gap-2.5 sm:min-w-[9.25rem] sm:px-3 lg:min-w-0 lg:px-4 xl:px-5 ${
                    i > 0 ? "sm:border-l sm:border-[var(--g-line)]" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] bg-[var(--g-cream-deep)] text-[var(--g-forest)] ring-1 ring-[var(--g-line)] transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-[var(--g-forest)] group-hover:text-[var(--g-cream)] group-hover:shadow-[0_10px_20px_rgba(31,54,38,0.18)] sm:h-11 sm:w-11">
                    <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="min-w-0 text-left leading-[1.25]">
                    <span className="block text-[12px] font-semibold tracking-tight text-[var(--g-charcoal)] sm:text-[13px]">
                      {item.title}
                    </span>
                    <span className="block text-[11px] text-[var(--g-taupe)] sm:text-[12px]">
                      {item.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
