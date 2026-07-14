import { Briefcase, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function JobsPage() {
  return (
    <div className="min-h-full space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="h-4 w-4 text-primary" />
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
          >
            Jobs
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Job Search & Matching</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover matching job postings and apply tailored resumes automatically.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/5 pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI Matches Coming Soon
          </CardTitle>
          <CardDescription>
            Once your profile is fully complete, we will match you with active listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-sm text-muted-foreground mb-4">
            We are indexing active software development opportunities in your area. Finish setting up your profile sections to get notified of matches.
          </p>
          <Button className="bg-primary hover:bg-primary/95 text-xs font-semibold">
            Browse Mock Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
