"use client"

import { BackLink } from "@/components/BackLink"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { Card, CardContent } from "@/components/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  JobInfoTable,
  questionDifficulties,
  QuestionDifficulty,
} from "@/drizzle/schema"
import { formatQuestionDifficulty } from "@/features/questions/formatters"
import { useMemo, useState } from "react"
import { useCompletion } from "@ai-sdk/react"
import { errorToast } from "@/lib/errorToast"
import z from "zod"

type Status = "awaiting-answer" | "awaiting-difficulty" | "init"

export function NewQuestionClientPage({
  jobInfo,
}: {
  jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "name" | "title">
}) {
  const [status, setStatus] = useState<Status>("init")
  const [answer, setAnswer] = useState<string | null>(null)

  const {
    complete: generateQuestion,
    completion: question,
    setCompletion: setQuestion,
    isLoading: isGeneratingQuestion,
    data,
  } = useCompletion({
    api: "/api/ai/questions/generate-question",
    onFinish: () => {
      setStatus("awaiting-answer")
    },
    onError: error => {
      errorToast(error.message)
    },
  })

  const {
    complete: generateFeedback,
    completion: feedback,
    setCompletion: setFeedback,
    isLoading: isGeneratingFeedback,
  } = useCompletion({
    api: "/api/ai/questions/generate-feedback",
    onFinish: () => {
      setStatus("awaiting-difficulty")
    },
    onError: error => {
      errorToast(error.message)
    },
  })

  const questionId = useMemo(() => {
    const item = data?.at(-1)
    if (item == null) return null
    const parsed = z.object({ questionId: z.string() }).safeParse(item)
    if (!parsed.success) return null

    return parsed.data.questionId
  }, [data])

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(94,234,212,0.14),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative flex flex-col gap-4 w-full px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <BackLink href={`/app/job-infos/${jobInfo.id}`}>
              {jobInfo.name}
            </BackLink>
            <div className="text-slate-200/80 text-sm">
              Pick a difficulty, get a prompt, draft your answer, then request feedback.
            </div>
          </div>
          <Controls
            reset={() => {
              setStatus("init")
              setQuestion("")
              setFeedback("")
              setAnswer(null)
            }}
            disableAnswerButton={
              answer == null || answer.trim() === "" || questionId == null
            }
            status={status}
            isLoading={isGeneratingFeedback || isGeneratingQuestion}
            generateFeedback={() => {
              if (answer == null || answer.trim() === "" || questionId == null)
                return

              generateFeedback(answer?.trim(), { body: { questionId } })
            }}
            generateQuestion={difficulty => {
              setQuestion("")
              setFeedback("")
              setAnswer(null)
              generateQuestion(difficulty, { body: { jobInfoId: jobInfo.id } })
            }}
          />
        </div>

        <QuestionContainer
          question={question}
          feedback={feedback}
          answer={answer}
          status={status}
          setAnswer={setAnswer}
        />
      </div>
    </div>
  )
}

function QuestionContainer({
  question,
  feedback,
  answer,
  status,
  setAnswer,
}: {
  question: string | null
  feedback: string | null
  answer: string | null
  status: Status
  setAnswer: (value: string) => void
}) {
  return (
    <Card className="border-white/10 bg-white/5 shadow-lg shadow-emerald-500/10">
      <CardContent className="p-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-grow rounded-xl overflow-hidden border border-white/10 min-h-[72vh]"
        >
          <ResizablePanel id="question-and-feedback" defaultSize={50} minSize={25}>
            <ResizablePanelGroup direction="vertical" className="flex-grow">
              <ResizablePanel id="question" defaultSize={30} minSize={20}>
                <div className="bg-slate-900/60 h-full">
                  <ScrollArea className="h-full min-w-48 *:h-full">
                    {status === "init" && question == null ? (
                      <p className="text-base md:text-lg flex items-center justify-center h-full p-6 text-slate-200/70">
                        Pick a difficulty to generate your next prompt.
                      </p>
                    ) : (
                      question && (
                        <MarkdownRenderer className="p-6 text-white">
                          {question}
                        </MarkdownRenderer>
                      )
                    )}
                  </ScrollArea>
                </div>
              </ResizablePanel>
              {feedback && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel id="feedback" defaultSize={70} minSize={20}>
                    <div className="bg-slate-900/50 h-full">
                      <ScrollArea className="h-full min-w-48 *:h-full">
                        <MarkdownRenderer className="p-6 text-emerald-50">
                          {feedback}
                        </MarkdownRenderer>
                      </ScrollArea>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="answer" defaultSize={50} minSize={25}>
            <div className="h-full bg-slate-900/40">
              <ScrollArea className="h-full min-w-48 *:h-full">
                <Textarea
                  disabled={status !== "awaiting-answer"}
                  onChange={e => setAnswer(e.target.value)}
                  value={answer ?? ""}
                  placeholder="Type your answer here..."
                  className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset !text-base p-6 bg-transparent text-white placeholder:text-slate-400"
                />
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  )
}

function Controls({
  status,
  isLoading,
  disableAnswerButton,
  generateQuestion,
  generateFeedback,
  reset,
}: {
  disableAnswerButton: boolean
  status: Status
  isLoading: boolean
  generateQuestion: (difficulty: QuestionDifficulty) => void
  generateFeedback: () => void
  reset: () => void
}) {
  return (
    <div className="flex gap-2">
      {status === "awaiting-answer" ? (
        <>
          <Button
            onClick={reset}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Skip</LoadingSwap>
          </Button>
          <Button
            onClick={generateFeedback}
            disabled={disableAnswerButton}
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
          </Button>
        </>
      ) : (
        questionDifficulties.map(difficulty => (
          <Button
            key={difficulty}
            size="sm"
            disabled={isLoading}
            onClick={() => generateQuestion(difficulty)}
          >
            <LoadingSwap isLoading={isLoading}>
              {formatQuestionDifficulty(difficulty)}
            </LoadingSwap>
          </Button>
        ))
      )}
    </div>
  )
}
