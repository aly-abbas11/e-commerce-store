import { CLOUDINARY_CLOUD_NAME } from "@/lib/cloudinary";
import { videoEmbedSrc, videoKind } from "@/lib/gadget-preview";
import { imageUrl } from "@/lib/sanity/image";
import type { Product } from "@/lib/types";

function fileSrc(product: Product): string | null {
  const v = product.productVideo;
  if (!v) return null;
  if (v.cloudinaryPublicId?.trim() && CLOUDINARY_CLOUD_NAME) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${v.cloudinaryPublicId
      .trim()
      .replace(/^\/+/, "")}`;
  }
  if (v.url?.trim() && /^https?:\/\//i.test(v.url.trim())) return v.url.trim();
  return null;
}

export function GadgetVideo({ product }: { product: Product }) {
  const kind = videoKind(product.productVideo?.url, product.productVideo?.cloudinaryPublicId);
  if (kind === "none") return null;

  if (kind === "instagram" || kind === "tiktok") {
    const src = videoEmbedSrc(kind, product.productVideo?.url ?? "");
    if (!src) return null;
    return (
      <section className="mt-12" aria-labelledby="gadget-video">
        <h2 id="gadget-video" className="text-xl font-black uppercase tracking-tight">
          See it
        </h2>
        <div className="mt-4 overflow-hidden rounded-sm bg-zinc-100">
          <iframe
            title={`${product.name} video`}
            src={src}
            className="aspect-[9/16] w-full max-h-[640px] sm:aspect-video sm:max-h-none"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    );
  }

  const src = fileSrc(product);
  if (!src) return null;
  const poster = product.productVideo?.poster;

  return (
    <section className="mt-12" aria-labelledby="gadget-video">
      <h2 id="gadget-video" className="text-xl font-black uppercase tracking-tight">
        See it
      </h2>
      <video
        controls
        preload="none"
        playsInline
        poster={poster ? imageUrl(poster, { w: 1200 }) : undefined}
        className="mt-4 aspect-video w-full rounded-sm bg-zinc-100"
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}
