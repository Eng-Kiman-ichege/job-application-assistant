// Types for parsed resume data returned from Gemini AI

export interface WorkExperience {
  company: string
  title: string
  startDate: string
  endDate: string
  location?: string
  responsibilities: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
  honors?: string
}

export interface Project {
  name: string
  description: string
  technologies: string[]
  url?: string
  startDate?: string
  endDate?: string
}

export interface Certification {
  name: string
  issuer: string
  date?: string
  url?: string
}

export interface ParsedResume {
  profile: {
    fullName: string
    email: string
    phone?: string
    location?: string
    title?: string
    website?: string
    linkedin?: string
    github?: string
  }
  professionalSummary: string
  skills: string[]
  experience: WorkExperience[]
  education: Education[]
  projects: Project[]
  certifications: Certification[]
}

export interface ResumeFile {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number | null
  parsed: boolean | null
  uploaded_at: string
}
