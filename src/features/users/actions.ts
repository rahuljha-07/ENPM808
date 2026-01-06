"use server"

import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { ensureUserFromClerk } from "@/services/clerk/lib/getCurrentUser"
import { eq } from "drizzle-orm"

export async function getUser(id: string) {
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

export async function syncUserFromClerk(userId: string) {
  return ensureUserFromClerk(userId)
}