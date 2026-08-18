import { createClient } from "@sanity/client";

let writeClient: ReturnType<typeof createClient> | null = null;

/**
 * Server-only Sanity write client. Requires SANITY_API_TOKEN (write access).
 * Returns null when Sanity is not configured so callers can degrade gracefully.
 */
export function getWriteClient() {
  const projectId =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId || !token) return null;

  if (!writeClient) {
    writeClient = createClient({
      projectId,
      dataset:
        process.env.NEXT_PUBLIC_SANITY_DATASET ||
        process.env.SANITY_DATASET ||
        "production",
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
      token,
      useCdn: false,
      fetch: { cache: "no-store" },
    });
  }
  return writeClient;
}
