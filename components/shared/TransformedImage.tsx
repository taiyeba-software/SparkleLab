"use client"

import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
import { CldImage, getCldImageUrl } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { updateCredits } from '@/lib/actions/user.actions'

const TransformedImage = ({ image, type, title, transformationConfig, isTransforming, setIsTransforming, hasDownload = false, setTransformedImageUrl, userId }: TransformedImageProps) => {
  const [transformedImageUrl, setTransformedImageUrlState] = useState<string | null>(null);

  const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const urlToDownload = transformedImageUrl || getCldImageUrl({
      width: image?.width,
      height: image?.height,
      src: image?.publicId,
      ...transformationConfig
    });

    download(urlToDownload, title)
  }

  // Handle background removal transformation
  useEffect(() => {
    if (type === 'removeBackground' && image?.secureURL && transformationConfig?.removeBackground) {
      const removeBackground = async () => {
        try {
          setIsTransforming && setIsTransforming(true);
          const response = await fetch('/api/remove-bg', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: image.secureURL }),
          });

          if (!response.ok) {
            throw new Error('Failed to remove background');
          }

          const result = await response.json();
          setTransformedImageUrlState(result.url);
          setTransformedImageUrl && setTransformedImageUrl(result.url);
          
          // Deduct credits after successful background removal
          if (userId) {
            try {
              await updateCredits(userId, -1);
            } catch (error) {
              console.error('Failed to deduct credits for background removal:', error);
            }
          }
        } catch (error) {
          console.error('Background removal failed:', error);
        } finally {
          setIsTransforming && setIsTransforming(false);
        }
      };

      removeBackground();
    }
  }, [type, image?.secureURL, transformationConfig?.removeBackground, setIsTransforming, setTransformedImageUrl]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between">
        <h3 className="h3-bold text-dark-600">
          Transformed
        </h3>

        {hasDownload && (
          <button
            className="download-btn"
            onClick={downloadHandler}
          >
            <Image
              src="/assets/icons/download.svg"
              alt="Download"
              width={24}
              height={24}
              className="pb-[6px]"
            />
          </button>
        )}
      </div>

      {image?.publicId && transformationConfig ? (
        <div className="relative">
          {type === 'removeBackground' && transformedImageUrl ? (
            <Image
              width={getImageSize(type, image, "width")}
              height={getImageSize(type, image, "height")}
              src={transformedImageUrl}
              alt={image.title}
              className="transformed-image"
              onLoad={() => {
                setIsTransforming && setIsTransforming(false);
              }}
              onError={() => {
                debounce(() => {
                  setIsTransforming && setIsTransforming(false);
                }, 8000)()
              }}
            />
          ) : (
            <CldImage
              width={getImageSize(type, image, "width")}
              height={getImageSize(type, image, "height")}
              src={image?.publicId}
              alt={image.title}
              sizes={"(max-width: 767px) 100vw, 50vw"}
              placeholder={dataUrl as PlaceholderValue}
              className="transformed-image"
              onLoad={() => {
                setIsTransforming && setIsTransforming(false);
              }}
              onError={() => {
                debounce(() => {
                  setIsTransforming && setIsTransforming(false);
                }, 8000)()
              }}
              {...transformationConfig}
            />
          )}

          {isTransforming && (
            <div className="transforming-loader">
              <Image
                src="/assets/icons/spinner.svg"
                width={50}
                height={50}
                alt="spinner"
              />
              <p className="text-white/80">Please wait...</p>
            </div>
          )}
        </div>
      ): (
        <div className="transformed-placeholder">
          Transformed Image
        </div>
      )}
    </div>
  )
}

export default TransformedImage