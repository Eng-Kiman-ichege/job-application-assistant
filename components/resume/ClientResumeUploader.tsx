"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function ClientResumeUploader() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 80) return prev + 10
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

      setProgress(100)
      setStatus("success")
      toast.success("Resume uploaded and parsed successfully!")

      setTimeout(() => {
        setFile(null)
        setStatus("idle")
        setProgress(0)
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
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold">Upload New Resume</CardTitle>
        <CardDescription className="text-xs">
          Parsed resume details will overwrite your current profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "idle" && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300 ${
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

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3 text-primary">
                <UploadCloud className="h-5 w-5" />
              </div>

              {file ? (
                <div className="text-center min-w-0 w-full">
                  <p className="text-xs font-semibold truncate px-2">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-medium">
                    Drag/drop or <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    PDF, DOCX (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleUploadAndParse}
              disabled={!file}
              className="w-full bg-primary hover:bg-primary/95 text-xs font-semibold shadow-sm"
            >
              Upload & Parse
            </Button>
          </div>
        )}

        {(status === "uploading" || status === "parsing") && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-xs font-semibold">
              {status === "uploading" ? "Uploading resume..." : "Gemini AI is parsing..."}
            </p>
            <div className="w-full mt-4">
              <Progress value={progress} className="h-1.5 bg-muted" />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 animate-bounce" />
            <p className="text-xs font-bold text-emerald-500">Success!</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-xs font-bold text-destructive">Failed to upload</p>
            <p className="text-[10px] text-muted-foreground mt-1 mb-4 max-w-[200px]">
              {errorMessage}
            </p>
            <Button onClick={() => setStatus("idle")} size="sm" className="bg-primary w-full">
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
