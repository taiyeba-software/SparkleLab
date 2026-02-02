"use client";

import { useToast } from "@/components/ui/use-toast";
import { getImageSize } from "@/lib/utils";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React from "react";
import type { IImage } from "@/lib/database/models/image.model";
import { updateCredits } from "@/lib/actions/user.actions";

/* -------------------- TYPES -------------------- */

export type ImageState = {
  publicId: string;
  width: number;
  height: number;
  secureURL: string;
};

type MediaUploaderProps = {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<React.SetStateAction<IImage | null>>;
  publicId: string;
  image: IImage | null;
  type: string;
  userId?: string;
};

/* -------------------- COMPONENT -------------------- */

const MediaUploader = ({
  onValueChange,
  setImage,
  image,
  publicId,
  type,
  userId,
}: MediaUploaderProps) => {
  const { toast } = useToast();

  const onUploadSuccessHandler = async (result: unknown) => {
    const uploadResult = result as { info?: unknown };
    if (!uploadResult?.info || typeof uploadResult.info === 'string') return;
    const info = uploadResult.info as { public_id: string; width: number; height: number; secure_url: string };

    setImage((prevState) => ({
      ...prevState,
      publicId: info.public_id,
      width: info.width,
      height: info.height,
      secureURL: info.secure_url,
    } as IImage));

    onValueChange(info.public_id);

    // Deduct credits for upload
    if (userId) {
      try {
        await updateCredits(userId, -1);
      } catch (error) {
        console.error('Failed to deduct credits for upload:', error);
      }
    }

    toast({
      title: "Image uploaded successfully",
      description: "1 credit was deducted from your account",
      duration: 5000,
      className: "success-toast",
    });
  };

  const onUploadErrorHandler = () => {
    toast({
      title: "Something went wrong while uploading",
      description: "Please try again",
      duration: 5000,
      className: "error-toast",
    });
  };

  return (
    <CldUploadWidget
      uploadPreset="SparkleLab"
      options={{
        multiple: false,
        resourceType: "image",
      }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="h3-bold text-dark-600">Original</h3>

          {publicId ? (
            <div className="cursor-pointer overflow-hidden rounded-[10px]">
              <CldImage
                width={getImageSize(type, image, "width")}
                height={getImageSize(type, image, "height")}
                src={publicId}
                alt="uploaded image"
                sizes="(max-width: 767px) 100vw, 50vw"
                className="media-uploader_cldImage"
              />
            </div>
          ) : (
            <div className="media-uploader_cta" onClick={() => open()}>
              <div className="media-uploader_cta-image">
                <Image
                  src="/assets/icons/add.svg"
                  alt="Add Image"
                  width={24}
                  height={24}
                />
              </div>
              <p className="p-14-medium">Click here to upload image</p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUploader;

