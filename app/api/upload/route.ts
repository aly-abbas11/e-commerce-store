import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_FOLDER,
} from "@/lib/cloudinary";

function isConfigured(value: string | undefined): boolean {
  return !!value && !value.startsWith("your-");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (
      !isConfigured(CLOUDINARY_CLOUD_NAME) ||
      !isConfigured(CLOUDINARY_API_KEY) ||
      !isConfigured(CLOUDINARY_API_SECRET)
    ) {
      return NextResponse.json(
        { error: "Cloudinary credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder =
      (formData.get("folder") as string) || CLOUDINARY_FOLDER;
    const removeBackground = formData.get("removeBackground") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Send the image as the 'file' field." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/png";
    const base64 = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: "image",
      ...(removeBackground
        ? {
            background_removal: "cloudinary_ai",
          }
        : {}),
      transformation: {
        quality: "auto",
        fetch_format: "auto",
      },
    });

    return NextResponse.json({
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      backgroundRemoved: removeBackground,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed. Please check the file and try again." },
      { status: 500 }
    );
  }
}
