/*
import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants'
import { getOrCreateUser } from '@/lib/actions/user.actions';
import { auth, currentUser } from "@clerk/nextjs/server";

import { redirect } from 'next/navigation';

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  const { userId } = await auth();
  const transformation = transformationTypes[type];

  if(!userId) redirect('/sign-in')

  const clerkUser = await currentUser();
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
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationTypePage
*/

import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm'
import { transformationTypes } from '@/constants'
import { getOrCreateUser } from '@/lib/actions/user.actions'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const AddTransformationTypePage = async ({
  params: { type },
}: SearchParamProps) => {

  // 1️⃣ Auth check
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // 2️⃣ Get Clerk user
  const clerkUser = await currentUser()

  // 3️⃣ IMPORTANT: Guard against null (fixes your build error)
  if (!clerkUser) redirect('/sign-in')

  // 4️⃣ Get or create DB user
  const user = await getOrCreateUser(clerkUser)

  const transformation = transformationTypes[type]

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationTypePage
