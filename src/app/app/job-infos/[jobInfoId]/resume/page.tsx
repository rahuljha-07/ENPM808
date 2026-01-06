import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink"
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions"
import { Loader2Icon } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ResumePageClient } from "./_client"

export default async function ResumePage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>
}) {
  const { jobInfoId } = await params

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative container py-6 space-y-4 h-screen-header flex flex-col items-start">
        <JobInfoBackLink jobInfoId={jobInfoId} />
        <Suspense
          fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
        >
          <SuspendedComponent jobInfoId={jobInfoId} />
        </Suspense>
      </div>
    </div>
  )
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade")

  return <ResumePageClient jobInfoId={jobInfoId} />
}
