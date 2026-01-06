"use client"

import { getUser, syncUserFromClerk } from "@/features/users/actions"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined
    let cancelled = false

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const user = await getUser(userId)
        if (user == null || cancelled) return

        router.replace("/app")
        if (intervalId) clearInterval(intervalId)
      }, 250)
    }

    const syncAndRedirect = async () => {
      try {
        const syncedUser = await syncUserFromClerk(userId)
        if (cancelled) return
        if (syncedUser != null) {
          router.replace("/app")
          return
        }
      } catch {
        if (cancelled) return
      }

      startPolling()
    }

    syncAndRedirect()

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [userId, router])

  return <Loader2Icon className="animate-spin size-24" />
}