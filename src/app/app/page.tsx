import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { JobInfoTable } from "@/drizzle/schema"
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm"
import { getJobInfoUserTag } from "@/features/jobInfos/dbCache"
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { desc, eq } from "drizzle-orm"
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
import { Suspense } from "react"

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="size-24 animate-spin" />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  )
}

async function JobInfos() {
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const jobInfos = await getJobInfos(userId)

  if (jobInfos.length === 0) {
    return <NoJobInfos />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative w-full max-w-screen-2xl mx-auto px-6 lg:px-12 py-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-200/80">
              Your roles
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
              Select a role to continue practicing
            </h1>
            <p className="text-slate-200/80 max-w-2xl">
              Keep everything aligned: description, interview drills, resume,
              and questions for each target role.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/app/job-infos/new">
              <PlusIcon />
              Create role
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
          {jobInfos.map(jobInfo => (
            <Link
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 transition duration-300 hover:border-white/20 hover:bg-white/10"
              href={`/app/job-infos/${jobInfo.id}`}
              key={jobInfo.id}
            >
              <Card className="h-full border-0 bg-transparent shadow-none">
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="space-y-3">
                    <CardHeader className="p-0">
                      <CardTitle className="text-xl">{jobInfo.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-slate-200/80 line-clamp-3">
                      {jobInfo.description}
                    </CardContent>
                    <CardFooter className="p-0 flex gap-2 text-sm">
                      <Badge variant="outline" className="border-white/30 text-white">
                        {formatExperienceLevel(jobInfo.experienceLevel)}
                      </Badge>
                      {jobInfo.title && (
                        <Badge variant="outline" className="border-white/30 text-white">
                          {jobInfo.title}
                        </Badge>
                      )}
                    </CardFooter>
                  </div>
                  <CardContent className="p-0">
                    <ArrowRightIcon className="size-6 text-emerald-200" />
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}

          <Link
            className="group rounded-2xl border border-dashed border-white/15 bg-white/5 transition duration-300 hover:border-emerald-400/50"
            href="/app/job-infos/new"
          >
            <Card className="h-full border-0 bg-transparent shadow-none flex items-center justify-center">
              <div className="text-lg flex items-center gap-2 text-slate-100">
                <PlusIcon className="size-6 text-emerald-300" />
                Add another role
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

function NoJobInfos() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative w-full max-w-screen-lg mx-auto px-6 lg:px-12 py-12 space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-200/80">
            Start here
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
            Set up your first target role
          </h1>
          <p className="text-slate-200/80">
            Drop in the role description you’re chasing-stack, scope, and
            expectations. We’ll align interview drills, resume rewrites, and
            questions to this target.
          </p>
        </div>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-6">
            <JobInfoForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function getJobInfos(userId: string) {
  "use cache"
  cacheTag(getJobInfoUserTag(userId))

  return db.query.JobInfoTable.findMany({
    where: eq(JobInfoTable.userId, userId),
    orderBy: desc(JobInfoTable.updatedAt),
  })
}
