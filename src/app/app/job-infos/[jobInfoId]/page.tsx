import { BackLink } from "@/components/BackLink"
import { Skeleton } from "@/components/Skeleton"
import { SuspendedItem } from "@/components/SuspendedItem"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { JobInfoTable } from "@/drizzle/schema"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { and, eq } from "drizzle-orm"
import { ArrowRightIcon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
import { notFound } from "next/navigation"

const options = [
  {
    label: "Answer Technical Questions",
    description:
      "Challenge yourself with practice questions tailored to your job description.",
    href: "questions",
  },
  {
    label: "Practice Interviewing",
    description: "Simulate a real interview with AI-powered mock interviews.",
    href: "interviews",
  },
  {
    label: "Refine Your Resume",
    description:
      "Get expert feedback on your resume and improve your chances of landing an interview.",
    href: "resume",
  },
  {
    label: "Update Job Description",
    description: "This should only be used for minor updates.",
    href: "edit",
  },
]

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>
}) {
  const { jobInfoId } = await params

  const jobInfo = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn()

      const jobInfo = await getJobInfo(jobInfoId, userId)
      if (jobInfo == null) return notFound()

      return jobInfo
    }
  )

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative container py-8 space-y-6">
        <BackLink href="/app">Dashboard</BackLink>

        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-emerald-500/10">
          <header className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold">
                <SuspendedItem
                  item={jobInfo}
                  fallback={<Skeleton className="w-48" />}
                  result={j => j.name}
                />
              </h1>
              <div className="flex gap-2">
                <SuspendedItem
                  item={jobInfo}
                  fallback={<Skeleton className="w-12" />}
                  result={j => (
                    <Badge variant="secondary">
                      {formatExperienceLevel(j.experienceLevel)}
                    </Badge>
                  )}
                />
                <SuspendedItem
                  item={jobInfo}
                  fallback={null}
                  result={j => {
                    return j.title && <Badge variant="secondary">{j.title}</Badge>
                  }}
                />
              </div>
            </div>
            <p className="text-slate-200/80 line-clamp-3">
              <SuspendedItem
                item={jobInfo}
                fallback={<Skeleton className="w-96" />}
                result={j => j.description}
              />
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 has-hover:*:not-hover:opacity-70">
            {options.map(option => (
              <Link
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1 transition duration-300 hover:border-white/20 hover:bg-white/10"
                href={`/app/job-infos/${jobInfoId}/${option.href}`}
                key={option.href}
              >
                <Card className="h-full border-0 bg-transparent shadow-none">
                  <div className="flex items-start justify-between gap-4 p-4">
                    <CardHeader className="p-0 flex-grow">
                      <CardTitle className="text-lg text-white">
                        {option.label}
                      </CardTitle>
                      <CardDescription className="text-slate-200/80">
                        {option.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ArrowRightIcon className="size-6 text-emerald-200 transition group-hover:translate-x-1" />
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}
