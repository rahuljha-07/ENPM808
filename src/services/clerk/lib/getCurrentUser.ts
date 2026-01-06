import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/dbCache"
import { upsertUser } from "@/features/users/db"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, redirectToSignIn } = await auth()

  return {
    userId,
    redirectToSignIn,
    user: allData && userId != null ? await getUser(userId) : undefined,
  }
}

export async function ensureUserFromClerk(userId: string) {
  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const email = clerkUser.emailAddresses.find(
      address => address.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (!email) return undefined

    const nameParts = [clerkUser.firstName, clerkUser.lastName].filter(Boolean)
    const name = nameParts.length > 0 ? nameParts.join(" ") : email
    const imageUrl = clerkUser.imageUrl ?? ""
    const createdAt = new Date(clerkUser.createdAt)
    const updatedAt = new Date(clerkUser.updatedAt)

    await upsertUser({
      id: clerkUser.id,
      email,
      name,
      imageUrl,
      createdAt,
      updatedAt,
    })

    return {
      id: clerkUser.id,
      email,
      name,
      imageUrl,
      createdAt,
      updatedAt,
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error
    console.error(
      "Failed to sync user from Clerk. The webhook may be failing.",
      error
    )
    return undefined
  }
}

async function getUser(id: string) {
  "use cache"
  cacheTag(getUserIdTag(id))

  try {
    return await db.query.UserTable.findFirst({
      where: eq(UserTable.id, id),
    })
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error
    console.error(
      "Failed to load user from the database. Ensure migrations are applied and the DB is reachable.",
      error
    )
    return undefined
  }
}
