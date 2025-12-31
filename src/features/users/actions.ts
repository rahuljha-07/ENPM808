"use server"

import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getUserIdTag } from "./dbCache"
import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function getUser(id: string) {
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
