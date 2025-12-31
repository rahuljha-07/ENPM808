import { BackLink } from "@/components/BackLink"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { JobInfoTable } from "@/drizzle/schema"
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink"
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { and, eq } from "drizzle-orm"
import { Loader2 } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export default async function JobInfoNewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>
}) {
  const { jobInfoId } = await params

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative w-full max-w-screen-xl mx-auto px-6 lg:px-12 py-8 space-y-4">
        <JobInfoBackLink jobInfoId={jobInfoId} />

        <h1 className="text-3xl md:text-4xl font-semibold">
          Edit Job Description
        </h1>

        <Card className="border-white/10 bg-white/5 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <Suspense
              fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
            >
              <SuspendedForm jobInfoId={jobInfoId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const jobInfo = await getJobInfo(jobInfoId, userId)
  if (jobInfo == null) return notFound()

  return <JobInfoForm jobInfo={jobInfo} />
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}
