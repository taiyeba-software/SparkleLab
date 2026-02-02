"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary';
import type { Query } from "mongoose";

// Use inline parameter types to avoid referencing global types that may not be picked up

const populateUser = <T>(query: Query<T, any>) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

// ADD IMAGE
export async function addImage({ image, userId, path }: { image: Record<string, unknown>; userId: string; path: string }) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    // Validate required fields before creating the document
    if (!image?.title || typeof image.title !== "string" || image.title.trim().length === 0) {
      throw new Error("Image title is required");
    }

    // normalize transformationURL -> transformationUrl to match schema
    const { transformationURL, ...rest } = image as unknown as Record<string, unknown>;
    const imagePayload: Record<string, unknown> = { ...rest, author: author._id };
    if (typeof transformationURL === "string") {
      imagePayload.transformationUrl = transformationURL;
    }

    const newImage = await Image.create(imagePayload as any);

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error: unknown) {
    handleError(error);
  }
}

// UPDATE IMAGE
export async function updateImage({ image, userId, path }: { image: Record<string, unknown> & { _id?: string }; userId: string; path: string }) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id as string);

    if (!imageToUpdate || typeof (imageToUpdate.author as any)?.toHexString !== 'function' || (imageToUpdate.author as any).toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const { transformationURL, ...rest } = image as unknown as Record<string, unknown>;
    const updatePayload: Record<string, unknown> = { ...rest };
    if (typeof transformationURL === "string") {
      updatePayload.transformationUrl = transformationURL;
    }

    const updatedImage = await Image.findByIdAndUpdate(imageToUpdate._id, updatePayload as any, { new: true });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error: unknown) {
    handleError(error);
  }
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

// GET IMAGE
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

// GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = "" }: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = "folder=imaginify";

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const execResult = await cloudinary.search.expression(expression).execute();
    const { resources } = (execResult as { resources?: { public_id: string }[] }) || { resources: [] };

    const resourceIds = (resources || []).map((resource) => resource.public_id);

    let query: Record<string, unknown> = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: resourceIds,
        },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query as Record<string, unknown>))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit as number);
    const totalImages = await Image.find(query as Record<string, unknown>).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / (limit as number)),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}

// GET IMAGES BY USER
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId } as Record<string, unknown>))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit as number);

    const totalImages = await Image.find({ author: userId } as Record<string, unknown>).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / (limit as number)),
    };
  } catch (error) {
    handleError(error);
  }
}