import { deleteUser, upsertUser } from "@/features/users/db"
import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  return new Response(null, { status: 204 })
  let event: any

  // 1) Verify signature
  try {
    event = await verifyWebhook(request)
  } catch (err) {
    console.error(" Clerk verifyWebhook failed:", err)
    return new Response("Invalid webhook signature", { status: 400 })
  }

  // 2) Process + write to DB
  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const clerkData = event.data

        const primaryEmail =
          clerkData.email_addresses?.find(
            (e: any) => e.id === clerkData.primary_email_address_id
          )?.email_address ?? null

        if (!primaryEmail) {
          console.error(" No primary email found in Clerk payload", clerkData)
          return new Response("No primary email found", { status: 400 })
        }

        const name =
          [clerkData.first_name, clerkData.last_name].filter(Boolean).join(" ") ||
          primaryEmail

        // IMPORTANT: avoid NOT NULL crashes if image_url is missing
        const imageUrl = clerkData.image_url ?? ""

        await upsertUser({
          id: clerkData.id,
          name,
          email: primaryEmail,
          imageUrl,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        })

        console.log(" Upserted user:", clerkData.id, primaryEmail)
        break
      }

      case "user.deleted": {
        if (!event.data?.id) {
          console.error(" No user id found for deletion", event.data)
          return new Response("No user ID found", { status: 400 })
        }

        await deleteUser(event.data.id)
        console.log(" Deleted user:", event.data.id)
        break
      }
    }

    return new Response("Webhook received", { status: 200 })
  } catch (err) {
    console.error(" Clerk webhook processing failed:", err)
    return new Response("Webhook processing failed", { status: 500 })
  }
}
