"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  creditFee,
  defaultValues,
  transformationTypes,
} from "@/constants";

import { CustomField } from "./CustomField";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

import { deepMergeObjects } from "@/lib/utils";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { IImage, TransformationTypeKey } from "@/types";

/* -------------------------------------------------------------------------- */
/* FORM SCHEMA                                                                  */
/* -------------------------------------------------------------------------- */

export const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

/* -------------------------------------------------------------------------- */
/* TYPES                                                                        */
/* -------------------------------------------------------------------------- */

interface TransformationFormProps {
  action: "Add" | "Update";
  data?: IImage | null;
  userId: string;
  type: TransformationTypeKey;
  creditBalance: number;
  config?: Record<string, unknown> | null;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                    */
/* -------------------------------------------------------------------------- */

const TransformationForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) => {
  const router = useRouter();
  const transformationType = transformationTypes[type];

  const [image, setImage] = useState<IImage | null>(data);
  const [newTransformation, setNewTransformation] =
    useState<Record<string, unknown> | null>(null);
  const [transformationConfig, setTransformationConfig] =
    useState<Record<string, unknown> | null>(config);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformedImageUrl, setTransformedImageUrl] =
    useState<string | null>(null);

  const [, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      data && action === "Update"
        ? {
            title: data.title,
            aspectRatio: data.aspectRatio,
            color: data.color,
            prompt: data.prompt,
            publicId: data.publicId,
          }
        : defaultValues,
  });

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                    */
  /* ------------------------------------------------------------------------ */

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!image) return;

    setIsSubmitting(true);

    try {
      const transformationUrl =
        type === "removeBackground" && transformedImageUrl
          ? transformedImageUrl
          : getCldImageUrl({
              src: image.publicId,
              width: image.width,
              height: image.height,
              ...(transformationConfig ?? {}),
            });

      const payload = {
        title: values.title,
        publicId: image.publicId,
        transformationType: type,
        width: image.width,
        height: image.height,
        config: transformationConfig,
        secureURL: image.secureURL,
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      };

      if (action === "Add") {
        const created = await addImage({
          image: payload,
          userId,
          path: "/",
        });

        if (created) {
          form.reset();
          router.push(`/transformations/${created._id}`);
        }
      }

      if (action === "Update" && data?._id) {
        const updated = await updateImage({
          image: {
            ...payload,
            _id: String(data._id),
          },
          userId,
          path: `/transformations/${String(data._id)}`,
        });

        if (updated) {
          router.push(`/transformations/${updated._id}`);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* TRANSFORMATION LOGIC                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!image) return;

    if (type === "restore" || type === "removeBackground") {
      setNewTransformation(transformationType.config);
    }

    if (type === "resize") {
      const { width, height } = form.getValues();
      if (width && height) {
        setNewTransformation({ resize: { width, height } });
      }
    }
  }, [image, type, transformationType.config, form]);

  const onTransformHandler = () => {
    if (!newTransformation) return;

    setIsTransforming(true);
    setTransformationConfig((prev) =>
      deepMergeObjects(newTransformation, prev ?? {})
    );

    setNewTransformation(null);
    startTransition(() => {});
  };

  /* ------------------------------------------------------------------------ */
  /* JSX                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && (
          <InsufficientCreditsModal />
        )}

        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          render={({ field }) => <Input {...field} />}
        />

        {type === "resize" && (
          <div className="grid grid-cols-2 gap-4">
            <CustomField
              control={form.control}
              name="width"
              formLabel="Width"
              render={({ field }) => (
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value) || undefined)
                  }
                />
              )}
            />
            <CustomField
              control={form.control}
              name="height"
              formLabel="Height"
              render={({ field }) => (
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value) || undefined)
                  }
                />
              )}
            />
          </div>
        )}

        {/* publicId is always passed as a string */}
        {/* <CustomField
          control={form.control}
          name="publicId"
          render={({ field }) => (
            <MediaUploader
              onValueChange={field.onChange}
              setImage={setImage}
              publicId={field.value ?? ""}
              image={image}
              type={type}
              userId={userId}
            />
          )}
        /> */}

        <div className="media-uploader-field">
          <CustomField
            control={form.control}
            name="publicId"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={String(field.value ?? "")}
                image={image}
                type={type}
                userId={userId}
              />
            )}
          />

          <TransformedImage
            image={image}
            type={type}
            title={form.getValues().title}
            transformationConfig={transformationConfig}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            setTransformedImageUrl={setTransformedImageUrl}
            userId={userId}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={isTransforming || !newTransformation}
            onClick={onTransformHandler}
          >
            Apply Transformation
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            Save Image
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;
