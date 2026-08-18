import { revalidatePath } from "next/cache";

import { isAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";

const DEFAULT_PATHS = [
  "/",
  "/products",
  "/blog",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/shipping-returns",
  "/faq",
];

/**
 * On-demand ISR revalidation.
 * Call after publishing in Sanity to refresh the storefront immediately:
 *   curl -X POST http://localhost:3001/api/revalidate \
 *     -H "Authorization: Bearer <REVALIDATION_TOKEN>"
 * Or revalidate a single path:
 *   curl -X POST http://localhost:3001/api/revalidate \
 *     -H "Authorization: Bearer <REVALIDATION_TOKEN>" \
 *     -H "Content-Type: application/json" -d '{"path":"/product/voltgear-pro-s2"}'
 * Or a batch of paths: {"paths":["/","/products"]}
 */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let paths: string[] = [];
    const body = await request.json().catch(() => null);
    if (body?.path && typeof body.path === "string") paths.push(body.path);
    else if (Array.isArray(body?.paths)) paths = body.paths.filter((p: unknown) => typeof p === "string");
    else paths = DEFAULT_PATHS;

    for (const path of paths) revalidatePath(path);

    return Response.json({ revalidated: true, paths, now: Date.now() });
  } catch (err) {
    return Response.json(
      { revalidated: false, error: err instanceof Error ? err.message : "Failed to revalidate" },
      { status: 500 }
    );
  }
}
