// app/api/remove-bg/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from 'cloudinary'

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl } = await req.json();

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": process.env.REMOVE_BG_API_KEY!,
    },
    body: new URLSearchParams({
      image_url: imageUrl,
      size: "auto",
    }),
  });

  if (!response.ok) {
    throw new Error(`Remove.bg API error: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();

  // Upload the processed image to Cloudinary
  const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'imaginify/removed-bg',
        public_id: `removed-bg-${Date.now()}`,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error('Upload failed: no result returned'));
      }
    ).end(Buffer.from(buffer));
  });

  return NextResponse.json({
    success: true,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  });
}
