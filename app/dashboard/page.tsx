import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { UserButton } from "@clerk/nextjs"
import { Briefcase, TrendingUp, CalendarCheck, Bookmark, ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const userId = user.id
  const email = user.emailAddresses[0]?.emailAddress
  const supabase = await createClient()

  // Fetch or lazy-create profile
  let profile = null
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()

  if (profileError) {
    console.error("Supabase profile fetch error:", {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    })
  }

  if (!existingProfile && !profileError) {
    const fallbackName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "User"
    const fallbackAvatar = user.imageUrl
    
    console.log("No existing profile found. Inserting profile for:", userId)
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email || null,
        full_name: fallbackName,
        avatar_url: fallbackAvatar || null,
      })
      .select("full_name, avatar_url")
      .single()

    if (insertError) {
      console.error("Supabase profile insert error:", insertError)
    } else {
      profile = newProfile
      console.log("Successfully created profile in Supabase:", profile)
    }
  } else {
    profile = existingProfile
  }

  const displayName =
    profile?.full_name ||
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.username ||
    email?.split("@")[0] ||
    "User"

  const firstName = displayName.split(" ")[0]

  const stats = [
    {
      label: "Applications",
      value: "0",
      desc: "Jobs applied to",
      icon: <Briefcase className="h-5 w-5" />,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Interviews",
      value: "0",
      desc: "Upcoming this week",
      icon: <CalendarCheck className="h-5 w-5" />,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Saved Roles",
      value: "0",
      desc: "Bookmarked for later",
      icon: <Bookmark className="h-5 w-5" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Response Rate",
      value: "—",
      desc: "Avg. employer replies",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="min-h-full">
      {/* ── Top header bar ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
            >
              Dashboard
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s a snapshot of your job search journey.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                  <span className={s.color}>{s.icon}</span>
                </div>
              </div>
              <p className="text-3xl font-bold tabular-nums">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Get started card ── */}
      <Card className="border-border/60 shadow-sm mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/5 pointer-events-none" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Get started</CardTitle>
              <CardDescription className="text-xs">
                Set up your profile to start tracking applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 pb-5">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/25" disabled>
            Add first application
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2 border-border" disabled>
            Upload resume
          </Button>
        </CardContent>
      </Card>

      {/* ── Quick tips ── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI Tips for your search</CardTitle>
          <CardDescription className="text-xs">
            Personalized recommendations to help you land your next role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {[
            "Tailor your resume keywords to each job description",
            "Follow up with a thank-you email after every interview",
            "Set a daily goal of 3–5 quality applications",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {i + 1}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
