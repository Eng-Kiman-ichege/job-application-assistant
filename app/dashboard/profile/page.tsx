import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Sparkles, User, BadgeCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ProfileTabs } from "@/components/profile/ProfileTabs"
import { ProfileProgressCard } from "@/components/profile/ProfileProgressCard"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const user = await currentUser()
  if (!user) {
    redirect("/")
  }

  const supabase = await createClient()

  // Fetch complete profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // If profile is completely empty/missing, force redirect to dashboard so onboarding triggers
  if (!profile || !profile.resume_url) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-primary" />
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
            >
              My Profile
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Professional Profile <BadgeCheck className="h-5 w-5 text-emerald-500" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your credentials and details imported from your parsed resume.
          </p>
        </div>
      </div>

      {/* Grid Layout: Tabs (2/3) + Progress Card (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProfileTabs initialProfile={profile} />
        </div>
        <div className="space-y-6">
          <ProfileProgressCard
            completeness={profile.profile_completeness || 0}
            data={profile}
          />
        </div>
      </div>
    </div>
  )
}
