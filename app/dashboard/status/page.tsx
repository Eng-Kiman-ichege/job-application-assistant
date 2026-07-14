import { ListChecks, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StatusPage() {
  return (
    <div className="min-h-full space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ListChecks className="h-4 w-4 text-primary" />
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
          >
            Application Status
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Application Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor response status, interviews, and offers from companies.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            Track Applications
          </CardTitle>
          <CardDescription>
            You have not submitted or recorded any job applications yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/60 rounded-xl">
            <ListChecks className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold mb-1">No Applications Tracked</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Once you start applying to roles, their processing stages (Applied, Interviewing, Offer, Rejected) will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
