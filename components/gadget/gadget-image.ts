import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { imageUrl } from "@/lib/sanity/image";
import type { Product } from "@/lib/types";

export function gadgetImageSrc(
  product: Pick<Product, "images" | "cloudinaryImages">,
  w: number
): string | null {
  if (product.images?.[0]) {
    const src = imageUrl(product.images[0], { w });
    return src || null;
  }
  if (product.cloudinaryImages?.[0]) {
    const src = cloudinaryImageUrl(product.cloudinaryImages[0], { w });
    return src || null;
  }
  return null;
}
