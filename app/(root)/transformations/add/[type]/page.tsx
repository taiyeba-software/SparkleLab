
import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getOrCreateUser } from "@/lib/actions/user.actions";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { SearchParamProps } from "@/types";
import type { TransformationTypeKey } from "@/types";

const AddTransformationTypePage = async ({ params }: SearchParamProps) => {
  const { type } = await params;

  // ✅ Validate type early
  if (!Object.keys(transformationTypes).includes(type)) {
    redirect("/");
  }

  const transformationKey = type as TransformationTypeKey;
  const transformation = transformationTypes[transformationKey];

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await getOrCreateUser(clerkUser);

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={String(user._id)}
          type={transformationKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
