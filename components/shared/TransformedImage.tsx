"use client";

import Image from "next/image";
import { CldImage, getCldImageUrl } from "next-cloudinary";
import { useEffect, useState } from "react";

import { debounce, download, getImageSize } from "@/lib/utils";
import { updateCredits } from "@/lib/actions/user.actions";

import type { TransformedImageProps } from "@/types";
import type { IImage } from "@/lib/database/models/image.model";

const TransformedImage = ({
  image,
  type,
  title,
  transformationConfig,
  isTransforming,
  setIsTransforming,
  hasDownload = false,
  setTransformedImageUrl,
  userId,
}: TransformedImageProps) => {
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);

  const downloadHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const url =
      bgRemovedUrl ||
      getCldImageUrl({
        src: image!.publicId,
        width: image!.width,
        height: image!.height,
        ...transformationConfig,
      });

    download(url, title);
  };

  /* ---------------- REMOVE BG ---------------- */

  useEffect(() => {
    if (
      type !== "removeBackground" ||
      !image?.secureURL ||
      !transformationConfig?.removeBackground
    ) {
      return;
    }

    const run = async () => {
      try {
        setIsTransforming?.(true);

        const res = await fetch("/api/remove-bg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: image.secureURL }),
        });

        if (!res.ok) throw new Error("BG removal failed");

        const { url } = await res.json();
        setBgRemovedUrl(url);
        setTransformedImageUrl?.(url);

        if (userId) {
          await updateCredits(userId, -1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsTransforming?.(false);
      }
    };

    run();
  }, [type, image?.secureURL, transformationConfig?.removeBackground, userId, setIsTransforming, setTransformedImageUrl]);

  /* ---------------- RENDER ---------------- */

  if (!image?.publicId || !transformationConfig) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex-between">
          <h3 className="h3-bold text-dark-600">Transformed</h3>
        </div>

        <div className="transformed-placeholder">Transformed Image</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between">
        <h3 className="h3-bold text-dark-600">Transformed</h3>

        {hasDownload && (
          <button className="download-btn" onClick={downloadHandler}>
            <Image
              src="/assets/icons/download.svg"
              alt="Download"
              width={24}
              height={24}
            />
          </button>
        )}
      </div>

      <div className="relative">
        {type === "removeBackground" && bgRemovedUrl ? (
          <Image
            src={bgRemovedUrl}
            alt={title}
            width={getImageSize(type, image, "width")}
            height={getImageSize(type, image, "height")}
            className="transformed-image"
          />
        ) : (
          <CldImage
            src={image.publicId}
            alt={title}
            width={getImageSize(type, image, "width")}
            height={getImageSize(type, image, "height")}
            className="transformed-image"
            {...transformationConfig}
            onLoad={async () => {
              setIsTransforming?.(false);
              if (userId && type !== "removeBackground") {
                await updateCredits(userId, -1);
              }
            }}
            onError={() =>
              debounce(() => setIsTransforming?.(false), 8000)()
            }
          />
        )}

        {isTransforming && (
          <div className="transforming-loader">
            <Image
              src="/assets/icons/spinner.svg"
              alt="spinner"
              width={50}
              height={50}
            />
            <p className="text-white/80">Please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransformedImage;
