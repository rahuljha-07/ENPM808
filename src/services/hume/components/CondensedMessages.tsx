import { UserAvatar } from "@/features/users/components/UserAvatar"
import { cn } from "@/lib/utils"
import { Target } from "lucide-react"

export function CondensedMessages({
  messages,
  user,
  className,
  maxFft = 0,
}: {
  messages: { isUser: boolean; content: string[] }[]
  user: { name: string; imageUrl: string }
  className?: string
  maxFft?: number
}) {
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {messages.map((message, index) => {
        const shouldAnimate = index === messages.length - 1 && maxFft > 0

        return (
          <div
            key={index}
            className={cn(
              "relative max-w-[82%] rounded-2xl px-5 py-4 backdrop-blur-md border shadow-lg transition",
              message.isUser
                ? "self-end bg-emerald-500/10 border-emerald-300/30 text-emerald-50 shadow-emerald-500/20"
                : "self-start bg-white/5 border-white/10 text-slate-100 shadow-sky-500/15"
            )}
          >
            <div
              className={cn(
                "absolute -top-3 text-[11px] tracking-wide uppercase px-3 py-1 rounded-full border",
                message.isUser
                  ? "border-emerald-200/50 bg-emerald-500/20 text-emerald-50"
                  : "border-white/30 bg-white/10 text-slate-100"
              )}
            >
              {message.isUser ? "You" : "Coach"}
            </div>
            <div className="flex items-start gap-4">
              {message.isUser ? (
                <UserAvatar user={user} className="size-10 flex-shrink-0" />
              ) : (
                <div className="relative">
                  <div
                    className={cn(
                      "absolute inset-0 border-muted border-4 rounded-full",
                      shouldAnimate ? "animate-ping" : "hidden"
                    )}
                  />
                  <div className="relative flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-sky-500/30 to-emerald-500/30 border border-white/20">
                    <Target
                      className="size-6 text-white"
                      style={shouldAnimate ? { scale: maxFft / 8 + 1 } : undefined}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 text-sm leading-relaxed">
                {message.content.map((text, i) => (
                  <p key={i} className="text-base">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
