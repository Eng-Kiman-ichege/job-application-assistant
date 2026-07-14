import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { FileText, Plus, UploadCloud } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ResumeList } from "@/components/resume/ResumeList"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// We can build a simple inline Client Component or import the dialog helper to upload here as well!
// Let's create an upload form component so the user can upload additional resumes on this page.
import { ClientResumeUploader } from "@/components/resume/ClientResumeUploader"

export default async function ResumePage() {
  const user = await currentUser()
  if (!user) {
    redirect("/")
  }

  const supabase = await createClient()

  // Fetch all uploaded resumes for this user
  const { data: resumes, error } = await supabase
    .from("resume_files")
    .select("*")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false })

  return (
    <div className="min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-primary" />
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
            >
              Resumes
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Resume Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload new resumes, parse details, and manage documents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Resume upload component */}
        <div>
          <ClientResumeUploader />
        </div>

        {/* Right column: List of uploaded files */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Uploaded Files</h2>
          <ResumeList resumes={resumes || []} />
        </div>
      </div>
    </div>
  )
}
