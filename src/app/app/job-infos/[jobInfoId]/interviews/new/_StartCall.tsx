"use client"

import { Button } from "@/components/ui/button"
import { env } from "@/data/env/client"
import { JobInfoTable } from "@/drizzle/schema"
import { createInterview, updateInterview } from "@/features/interviews/actions"
import { errorToast } from "@/lib/errorToast"
import { CondensedMessages } from "@/services/hume/components/CondensedMessages"
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages"
import { useVoice, VoiceReadyState } from "@humeai/voice-react"
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

export function StartCall({
  jobInfo,
  user,
  accessToken,
}: {
  accessToken: string
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "title" | "description" | "experienceLevel"
  >
  user: {
    name: string
    imageUrl: string
  }
}) {
  const { connect, readyState, chatMetadata, callDurationTimestamp } =
    useVoice()
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const durationRef = useRef(callDurationTimestamp)
  const router = useRouter()
  durationRef.current = callDurationTimestamp

  // Sync chat ID
  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return
    }
    updateInterview(interviewId, { humeChatId: chatMetadata.chatId })
  }, [chatMetadata?.chatId, interviewId])

  // Sync duration
  useEffect(() => {
    if (interviewId == null) return
    const intervalId = setInterval(() => {
      if (durationRef.current == null) return

      updateInterview(interviewId, { duration: durationRef.current })
    }, 10000)

    return () => clearInterval(intervalId)
  }, [interviewId])

  // Handle disconnect
  useEffect(() => {
    if (readyState !== VoiceReadyState.CLOSED) return
    if (interviewId == null) {
      return router.push(`/app/job-infos/${jobInfo.id}/interviews`)
    }

    if (durationRef.current != null) {
      updateInterview(interviewId, { duration: durationRef.current })
    }
    router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`)
  }, [interviewId, readyState, router, jobInfo.id])

  if (readyState === VoiceReadyState.IDLE) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
        <div className="relative container h-screen-header flex items-center justify-center">
          <div className="max-w-3xl w-full rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                Live interview
              </p>
              <h1 className="text-3xl font-semibold leading-tight">
                Start your mock interview with Excel Interview
              </h1>
              <p className="text-slate-200/80">
                We will use your role, experience level, and job description to
                tailor the conversation and feedback in real time.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-200/80">
              <InfoPill label="Role" value={jobInfo.title || "Not specified"} />
              <InfoPill
                label="Experience"
                value={jobInfo.experienceLevel ?? "Unknown"}
              />
              <InfoPill
                label="Focus"
                value="Behavioral + technical + project deep dives"
              />
              <InfoPill label="Runtime" value="You control the pace" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200/80">
              <p className="font-semibold text-white mb-2">Your description</p>
              <p className="leading-relaxed">
                {jobInfo.description ?? "No description provided."}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="px-8 text-base font-semibold"
                onClick={async () => {
                  const res = await createInterview({ jobInfoId: jobInfo.id })
                  if (res.error) {
                    return errorToast(res.message)
                  }
                  setInterviewId(res.id)

                  connect({
                    auth: { type: "accessToken", value: accessToken },
                    configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
                    sessionSettings: {
                      type: "session_settings",
                      variables: {
                        userName: user.name,
                        title: jobInfo.title || "Not Specified",
                        description: jobInfo.description,
                        experienceLevel: jobInfo.experienceLevel,
                      },
                    },
                  })
                }}
              >
                Start Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (
    readyState === VoiceReadyState.CONNECTING ||
    readyState === VoiceReadyState.CLOSED
  ) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
        <div className="relative h-screen-header flex items-center justify-center">
          <Loader2Icon className="animate-spin size-24 text-emerald-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative overflow-y-auto h-screen-header flex flex-col-reverse">
        <div className="container py-6 flex flex-col items-center justify-end gap-6">
          <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-4 sm:p-6">
            <Messages user={user} />
          </div>
          <Controls />
        </div>
      </div>
    </div>
  )
}

function Messages({ user }: { user: { name: string; imageUrl: string } }) {
  const { messages, fft } = useVoice()

  const condensedMessages = useMemo(() => {
    return condenseChatMessages(messages)
  }, [messages])

  return (
    <CondensedMessages
      messages={condensedMessages}
      user={user}
      maxFft={Math.max(...fft)}
      className="w-full"
    />
  )
}

function Controls() {
  const { disconnect, isMuted, mute, unmute, micFft, callDurationTimestamp } =
    useVoice()

  return (
    <div className="flex gap-5 rounded-2xl border border-white/10 px-5 py-3 w-fit sticky bottom-6 bg-white/10 backdrop-blur-xl shadow-lg items-center text-white">
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3 text-white hover:bg-white/10"
        onClick={() => (isMuted ? unmute() : mute())}
      >
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>
      <div className="text-sm text-slate-200/80 tabular-nums">
        {callDurationTimestamp}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3 text-white hover:bg-white/10"
        onClick={disconnect}
      >
        <PhoneOffIcon className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  )
}

function FftVisualizer({ fft }: { fft: number[] }) {
  return (
    <div className="flex gap-1 items-center h-full">
      {fft.map((value, index) => {
        const percent = (value / 4) * 100
        return (
          <div
            key={index}
            className="min-h-0.5 bg-emerald-300/80 w-0.5 rounded"
            style={{ height: `${percent < 10 ? 0 : percent}%` }}
          />
        )
      })}
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-emerald-200/80">
        {label}
      </p>
      <p className="text-base text-white">{value}</p>
    </div>
  )
}
