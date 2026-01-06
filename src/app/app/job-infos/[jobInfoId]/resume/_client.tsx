"use client"

import { Skeleton } from "@/components/Skeleton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { cn } from "@/lib/utils"
import { aiAnalyzeSchema } from "@/services/ai/resumes/schemas"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { DeepPartial } from "ai"
import {
  AlertCircleIcon,
  CheckCircleIcon,
  UploadIcon,
  XCircleIcon,
} from "lucide-react"
import { ReactNode, useRef, useState } from "react"
import { toast } from "sonner"
import z from "zod"

export function ResumePageClient({ jobInfoId }: { jobInfoId: string }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileRef = useRef<File | null>(null)

  const {
    object: aiAnalysis,
    isLoading,
    submit: generateAnalysis,
  } = useObject({
    api: "/api/ai/resumes/analyze",
    schema: aiAnalyzeSchema,
    fetch: (url, options) => {
      const headers = new Headers(options?.headers)
      headers.delete("Content-Type")

      const formData = new FormData()
      if (fileRef.current) {
        formData.append("resumeFile", fileRef.current)
      }
      formData.append("jobInfoId", jobInfoId)

      return fetch(url, { ...options, headers, body: formData })
    },
  })

  function handleFileUpload(file: File | null) {
    fileRef.current = file
    if (file == null) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit")
      return
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, Word document, or text file")
      return
    }

    generateAnalysis(null)
  }

  return (
    <div className="space-y-8 w-full">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] items-stretch">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
            Resume lab
          </p>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Upload and get tailored, job-aware resume feedback
            </h1>
            <p className="text-slate-200/80 max-w-2xl">
              We score your resume across ATS readiness, job match, and writing
              clarity, then give concrete edits you can make immediately.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-200/80">
            <div className="flex items-start gap-3">
              <span className="mt-1 text-emerald-300">✓</span>
              <span>PDF, Doc, or text up to 10MB</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-emerald-300">✓</span>
              <span>Highlights top fixes recruiters look for</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-emerald-300">✓</span>
              <span>Keywords matched to your target role</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-emerald-300">✓</span>
              <span>No data is shared outside your workspace</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
          {[
            { label: "Avg. score lift", value: "+23%" },
            { label: "ATS checks", value: "35+" },
            { label: "Keyword gaps fixed", value: "11" },
            { label: "Minutes to results", value: "<2" },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-emerald-500/10 p-4 shadow-lg"
            >
              <p className="text-xs uppercase tracking-wide text-emerald-100/80">
                {item.label}
              </p>
              <p className="text-2xl font-semibold text-white mt-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-white/5 border-white/10 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {isLoading ? "Analyzing your resume" : "Upload your resume"}
          </CardTitle>
          <CardDescription className="text-slate-200/80">
            {isLoading
              ? "This may take a couple minutes."
              : "Drop your resume to get line-by-line, job-aware feedback."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSwap loadingIconClassName="size-16" isLoading={isLoading}>
            <div
              className={cn(
                "mt-2 relative rounded-2xl p-8 transition-all border-2 border-dashed",
                isDragOver
                  ? "border-emerald-300/70 bg-emerald-500/10 shadow-emerald-500/30 shadow-lg"
                  : "border-white/20 bg-slate-900/60 hover:border-emerald-200/50 hover:bg-slate-900/80"
              )}
              onDragOver={e => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={e => {
                e.preventDefault()
                setIsDragOver(false)
              }}
              onDrop={e => {
                e.preventDefault()
                setIsDragOver(false)
                handleFileUpload(e.dataTransfer.files[0] ?? null)
              }}
            >
              <label htmlFor="resume-upload" className="sr-only">
                Upload your resume
              </label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="opacity-0 absolute inset-0 cursor-pointer"
                onChange={e => {
                  handleFileUpload(e.target.files?.[0] ?? null)
                }}
              />
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="rounded-full border border-emerald-200/40 bg-emerald-500/10 p-3">
                  <UploadIcon className="size-10 text-emerald-200" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-white">
                    Drag your resume here or click to upload
                  </p>
                  <p className="text-sm text-slate-200/80">
                    Supported: PDF, Word docs, and text files (max 10MB)
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-200/70">
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    Tailored to your job profile
                  </span>
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    ATS friendliness check
                  </span>
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    Writing clarity suggestions
                  </span>
                </div>
              </div>
            </div>
          </LoadingSwap>
        </CardContent>
      </Card>

      <AnalysisResults aiAnalysis={aiAnalysis} isLoading={isLoading} />
    </div>
  )
}

type Keys = Exclude<keyof z.infer<typeof aiAnalyzeSchema>, "overallScore">

function AnalysisResults({
  aiAnalysis,
  isLoading,
}: {
  aiAnalysis: DeepPartial<z.infer<typeof aiAnalyzeSchema>> | undefined
  isLoading: boolean
}) {
  if (!isLoading && aiAnalysis == null) return null

  const sections: Record<Keys, string> = {
    ats: "ATS Compatibility",
    jobMatch: "Job Match",
    writingAndFormatting: "Writing and Formatting",
    keywordCoverage: "Keyword Coverage",
    other: "Additional Insights",
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>
          {aiAnalysis?.overallScore == null ? (
            <Skeleton className="w-32" />
          ) : (
            `Overall Score: ${aiAnalysis.overallScore}/10`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          {Object.entries(sections).map(([key, title]) => {
            const category = aiAnalysis?.[key as Keys]

            return (
              <AccordionItem value={title} key={key}>
                <AccordionTrigger>
                  <CategoryAccordionHeader
                    title={title}
                    score={category?.score}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      {category?.summary == null ? (
                        <span className="space-y-2">
                          <Skeleton />
                          <Skeleton className="w-3/4" />
                        </span>
                      ) : (
                        category.summary
                      )}
                    </div>
                    <div className="space-y-3">
                      {category?.feedback == null ? (
                        <>
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                        </>
                      ) : (
                        category.feedback.map((item, index) => {
                          if (item == null) return null

                          return <FeedbackItem key={index} {...item} />
                        })
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}

function CategoryAccordionHeader({
  title,
  score,
}: {
  title: string
  score: number | undefined | null
}) {
  let badge: ReactNode
  if (score == null) {
    badge = <Skeleton className="w-16" />
  } else if (score >= 8) {
    badge = <Badge>Excellent</Badge>
  } else if (score >= 6) {
    badge = <Badge variant="warning">Ok</Badge>
  } else {
    badge = <Badge variant="destructive">Needs Works</Badge>
  }

  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex flex-col items-start gap-1">
        <span>{title}</span>
        <div className="no-underline">{badge}</div>
      </div>
      {score == null ? <Skeleton className="w-12" /> : `${score}/10`}
    </div>
  )
}

function FeedbackItem({
  message,
  name,
  type,
}: Partial<z.infer<typeof aiAnalyzeSchema>["ats"]["feedback"][number]>) {
  if (name == null || message == null || type == null) return null

  const getColors = () => {
    switch (type) {
      case "strength":
        return "bg-primary/10 border border-primary/50"
      case "major-improvement":
        return "bg-destructive/10 dark:bg-destructive/20 border border-destructive/50 dark:border-destructive/70"
      case "minor-improvement":
        return "bg-warning/10 border border-warning/40"
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`)
    }
  }

  const getIcon = () => {
    switch (type) {
      case "strength":
        return <CheckCircleIcon className="size-4 text-primary" />
      case "minor-improvement":
        return <AlertCircleIcon className="size-4 text-warning" />
      case "major-improvement":
        return <XCircleIcon className="size-4 text-destructive" />
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`)
    }
  }

  return (
    <div
      className={cn(
        "flex items-baseline gap-3 pl-3 pr-5 py-5 rounded-lg",
        getColors()
      )}
    >
      <div>{getIcon()}</div>
      <div className="flex flex-col gap-1">
        <div className="text-base">{name}</div>
        <div className="text-muted-foreground">{message}</div>
      </div>
    </div>
  )
}
