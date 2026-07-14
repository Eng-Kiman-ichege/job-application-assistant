"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface OnboardingDialogProps {
  onSuccess: () => void
}

export function OnboardingDialog({ onSuccess }: OnboardingDialogProps) {
  const [open, setOpen] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF and DOCX files are allowed.")
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size cannot exceed 5MB.")
      return false
    }
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleUploadAndParse = async () => {
    if (!file) return

    setStatus("uploading")
    setProgress(15)

    try {
      const formData = new FormData()
      formData.append("resume", file)

      // We'll simulate upload progress steps while the request is processing
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 80) return prev + 12
          return prev
        })
      }, 300)

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(interval)

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}))
        throw new Error(errorJson.error || `Upload failed with status ${response.status}`)
      }

      const result = await response.json()
      setProgress(90)
      setStatus("parsing")

      if (result.parseError) {
        console.warn("Parsing warned:", result.parseError)
      }

      setProgress(100)
      setStatus("success")
      toast.success("Resume parsed successfully!")

      // Delay briefly to show success, then proceed
      setTimeout(() => {
        setOpen(false)
        onSuccess()
        router.refresh()
      }, 1500)
    } catch (error: any) {
      console.error(error)
      setStatus("error")
      setErrorMessage(error.message || "An unexpected error occurred during processing.")
      toast.error(error.message || "Failed to process resume.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md border-border/80 shadow-2xl bg-background/95 backdrop-blur-md rounded-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-violet-500 to-emerald-500 rounded-t-2xl" />

        <DialogHeader className="pt-2 text-center">
          <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Welcome to JobBuddy! 👋
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs mt-1">
            Let&apos;s set up your profile. Upload your resume to automatically parse and populate your profile details using Gemini AI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4">
          {status === "idle" && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4 text-primary animate-pulse">
                <UploadCloud className="h-6 w-6" />
              </div>

              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold truncate max-w-[280px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drag and drop your resume here, or <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Supports PDF, DOCX (Max 5MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {(status === "uploading" || status === "parsing") && (
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              <div className="relative flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {status === "uploading" ? "Uploading your resume..." : "Gemini AI is parsing details..."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Extracting experience, skills, and education details
              </p>
              <div className="w-full mt-6">
                <Progress value={progress} className="h-2 bg-muted transition-all" />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Setup Complete!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Redirecting you to the dashboard...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="w-full flex flex-col items-center justify-center p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-destructive">
                Failed to process resume
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-[300px]">
                {errorMessage}
              </p>
              <Button onClick={() => setStatus("idle")} className="bg-primary hover:bg-primary/90 shadow-sm w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>

        {status === "idle" && (
          <div className="flex gap-3 justify-end pt-2 border-t border-border/40 mt-2">
            <Button
              onClick={handleUploadAndParse}
              disabled={!file}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
            >
              Continue with Upload
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
