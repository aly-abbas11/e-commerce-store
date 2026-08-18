import { AtSign, Music2, Play } from "lucide-react";

/**
 * Placeholder "As seen on Instagram/TikTok" strip. Each tile is a slot for a
 * real UGC clip — replace with embedded reels/videos later.
 */
const UGC_SLOTS = [
  { handle: "@voltgear", tint: "from-pink-500/25" },
  { handle: "@techwithsam", tint: "from-sky-500/25" },
  { handle: "@dailydrops", tint: "from-violet-500/25" },
  { handle: "@gearlab", tint: "from-emerald-500/25" },
  { handle: "@shopwithava", tint: "from-amber-500/25" },
  { handle: "@poweruser", tint: "from-rose-500/25" },
];

export function UgcStrip() {
  return (
    <section className="container mx-auto px-4 pb-16 lg:px-8">
      <div className="rounded-2xl border bg-gradient-to-r from-pink-500/10 via-background to-sky-500/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <AtSign className="h-5 w-5 text-pink-500" aria-hidden />
            As seen on
            <span className="flex items-center gap-1.5">
              Instagram
              <Music2 className="h-5 w-5 text-cyan-500" aria-hidden />
              TikTok
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Real customers, real unboxings — clips coming soon
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {UGC_SLOTS.map((slot) => (
            <div
              key={slot.handle}
              className={`group relative aspect-square overflow-hidden rounded-xl border bg-gradient-to-br ${slot.tint} to-background`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/80 shadow-sm transition-transform group-hover:scale-110">
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                </span>
              </div>
              <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-muted-foreground">
                {slot.handle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
