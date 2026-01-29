import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

interface ResizeRequestBody {
  imageUrl: string;
  mode: 'resize' | 'crop';
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageUrl, mode, width, height, left, top } = (await req.json()) as ResizeRequestBody;

    if (!imageUrl || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, mode" },
        { status: 400 }
      );
    }

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: 400 }
      );
    }

    const buffer = await response.arrayBuffer();
    let processedBuffer: Buffer;

    // Apply Sharp transformation based on mode
    if (mode === 'resize') {
      if (!width || !height) {
        return NextResponse.json(
          { error: "Resize mode requires width and height" },
          { status: 400 }
        );
      }
      processedBuffer = await sharp(Buffer.from(buffer))
        .resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toBuffer();
    } else if (mode === 'crop') {
      if (left === undefined || top === undefined || !width || !height) {
        return NextResponse.json(
          { error: "Crop mode requires left, top, width, and height" },
          { status: 400 }
        );
      }
      processedBuffer = await sharp(Buffer.from(buffer))
        .extract({ left, top, width, height })
        .toBuffer();
    } else {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'resize' or 'crop'" },
        { status: 400 }
      );
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    // Upload to Cloudinary
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `imaginify/${mode}`,
          public_id: `${mode}-${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed: no result returned'));
        }
      ).end(processedBuffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.error('Resize API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
