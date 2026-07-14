"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  FileText, 
  Brain, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface ProfileTabsProps {
  initialProfile: any
  onSaveSuccess?: () => void
}

export function ProfileTabs({ initialProfile, onSaveSuccess }: ProfileTabsProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  // State management for all categories
  const [profile, setProfile] = useState({
    full_name: initialProfile?.full_name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    location: initialProfile?.location || "",
    title: initialProfile?.title || "",
    website: initialProfile?.website || "",
    linkedin: initialProfile?.linkedin || "",
    github: initialProfile?.github || "",
  })

  const [summary, setSummary] = useState(initialProfile?.professional_summary || "")
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || [])
  const [skillInput, setSkillInput] = useState("")

  const [experience, setExperience] = useState<any[]>(initialProfile?.experience || [])
  const [education, setEducation] = useState<any[]>(initialProfile?.education || [])
  const [projects, setProjects] = useState<any[]>(initialProfile?.projects || [])
  const [certifications, setCertifications] = useState<any[]>(initialProfile?.certifications || [])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  // Skills Helpers
  const handleAddSkill = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  // Work Experience Helpers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: "",
        title: "",
        startDate: "",
        endDate: "",
        location: "",
        responsibilities: [""],
      },
    ])
  }

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, idx) => idx !== index))
  }

  const handleExperienceFieldChange = (index: number, field: string, value: any) => {
    const updated = [...experience]
    updated[index] = { ...updated[index], [field]: value }
    setExperience(updated)
  }

  const handleExperienceRespChange = (expIdx: number, respIdx: number, value: string) => {
    const updated = [...experience]
    const resps = [...updated[expIdx].responsibilities]
    resps[respIdx] = value
    updated[expIdx] = { ...updated[expIdx], responsibilities: resps }
    setExperience(updated)
  }

  const handleAddResp = (expIdx: number) => {
    const updated = [...experience]
    const resps = [...updated[expIdx].responsibilities, ""]
    updated[expIdx] = { ...updated[expIdx], responsibilities: resps }
    setExperience(updated)
  }

  const handleRemoveResp = (expIdx: number, respIdx: number) => {
    const updated = [...experience]
    const resps = updated[expIdx].responsibilities.filter((_: any, idx: number) => idx !== respIdx)
    updated[expIdx] = { ...updated[expIdx], responsibilities: resps }
    setExperience(updated)
  }

  // Education Helpers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        gpa: "",
        honors: "",
      },
    ])
  }

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, idx) => idx !== index))
  }

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...education]
    updated[index] = { ...updated[index], [field]: value }
    setEducation(updated)
  }

  // Projects Helpers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        name: "",
        description: "",
        technologies: [],
        url: "",
        startDate: "",
        endDate: "",
      },
    ])
  }

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, idx) => idx !== index))
  }

  const handleProjectChange = (index: number, field: string, value: any) => {
    const updated = [...projects]
    updated[index] = { ...updated[index], [field]: value }
    setProjects(updated)
  }

  // Certifications Helpers
  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      {
        name: "",
        issuer: "",
        date: "",
        url: "",
      },
    ])
  }

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, idx) => idx !== index))
  }

  const handleCertificationChange = (index: number, field: string, value: string) => {
    const updated = [...certifications]
    updated[index] = { ...updated[index], [field]: value }
    setCertifications(updated)
  }

  // General Save Action
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          professional_summary: summary,
          skills,
          experience,
          education,
          projects,
          certifications,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile saved successfully!")
      router.refresh()
      if (onSaveSuccess) onSaveSuccess()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Error saving profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
          <p className="text-sm text-muted-foreground">Modify information parsed from your resume</p>
        </div>
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all duration-200"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="info" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full h-auto p-1 bg-muted/60 gap-1 rounded-xl mb-4">
          <TabsTrigger value="info" className="flex items-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm">
            <User size={15} />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm">
            <FileText size={15} />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm">
            <Brain size={15} />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm">
            <Briefcase size={15} />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm">
            <GraduationCap size={15} />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm">
            <Code size={15} />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm">
            <Award size={15} />
            <span className="hidden sm:inline">Awards</span>
          </TabsTrigger>
        </TabsList>

        {/* ── 1. Basic Info Tab ── */}
        <TabsContent value="info">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Information
              </CardTitle>
              <CardDescription>Update your core professional contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleProfileChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Professional Title</label>
                  <Input
                    name="title"
                    value={profile.title}
                    onChange={handleProfileChange}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <Input
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Location</label>
                  <Input
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Portfolio Website</label>
                  <Input
                    name="website"
                    value={profile.website}
                    onChange={handleProfileChange}
                    placeholder="https://johndoe.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
                  <Input
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleProfileChange}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
                  <Input
                    name="github"
                    value={profile.github}
                    onChange={handleProfileChange}
                    placeholder="https://github.com/johndoe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 2. Professional Summary Tab ── */}
        <TabsContent value="summary">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Professional Summary
              </CardTitle>
              <CardDescription>Provide a concise pitch introducing yourself, your experience, and key values.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Highly motivated Software Engineer with 5+ years of experience specializing in web development and cloud architectures..."
                className="min-h-[160px] leading-relaxed resize-y"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. Skills Tab ── */}
        <TabsContent value="skills">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> Skills & Technologies
              </CardTitle>
              <CardDescription>Add, edit, or remove technical skills and soft skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Enter a skill (e.g. React, Docker, Python)"
                  className="flex-1"
                />
                <Button type="button" onClick={() => handleAddSkill()} className="bg-primary hover:bg-primary/95 shrink-0 flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 italic">No skills added yet.</p>
                ) : (
                  skills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-accent/70 hover:bg-accent/90 text-foreground border border-border flex items-center gap-1.5 px-3 py-1 text-xs rounded-full cursor-default"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-muted-foreground hover:text-destructive hover:bg-background/20 rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold text-[9px]"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 4. Work Experience Tab ── */}
        <TabsContent value="experience">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">List your professional work history chronologically.</p>
              <Button onClick={handleAddExperience} className="bg-primary hover:bg-primary/95 text-xs flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Job
              </Button>
            </div>

            {experience.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="py-8 text-center text-muted-foreground/60 italic text-sm">
                  No work experience records. Add your first job.
                </CardContent>
              </Card>
            ) : (
              experience.map((exp, expIdx) => (
                <Card key={expIdx} className="border-border/60 shadow-sm relative">
                  <CardHeader className="pb-3 pr-12">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Role #{expIdx + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExperience(expIdx)}
                      className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                        <Input
                          value={exp.company}
                          onChange={(e) => handleExperienceFieldChange(expIdx, "company", e.target.value)}
                          placeholder="e.g. Acme Corp"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
                        <Input
                          value={exp.title}
                          onChange={(e) => handleExperienceFieldChange(expIdx, "title", e.target.value)}
                          placeholder="e.g. Frontend Engineer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                        <Input
                          value={exp.startDate}
                          onChange={(e) => handleExperienceFieldChange(expIdx, "startDate", e.target.value)}
                          placeholder="e.g. Jan 2021"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                        <Input
                          value={exp.endDate}
                          onChange={(e) => handleExperienceFieldChange(expIdx, "endDate", e.target.value)}
                          placeholder="e.g. Present or Dec 2023"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Location (Optional)</label>
                        <Input
                          value={exp.location || ""}
                          onChange={(e) => handleExperienceFieldChange(expIdx, "location", e.target.value)}
                          placeholder="e.g. Remote / New York, NY"
                        />
                      </div>
                    </div>

                    {/* Responsibilities list */}
                    <div className="space-y-2.5 pt-2 border-t border-border/40">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground">Responsibilities & Achievements</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddResp(expIdx)}
                          className="h-7 text-xs border-border hover:bg-muted"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Bullet
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {exp.responsibilities?.map((resp: string, respIdx: number) => (
                          <div key={respIdx} className="flex gap-2 items-center">
                            <Input
                              value={resp}
                              onChange={(e) => handleExperienceRespChange(expIdx, respIdx, e.target.value)}
                              placeholder="e.g. Developed and deployed modern frontend features using Next.js..."
                              className="flex-1"
                            />
                            {exp.responsibilities.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveResp(expIdx, respIdx)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── 5. Education Tab ── */}
        <TabsContent value="education">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Enter degrees, diplomas, or courses.</p>
              <Button onClick={handleAddEducation} className="bg-primary hover:bg-primary/95 text-xs flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Education
              </Button>
            </div>

            {education.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="py-8 text-center text-muted-foreground/60 italic text-sm">
                  No education records. Add your background.
                </CardContent>
              </Card>
            ) : (
              education.map((edu, eduIdx) => (
                <Card key={eduIdx} className="border-border/60 shadow-sm relative">
                  <CardHeader className="pb-3 pr-12">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" /> Education #{eduIdx + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEducation(eduIdx)}
                      className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Institution / School</label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(eduIdx, "institution", e.target.value)}
                          placeholder="e.g. Stanford University"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Degree (Optional)</label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(eduIdx, "degree", e.target.value)}
                          placeholder="e.g. Bachelor of Science"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Field of Study</label>
                        <Input
                          value={edu.field}
                          onChange={(e) => handleEducationChange(eduIdx, "field", e.target.value)}
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">GPA (Optional)</label>
                        <Input
                          value={edu.gpa || ""}
                          onChange={(e) => handleEducationChange(eduIdx, "gpa", e.target.value)}
                          placeholder="e.g. 3.8/4.0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                        <Input
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(eduIdx, "startDate", e.target.value)}
                          placeholder="e.g. 2017"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                        <Input
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(eduIdx, "endDate", e.target.value)}
                          placeholder="e.g. 2021"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Honors / Activities (Optional)</label>
                        <Input
                          value={edu.honors || ""}
                          onChange={(e) => handleEducationChange(eduIdx, "honors", e.target.value)}
                          placeholder="e.g. Magna Cum Laude, President of Computing Club"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── 6. Projects Tab ── */}
        <TabsContent value="projects">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Provide details on side projects or notable assignments.</p>
              <Button onClick={handleAddProject} className="bg-primary hover:bg-primary/95 text-xs flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="py-8 text-center text-muted-foreground/60 italic text-sm">
                  No projects added yet. Click Add Project to include one.
                </CardContent>
              </Card>
            ) : (
              projects.map((proj, projIdx) => (
                <Card key={projIdx} className="border-border/60 shadow-sm relative">
                  <CardHeader className="pb-3 pr-12">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" /> Project #{projIdx + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProject(projIdx)}
                      className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
                        <Input
                          value={proj.name}
                          onChange={(e) => handleProjectChange(projIdx, "name", e.target.value)}
                          placeholder="e.g. AI Portfolio Generator"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Project Link / URL (Optional)</label>
                        <Input
                          value={proj.url || ""}
                          onChange={(e) => handleProjectChange(projIdx, "url", e.target.value)}
                          placeholder="https://github.com/johndoe/portfolio"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                        <Input
                          value={proj.startDate || ""}
                          onChange={(e) => handleProjectChange(projIdx, "startDate", e.target.value)}
                          placeholder="e.g. Jun 2023"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                        <Input
                          value={proj.endDate || ""}
                          onChange={(e) => handleProjectChange(projIdx, "endDate", e.target.value)}
                          placeholder="e.g. Present"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Technologies Used (Comma-separated)</label>
                        <Input
                          value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || ""}
                          onChange={(e) => {
                            const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            handleProjectChange(projIdx, "technologies", arr)
                          }}
                          placeholder="e.g. React, TypeScript, TailwindCSS"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Description</label>
                        <Textarea
                          value={proj.description}
                          onChange={(e) => handleProjectChange(projIdx, "description", e.target.value)}
                          placeholder="e.g. A web-based application built to dynamically create and host responsive portfolios for developers using Gemini models..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── 7. Certifications Tab ── */}
        <TabsContent value="certifications">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Add certifications, course achievements, or professional awards.</p>
              <Button onClick={handleAddCertification} className="bg-primary hover:bg-primary/95 text-xs flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Award
              </Button>
            </div>

            {certifications.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="py-8 text-center text-muted-foreground/60 italic text-sm">
                  No certifications listed. Click Add Award to add one.
                </CardContent>
              </Card>
            ) : (
              certifications.map((cert, certIdx) => (
                <Card key={certIdx} className="border-border/60 shadow-sm relative">
                  <CardHeader className="pb-3 pr-12">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" /> Award / Cert #{certIdx + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCertification(certIdx)}
                      className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Certificate / Award Name</label>
                        <Input
                          value={cert.name}
                          onChange={(e) => handleCertificationChange(certIdx, "name", e.target.value)}
                          placeholder="e.g. AWS Certified Solutions Architect"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Issuing Organization</label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => handleCertificationChange(certIdx, "issuer", e.target.value)}
                          placeholder="e.g. Amazon Web Services (AWS)"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Date Obtained (Optional)</label>
                        <Input
                          value={cert.date || ""}
                          onChange={(e) => handleCertificationChange(certIdx, "date", e.target.value)}
                          placeholder="e.g. Sep 2023"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Credential URL (Optional)</label>
                        <Input
                          value={cert.url || ""}
                          onChange={(e) => handleCertificationChange(certIdx, "url", e.target.value)}
                          placeholder="https://credly.com/your-badge"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
