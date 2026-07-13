import { redirect } from "next/navigation"
import Link from "next/link"
import { Briefcase } from "lucide-react"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect("/sign-in")
  }

  const userId = data.claims.sub as string
  const email = data.claims.email as string | undefined

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .single()

  const displayName =
    profile?.full_name ||
    (data.claims.user_metadata as { full_name?: string } | undefined)
      ?.full_name ||
    email?.split("@")[0] ||
    "User"

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-full bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-3.5" />
            </div>
            <span className="font-semibold tracking-tight">Jobify</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar className="size-8">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={displayName} />
                )}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium leading-none">{displayName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            Dashboard
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, {displayName.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your application hub is ready. Start tracking your job search here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applications</CardTitle>
              <CardDescription>Track jobs you&apos;ve applied to</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Interviews</CardTitle>
              <CardDescription>Upcoming interview schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">0</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Saved roles</CardTitle>
              <CardDescription>Jobs bookmarked for later</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">0</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Get started</CardTitle>
            <CardDescription>
              Your account is set up. Here&apos;s what you can do next.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button disabled>Add your first application</Button>
            <Button variant="outline" disabled>
              Upload resume
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
