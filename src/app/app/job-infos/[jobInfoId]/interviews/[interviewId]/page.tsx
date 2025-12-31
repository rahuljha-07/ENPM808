import { BackLink } from "@/components/BackLink"
import { Skeleton, SkeletonButton } from "@/components/Skeleton"
import { SuspendedItem } from "@/components/SuspendedItem"
import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import { InterviewTable } from "@/drizzle/schema"
import { getInterviewIdTag } from "@/features/interviews/dbCache"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { formatDateTime } from "@/lib/formatters"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Loader2Icon } from "lucide-react"
import { Suspense } from "react"
import { CondensedMessages } from "@/services/hume/components/CondensedMessages"
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages"
import { fetchChatMessages } from "@/services/hume/lib/api"
import { ActionButton } from "@/components/ui/action-button"
import { generateInterviewFeedback } from "@/features/interviews/actions"
import { Card, CardContent } from "@/components/ui/card"

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; interviewId: string }>
}) {
  const { jobInfoId, interviewId } = await params

  const interview = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn()

      const interview = await getInterview(interviewId, userId)
      if (interview == null) return notFound()
      return interview
    }
  )

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative container py-8 space-y-6">
        <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
          All Interviews
        </BackLink>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-semibold">
                  Interview:{" "}
                  <SuspendedItem
                    item={interview}
                    fallback={<Skeleton className="w-48" />}
                    result={i => formatDateTime(i.createdAt)}
                  />
                </h1>
                <p className="text-slate-200/80">
                  <SuspendedItem
                    item={interview}
                    fallback={<Skeleton className="w-24" />}
                    result={i => i.duration}
                  />
                </p>
              </div>
              <SuspendedItem
                item={interview}
                fallback={<SkeletonButton className="w-32" />}
                result={i =>
                  i.feedback == null ? (
                    <ActionButton
                      action={generateInterviewFeedback.bind(null, i.id)}
                    >
                      Generate Feedback
                    </ActionButton>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>View Feedback</Button>
                      </DialogTrigger>
                      <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col">
                        <DialogTitle>Feedback</DialogTitle>
                        <MarkdownRenderer>{i.feedback}</MarkdownRenderer>
                      </DialogContent>
                    </Dialog>
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Suspense
          fallback={<Loader2Icon className="animate-spin size-24 mx-auto" />}
        >
          <Messages interview={interview} />
        </Suspense>
      </div>
    </div>
  )
}

async function Messages({
  interview,
}: {
  interview: Promise<{ humeChatId: string | null }>
}) {
  const { user, redirectToSignIn } = await getCurrentUser({ allData: true })
  if (user == null) return redirectToSignIn()
  const { humeChatId } = await interview
  if (humeChatId == null) return notFound()

  const condensedMessages = condenseChatMessages(
    await fetchChatMessages(humeChatId)
  )

  return (
    <CondensedMessages
      messages={condensedMessages}
      user={user}
      className="max-w-5xl mx-auto"
    />
  )
}

async function getInterview(id: string, userId: string) {
  "use cache"
  cacheTag(getInterviewIdTag(id))

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  })

  if (interview == null) return null

  cacheTag(getJobInfoIdTag(interview.jobInfo.id))
  if (interview.jobInfo.userId !== userId) return null

  return interview
}
