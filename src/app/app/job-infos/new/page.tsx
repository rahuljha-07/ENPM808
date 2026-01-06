import { BackLink } from "@/components/BackLink"
import { Card, CardContent } from "@/components/ui/card"
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm"

export default function JobInfoNewPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative w-full max-w-screen-xl mx-auto px-6 lg:px-12 py-8 space-y-5">
        <BackLink href="/app">Dashboard</BackLink>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold">
            Create New Job Description
          </h1>
          <p className="text-slate-200/80">
            Set your target role once and keep interviews, resume tweaks, and
            question drills aligned to it.
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <JobInfoForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
