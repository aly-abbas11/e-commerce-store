import { isDemoSession } from "@/lib/demo";

export function DemoBanner() {
  if (!isDemoSession()) return null;
  return (
    <div className="bg-amber-400 px-4 py-2 text-sm text-black">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <p>
          <strong>Demo account</strong> — catalog extras and orders you place are tagged demo and can be
          wiped in admin.
        </p>
        <form action="/api/demo/logout" method="post">
          <button type="submit" className="font-medium underline underline-offset-2">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
