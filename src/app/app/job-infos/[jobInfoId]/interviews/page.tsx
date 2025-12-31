import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { InterviewTable } from "@/drizzle/schema"
import { getInterviewJobInfoTag } from "@/features/interviews/dbCache"
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { formatDateTime } from "@/lib/formatters"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>
}) {
  const { jobInfoId } = await params

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative container py-8 gap-4 flex flex-col items-start">
        <JobInfoBackLink jobInfoId={jobInfoId} />

        <Suspense
          fallback={<Loader2Icon className="size-24 animate-spin m-auto" />}
        >
          <SuspendedPage jobInfoId={jobInfoId} />
        </Suspense>
      </div>
    </div>
  )
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const interviews = await getInterviews(jobInfoId, userId)
  if (interviews.length === 0) {
    return redirect(`/app/job-infos/${jobInfoId}/interviews/new`)
  }
  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
          Interviews
        </h1>
        <Button asChild className="gap-2">
          <Link href={`/app/job-infos/${jobInfoId}/interviews/new`}>
            <PlusIcon />
            New Interview
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        <Link
          className="transition-opacity group"
          href={`/app/job-infos/${jobInfoId}/interviews/new`}
        >
          <Card className="h-full flex items-center justify-center border-dashed border-white/25 bg-white/5 hover:border-emerald-300/60 transition-colors shadow-none">
            <div className="text-lg flex items-center gap-2 text-emerald-200">
              <PlusIcon className="size-6" />
              New Interview
            </div>
          </Card>
        </Link>
        {interviews.map(interview => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/app/job-infos/${jobInfoId}/interviews/${interview.id}`}
            key={interview.id}
          >
            <Card className="h-full border-white/10 bg-white/5">
              <div className="flex items-center justify-between h-full p-4">
                <CardHeader className="gap-1 flex-grow p-0">
                  <CardTitle className="text-lg text-white">
                    {formatDateTime(interview.createdAt)}
                  </CardTitle>
                  <CardDescription className="text-slate-200/80">
                    {interview.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ArrowRightIcon className="size-6 text-emerald-200" />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

async function getInterviews(jobInfoId: string, userId: string) {
  "use cache"
  cacheTag(getInterviewJobInfoTag(jobInfoId))
  cacheTag(getJobInfoIdTag(jobInfoId))

  const data = await db.query.InterviewTable.findMany({
    where: and(
      eq(InterviewTable.jobInfoId, jobInfoId),
      isNotNull(InterviewTable.humeChatId)
    ),
    with: { jobInfo: { columns: { userId: true } } },
    orderBy: desc(InterviewTable.updatedAt),
  })

  return data.filter(interview => interview.jobInfo.userId === userId)
}
