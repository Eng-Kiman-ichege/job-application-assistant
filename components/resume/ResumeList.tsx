"use client"

import * as React from "react"
import { useState } from "react"
import { FileText, Download, Trash2, Calendar, HardDrive, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ResumeFile {
  id: string
  file_name: string
  file_path: string
  file_size: number | null
  parsed: boolean | null
  uploaded_at: string
}

interface ResumeListProps {
  resumes: ResumeFile[]
}

export function ResumeList({ resumes: initialResumes }: ResumeListProps) {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeFile[]>(initialResumes)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatBytes = (bytes: number | null, decimals = 2) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = (resume: ResumeFile) => {
    const downloadUrl = `/api/resume/download?path=${encodeURIComponent(resume.file_path)}`
    window.open(downloadUrl, "_blank")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume? This cannot be undone.")) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/resume/delete?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete resume")
      }

      setResumes(resumes.filter((r) => r.id !== id))
      toast.success("Resume deleted successfully.")
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to delete resume.")
    } finally {
      setDeletingId(null)
    }
  }

  if (resumes.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm border-dashed p-8 text-center flex flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 animate-pulse">
          <FileText className="h-6 w-6" />
        </div>
        <CardTitle className="text-base font-bold mb-1">No resumes uploaded yet</CardTitle>
        <CardDescription className="text-xs max-w-sm mb-4">
          You must upload a resume to unlock the full potential of your AI career assistant.
        </CardDescription>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {resumes.map((resume) => (
        <Card
          key={resume.id}
          className="border-border/60 hover:shadow-md transition-shadow duration-200 overflow-hidden relative"
        >
          <div className="absolute top-0 inset-y-0 left-0 w-1 bg-primary" />
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate max-w-[280px] sm:max-w-[400px]">
                  {resume.file_name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5" />
                    {formatBytes(resume.file_size)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(resume.uploaded_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {resume.parsed ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 text-xs font-semibold py-1">
                  <Sparkles className="h-3.5 w-3.5" /> Parsed
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 text-xs font-semibold py-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Partial
                </Badge>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDownload(resume)}
                title="Download file"
                className="h-9 w-9 border-border hover:bg-muted"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                disabled={deletingId === resume.id}
                onClick={() => handleDelete(resume.id)}
                title="Delete file"
                className="h-9 w-9 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                {deletingId === resume.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
