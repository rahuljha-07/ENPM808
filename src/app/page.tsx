import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingTable } from "@/services/clerk/components/PricingTable"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { UserAvatar } from "@/features/users/components/UserAvatar"
import { SignInButton } from "@clerk/nextjs"
import {
  ArrowRight,
  BookOpenCheckIcon,
  Target,
  Compass,
  FileSlidersIcon,
  Layers,
  Rocket,
  Sparkles,
  SpeechIcon,
} from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,234,212,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="relative">
        <Navbar />
        <Hero />
        <ProductGrid />
        <Workflow />
        <CustomerProof />
        <Pricing />
        <Footer />
      </div>
    </div>
  )
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-500/10 p-2 ring-1 ring-emerald-500/30">
            <Target className="h-6 w-6 text-emerald-400" />
          </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">
                Excel Interview
              </p>
              <p className="text-lg font-semibold text-white">Interview Lab</p>
            </div>
          </div>

        <Suspense fallback={<Button variant="outline">Sign In</Button>}>
          <NavButton />
        </Suspense>
      </div>
    </nav>
  )
}

async function NavButton() {
  const { userId } = await getCurrentUser()

  if (!userId) {
    return (
      <SignInButton forceRedirectUrl="/app">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
    )
  }

  return (
    <Button asChild>
      <Link href="/app">Go to workspace</Link>
    </Button>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Built for bold career moves
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Reimagine your prep with a AI that coaches, critiques, and
              celebrates your next offer.
            </h1>
            <p className="text-lg text-slate-200/80 sm:text-xl">
              Excel Interview blends AI coaching, curated drills, and
              actionable critique so you can tell sharper stories, ship cleaner
              code, and negotiate with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/app">
                  Launch the studio <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="#pricing">See plans</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-200/70">
              <BadgePill>Adaptive interview drills</BadgePill>
              <BadgePill>Resume critiques with proof</BadgePill>
              <BadgePill>Offer negotiation prep</BadgePill>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-500/10">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-500/10 p-2">
                    <SpeechIcon className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Live coach</p>
                    <p className="text-xs text-slate-300/70">Behavioral</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  Recording notes
                </span>
              </div>
              <div className="space-y-3 rounded-xl border border-white/5 bg-slate-900/70 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-emerald-200">
                  Coach prompt
                </p>
                <p className="text-sm text-slate-100/90">
                  "Walk me through a messy launch you inherited. What signals
                  told you it would miss, and how did you reset the plan?"
                </p>
              </div>
              <div className="mt-4 space-y-3 rounded-xl border border-white/5 bg-emerald-500/5 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-emerald-200">
                  Your framing
                </p>
                <p className="text-sm text-slate-100/90">
                  "In week one I mapped risk to owners, cut the scope to 70%,
                  and aligned success on adoption, not features shipped."
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Tag>Credibility</Tag>
                  <Tag>Prioritization</Tag>
                  <Tag>Influence</Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
      {children}
    </span>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">
      {children}
    </span>
  )
}

function ProductGrid() {
  const items = [
    {
      title: "Interview labs",
      copy: "Voice and text drills that adapt to your answers, expose gaps, and replay your strongest riffs.",
      icon: SpeechIcon,
      accent: "from-emerald-400/70 to-teal-300/60",
    },
    {
      title: "Narrative builder",
      copy: "Craft measurable stories with proof points, outcomes, and conflict. Export to pitch, resume, or portfolio.",
      icon: FileSlidersIcon,
      accent: "from-cyan-400/70 to-blue-300/60",
    },
    {
      title: "Technical sprints",
      copy: "Guided challenges with live hints, code reviews, and time-boxed practice that mirrors onsite loops.",
      icon: BookOpenCheckIcon,
      accent: "from-purple-400/70 to-fuchsia-300/60",
    },
    {
      title: "Offer room",
      copy: "Model compensation, rehearse counter points, and track recruiter interactions in one place.",
      icon: Layers,
      accent: "from-amber-400/70 to-orange-300/60",
    },
  ]

  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-10 max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-200/90">
            Platform
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Four rooms, one studio-built to keep you shipping sharper answers.
          </h2>
          <p className="text-lg text-slate-200/80">
            Every module pairs AI critique with human patterns from successful
            candidates so you know what “good” sounds like.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map(item => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:border-white/20 hover:bg-white/10"
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.accent} opacity-30 blur-3xl transition duration-300 group-hover:scale-110`}
              />
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-3">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-slate-200/80">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Workflow() {
  const steps = [
    {
      title: "Scan",
      detail:
        "Drop a JD or role target. We generate a skills map and pick your first drills.",
      icon: Compass,
    },
    {
      title: "Drill",
      detail:
        "Rapid sessions for behavioral and technical practice with live critique and suggested rewrites.",
      icon: Sparkles,
    },
    {
      title: "Distill",
      detail:
        "Turn practice into portfolio bullets, interview stories, and negotiation scripts.",
      icon: FileSlidersIcon,
    },
    {
      title: "Deploy",
      detail:
        "Track offers, test counters, and rehearse the final conversation before you sign.",
      icon: Rocket,
    },
  ]

  return (
    <section className="border-y border-white/5 bg-slate-900/40 py-16">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-200/90">
              How it flows
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              A simple loop that keeps you moving forward.
            </h2>
            <p className="max-w-2xl text-lg text-slate-200/80">
              Each stage closes a feedback loop-so you capture what you learned
              and arrive sharper at every interview.
            </p>
          </div>
          <Button variant="outline" className="border-white/30 text-white">
            View sample schedule
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <Card
              key={step.title}
              className="bg-slate-950/70 border-white/10 text-white"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-white/10 p-2">
                    <step.icon className="h-5 w-5 text-emerald-200" />
                  </div>
                  <span className="text-sm text-emerald-200/80">
                    0{idx + 1}
                  </span>
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-200/80">
                {step.detail}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomerProof() {
  const quotes = [
    {
      name: "Ivy Tran",
      role: "Staff Engineer to Director  -  Northwind Labs",
      quote:
        "The drills forced me to tighten my stories. I swapped in hard numbers and finally sounded like a leader, not just a builder.",
      time: "Offer in 4 weeks",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=96&h=96&fit=crop&crop=faces&auto=format&q=80",
    },
    {
      name: "Leo Martinez",
      role: "Product Manager  -  Waypoint",
      quote:
        "Excel’s rewrites gave me a reusable playbook. I stopped rambling and started landing final rounds consistently.",
      time: "3 offers this cycle",
      image:
        "https://images.unsplash.com/photo-1463453091185-61582044d556?w=96&h=96&fit=crop&crop=faces&auto=format&q=80",
    },
    {
      name: "Selena Moore",
      role: "Data Scientist  -  Helio",
      quote:
        "Technical sprints felt eerily close to the onsite. The feedback loop made me fix gaps before the real thing.",
      time: "Comp up +18%",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces&auto=format&q=80",
    },
    {
      name: "Jared Ellis",
      role: "Mobile Lead  -  Northstar",
      quote:
        "Mock interviews surfaced weak framing in my architecture stories. Two sessions later, the offer came in above my target band.",
      time: "Offer +12%",
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=96&h=96&fit=crop&crop=faces&auto=format&q=80",
    },
    {
      name: "Priya Rao",
      role: "Product Designer  -  Atelier",
      quote:
        "Story cards helped me package messy projects into crisp narratives. I finally stopped over-explaining in loop interviews.",
      time: "Final rounds at 3 teams",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&auto=format&q=80",
    },
    {
      name: "Mateo Silva",
      role: "DevOps Engineer  -  Orbit",
      quote:
        "The negotiation room walked me through counters and emails. First time I felt prepared to push back and still sound collaborative.",
      time: "Comp up +20%",
      image:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&fit=crop&crop=faces&auto=format&q=80",
    },
  ]

  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-200/90">
              Proof
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Real people, sharper outcomes.
            </h2>
            <p className="max-w-2xl text-lg text-slate-200/80">
              Not borrowed testimonials-fresh voices with different backgrounds and outcomes.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quotes.map(q => (
            <Card
              key={q.name}
              className="flex h-full flex-col border-white/10 bg-white/5 text-white"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    user={{ imageUrl: q.image ?? "", name: q.name }}
                    className="size-12"
                  />
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{q.name}</CardTitle>
                    <p className="text-sm text-slate-200/80">{q.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="text-slate-100/80 leading-relaxed">{q.quote}</p>
                <div className="text-sm font-medium text-emerald-200">{q.time}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-white/5 bg-slate-900/40 py-16">
      <div className="container">
        <div className="mb-10 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-200/90">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Choose how you want to work.
          </h2>
          <p className="text-lg text-slate-200/80">
            Transparent plans with all core modules included.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <PricingTable />
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 py-8">
      <div className="container flex flex-col gap-3 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-white/90">
          <Target className="h-5 w-5 text-emerald-300" />
          <span>Excel Interview  -  Interview Lab</span>
        </div>
        <div className="flex gap-4">
          <Link href="/app" className="hover:text-white">
            Launch workspace
          </Link>
          <Link href="#pricing" className="hover:text-white">
            Plans
          </Link>
        </div>
      </div>
    </footer>
  )
}






















