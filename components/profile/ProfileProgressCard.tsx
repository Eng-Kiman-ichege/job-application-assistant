"use client"

import * as React from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ProfileProgressCardProps {
  completeness: number
  data: any
}

export function ProfileProgressCard({ completeness, data }: ProfileProgressCardProps) {
  // Checklist items
  const items = [
    { label: "Personal Info", met: !!data?.full_name && !!data?.email },
    { label: "Professional Summary", met: !!data?.professional_summary },
    { label: "Skills added", met: Array.isArray(data?.skills) && data.skills.length > 0 },
    { label: "Work Experience", met: Array.isArray(data?.experience) && data.experience.length > 0 },
    { label: "Education Details", met: Array.isArray(data?.education) && data.education.length > 0 },
    { label: "Projects", met: Array.isArray(data?.projects) && data.projects.length > 0 },
    { label: "Certifications", met: Array.isArray(data?.certifications) && data.certifications.length > 0 },
  ]

  // Calculate SVG circular parameters
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completeness / 100) * circumference

  // Select color based on completion percentage
  let progressColor = "stroke-red-500"
  let progressBg = "bg-red-500/10"
  let progressText = "text-red-500"

  if (completeness >= 100) {
    progressColor = "stroke-emerald-500"
    progressBg = "bg-emerald-500/10"
    progressText = "text-emerald-500"
  } else if (completeness >= 50) {
    progressColor = "stroke-amber-500"
    progressBg = "bg-amber-500/10"
    progressText = "text-amber-500"
  }

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold">Profile Completeness</CardTitle>
        <CardDescription className="text-xs">Based on your parsed resume details</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-2">
        {/* SVG Circular Progress */}
        <div className="relative flex items-center justify-center h-28 w-28 mb-6">
          <svg className="h-full w-full -rotate-90">
            <circle
              className="stroke-muted"
              strokeWidth="6"
              fill="transparent"
              r={radius}
              cx="56"
              cy="56"
            />
            <circle
              className={`${progressColor} transition-all duration-500 ease-in-out`}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="56"
              cy="56"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold tracking-tight leading-none text-foreground">
              {completeness}%
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold mt-1">Complete</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="w-full space-y-2 mt-2 pt-4 border-t border-border/40">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              {item.met ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={`text-xs font-medium ${
                  item.met ? "text-foreground" : "text-muted-foreground/60 line-through decoration-muted-foreground/20"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
