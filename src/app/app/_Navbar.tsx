"use client"

import {
  BookOpenIcon,
  FileSlidersIcon,
  LogOut,
  SpeechIcon,
  Target,
  User,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { UserAvatar } from "@/features/users/components/UserAvatar"
import { useParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const navLinks = [
  { name: "Interviews", href: "interviews", Icon: SpeechIcon },
  { name: "Questions", href: "questions", Icon: BookOpenIcon },
  { name: "Resume", href: "resume", Icon: FileSlidersIcon },
]

export function Navbar({ user }: { user: { name: string; imageUrl: string } }) {
  const { openUserProfile } = useClerk()
  const { jobInfoId } = useParams()
  const pathName = usePathname()

  return (
    <nav className="h-header border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
      <div className="container flex h-full items-center justify-between">
        <Link href="/app" className="flex items-center gap-3 text-white">
          <div className="rounded-full bg-emerald-500/10 p-2 ring-1 ring-emerald-500/30">
            <Target className="size-6 text-emerald-300" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Excel Interview
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {typeof jobInfoId === "string" &&
            navLinks.map(({ name, href, Icon }) => {
              const hrefPath = `/app/job-infos/${jobInfoId}/${href}`

              return (
                <Button
                  variant={pathName === hrefPath ? "secondary" : "ghost"}
                  key={name}
                  asChild
                  className="cursor-pointer max-sm:hidden border-white/10 text-white"
                >
                  <Link href={hrefPath}>
                    <Icon />
                    {name}
                  </Link>
                </Button>
              )
            })}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserAvatar user={user} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <User className="mr-2" />
                Profile
              </DropdownMenuItem>
              <SignOutButton>
                <DropdownMenuItem>
                  <LogOut className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
