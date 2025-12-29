

import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import {
  createUser,
  deleteUser,
  updateUser,
} from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Missing WEBHOOK_SECRET in environment variables"
    );
  }

  // ---- Get Svix headers ----
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing Svix headers", { status: 400 });
  }

  // ---- Read body ----
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // ---- Verify webhook ----
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;

  // =========================
  // CREATE USER
  // =========================
  if (eventType === "user.created") {
    const {
      id,
      email_addresses,
      image_url,
      first_name,
      last_name,
      username,
    } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0]?.email_address ?? "",
      username: username ?? `user_${id.slice(0, 6)}`,
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      photo: image_url ?? "",
    };

    const newUser = await createUser(user);

    const client = await clerkClient();

    if (newUser) {
  
     
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id.toString(),
        },
      })
    }

    return NextResponse.json({ success: true });
  }

  // =========================
  // UPDATE USER
  // =========================
  if (eventType === "user.updated") {
    const {
      id,
      image_url,
      first_name,
      last_name,
      username,
    } = evt.data;

    const user = {
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      username: username ?? "",
      photo: image_url ?? "",
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ success: true });
  }

  // =========================
  // DELETE USER
  // =========================
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new NextResponse("Missing user id", { status: 400 });
    }

    await deleteUser(id);
    return NextResponse.json({ success: true });
  }

  return new NextResponse("Unhandled event", { status: 200 });
}
