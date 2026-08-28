export function isGadgetPreviewPath(pathname: string): boolean {
  return (
    pathname === "/home2" ||
    pathname.startsWith("/home2/") ||
    pathname === "/product2" ||
    pathname.startsWith("/product2/")
  );
}

export function product2Href(slug: string): string {
  return `/product2/${slug}`;
}

export type GadgetVideoKind = "none" | "file" | "instagram" | "tiktok";

export function videoKind(
  url?: string | null,
  cloudinaryPublicId?: string | null
): GadgetVideoKind {
  if (cloudinaryPublicId?.trim()) return "file";
  const raw = url?.trim() ?? "";
  if (!raw) return "none";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  } catch {
    return "none";
  }
  if (/^https?:\/\//i.test(raw)) return "file";
  return "none";
}

export function videoEmbedSrc(kind: GadgetVideoKind, url: string): string | null {
  if (kind !== "instagram" && kind !== "tiktok") return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const path = parsed.pathname.replace(/\/$/, "");
  if (kind === "instagram") {
    return `${parsed.origin}${path}/embed`;
  }
  return `https://www.tiktok.com/embed${path}`;
}
