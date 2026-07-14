import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"
import { parseResumeWithAI, calculateCompleteness } from "@/lib/gemini"

const BUCKET = "resumes"
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("resume") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate type
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and DOCX files are accepted" }, { status: 400 })
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File size exceeds 5 MB limit" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filePath = `${user.id}/${timestamp}_${safeFileName}`

    // Ensure bucket exists — try programmatic creation, otherwise surface a clear error
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      if (listError) {
        console.error("Failed to list storage buckets:", listError)
      } else {
        console.log("Current Supabase storage buckets:", buckets?.map(b => b.id))
      }

      const exists = buckets?.some((b) => b.id === BUCKET)
      if (!exists) {
        console.log(`Bucket '${BUCKET}' not found. Attempting to create it...`)
        const { error: createBucketError } = await supabase.storage.createBucket(BUCKET, {
          public: false,
        })
        if (createBucketError) {
          console.error("Auto-create bucket failed:", createBucketError.message)
          // Return a friendly error asking user to create the bucket manually
          return NextResponse.json({ 
            error: `Storage bucket "resumes" is missing. Please go to Supabase Dashboard → Storage → New Bucket → name it "resumes" → keep it Private → Save. Then try uploading again.` 
          }, { status: 500 })
        }
        console.log(`Bucket '${BUCKET}' created successfully!`)
      }
    } catch (e: any) {
      console.error("Bucket check error:", e?.message)
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      // Check specifically for the bucket-not-found case
      if (uploadError.message?.toLowerCase().includes("bucket not found") || (uploadError as any).statusCode === "404") {
        return NextResponse.json({
          error: `Storage bucket "resumes" is missing. Please go to Supabase Dashboard → Storage → New Bucket → name it "resumes" → keep it Private → Save. Then try uploading again.`
        }, { status: 500 })
      }
      console.error("Storage upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file: " + uploadError.message }, { status: 500 })
    }

    // Parse resume with Gemini AI
    let parsedData = null
    let parseError: string | null = null

    try {
      parsedData = await parseResumeWithAI(
        arrayBuffer,
        file.type as "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    } catch (err) {
      console.error("Gemini parse error:", err)
      parseError = err instanceof Error ? err.message : "Failed to parse resume"
    }

    // Save resume file record
    const { data: resumeRecord, error: dbError } = await supabase
      .from("resume_files")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        parsed: !!parsedData,
      })
      .select()
      .single()

    if (dbError) {
      console.error("DB insert error:", dbError)
    }

    // Update profile with parsed data
    if (parsedData) {
      const profileUpdate: any = {
        id: user.id,
        resume_url: filePath,
        resume_file_name: file.name,
        updated_at: new Date().toISOString(),
      }

      if (parsedData.profile.fullName) profileUpdate.full_name = parsedData.profile.fullName
      if (parsedData.profile.email) profileUpdate.email = parsedData.profile.email
      if (parsedData.profile.phone) profileUpdate.phone = parsedData.profile.phone
      if (parsedData.profile.location) profileUpdate.location = parsedData.profile.location
      if (parsedData.profile.title) profileUpdate.title = parsedData.profile.title
      if (parsedData.profile.website) profileUpdate.website = parsedData.profile.website
      if (parsedData.profile.linkedin) profileUpdate.linkedin = parsedData.profile.linkedin
      if (parsedData.profile.github) profileUpdate.github = parsedData.profile.github
      if (parsedData.professionalSummary) profileUpdate.professional_summary = parsedData.professionalSummary
      if (parsedData.skills?.length) profileUpdate.skills = parsedData.skills
      if (parsedData.experience?.length) profileUpdate.experience = parsedData.experience
      if (parsedData.education?.length) profileUpdate.education = parsedData.education
      if (parsedData.projects?.length) profileUpdate.projects = parsedData.projects
      if (parsedData.certifications?.length) profileUpdate.certifications = parsedData.certifications

      // Calculate completeness
      profileUpdate.profile_completeness = calculateCompleteness({
        full_name: parsedData.profile.fullName,
        email: parsedData.profile.email,
        professional_summary: parsedData.professionalSummary,
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        projects: parsedData.projects,
        certifications: parsedData.certifications,
      })

      await supabase.from("profiles").upsert(profileUpdate)
    }

    return NextResponse.json({
      success: true,
      filePath,
      fileName: file.name,
      resumeId: resumeRecord?.id,
      parsed: parsedData,
      parseError,
    })
  } catch (err) {
    console.error("Resume upload error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
