import OpenAI from "openai"
import type { ParsedResume } from "@/types/resume"

const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"

const RESUME_PARSE_PROMPT = `You are an expert resume parser. Extract all information from the provided resume text and return it as a valid JSON object.

Return ONLY a JSON object (no markdown, no code fences, no explanation) with this exact structure:
{
  "profile": {
    "fullName": "string",
    "email": "string",
    "phone": "string or empty string",
    "location": "string or empty string",
    "title": "current job title or desired role, string or empty string",
    "website": "string or empty string",
    "linkedin": "string or empty string",
    "github": "string or empty string"
  },
  "professionalSummary": "string - a concise 2-4 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string e.g. Jan 2022",
      "endDate": "string e.g. Dec 2023 or Present",
      "location": "string or empty string",
      "responsibilities": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string e.g. Bachelor of Science",
      "field": "string e.g. Computer Science",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string or empty string",
      "honors": "string or empty string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["tech1", "tech2"],
      "url": "string or empty string",
      "startDate": "string or empty string",
      "endDate": "string or empty string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string or empty string",
      "url": "string or empty string"
    }
  ]
}

Extract ALL information available. If a field is not present, use an empty string or empty array. Do NOT include any text outside the JSON object.`

function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey === "your-openrouter-api-key-here") {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Get your key from https://openrouter.ai/keys and add it to .env.local"
    )
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000",
      "X-Title": "JobBuddy AI Resume Parser",
    },
  })
}

export async function parseResumeWithAI(
  fileBuffer: ArrayBuffer,
  mimeType:
    | "application/pdf"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
): Promise<ParsedResume> {
  // Extract text from file first (Nemotron is text-only)
  let resumeText = ""

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // DOCX: extract text with mammoth
    const mammoth = await import("mammoth")
    const buffer = Buffer.from(fileBuffer)
    const { value } = await mammoth.extractRawText({ buffer })
    resumeText = value
  } else {
    // PDF: extract text with pdf-parse
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse")
      const buffer = Buffer.from(fileBuffer)
      const result = await pdfParse(buffer)
      resumeText = result.text
    } catch (err) {
      // Fallback: treat buffer as raw UTF-8 text (works for text-based PDFs)
      resumeText = Buffer.from(fileBuffer).toString("utf-8")
    }
  }

  if (!resumeText.trim()) {
    throw new Error(
      "Could not extract readable text from the file. Please ensure it is not a scanned image-only document."
    )
  }

  const client = createOpenRouterClient()

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: RESUME_PARSE_PROMPT,
      },
      {
        role: "user",
        content: `Here is the resume text to parse:\n\n${resumeText.slice(0, 12000)}`, // cap at ~12k chars
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  })

  const rawText = response.choices[0]?.message?.content?.trim() || ""

  // Strip potential markdown code fences
  const jsonText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()

  try {
    const parsed: ParsedResume = JSON.parse(jsonText)
    return parsed
  } catch {
    console.error("JSON parse error. Raw AI output was:", rawText.slice(0, 500))
    throw new Error(
      "Failed to parse resume into structured data. The AI response was not valid JSON."
    )
  }
}

// Keep old name as alias for backward compatibility with existing imports
export const parseResumeWithGemini = parseResumeWithAI

/**
 * Calculate profile completeness percentage based on filled fields.
 */
export function calculateCompleteness(data: {
  full_name?: string | null
  email?: string | null
  professional_summary?: string | null
  skills?: unknown[] | null
  experience?: unknown[] | null
  education?: unknown[] | null
  projects?: unknown[] | null
  certifications?: unknown[] | null
}): number {
  const checks = [
    !!data.full_name,
    !!data.email,
    !!data.professional_summary,
    Array.isArray(data.skills) && data.skills.length > 0,
    Array.isArray(data.experience) && data.experience.length > 0,
    Array.isArray(data.education) && data.education.length > 0,
    Array.isArray(data.projects) && data.projects.length > 0,
    Array.isArray(data.certifications) && data.certifications.length > 0,
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}
