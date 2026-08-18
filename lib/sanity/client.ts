import { createClient, type ClientConfig, type QueryParams, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

let client: SanityClient | null = null;

function getClientInstance(): SanityClient {
  if (!client) {
    const config: ClientConfig = {
      projectId: projectId || "",
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production",
      perspective: "published",
      fetch: { cache: "no-store" },
    };
    client = createClient(config);
  }
  return client;
}

export async function fetchFromSanity<T>(
  query: string,
  params?: QueryParams
): Promise<T> {
  if (!projectId) {
    throw new Error("Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID.");
  }
  return getClientInstance().fetch<T>(
    query,
    params as QueryParams
  );
}

const builder = createImageUrlBuilder({
  projectId: projectId || "unconfigured",
  dataset,
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
