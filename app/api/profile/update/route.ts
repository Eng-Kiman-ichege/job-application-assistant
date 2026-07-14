import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"
import { calculateCompleteness } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate completeness on incoming fields
    const completeness = calculateCompleteness({
      full_name: body.full_name,
      email: body.email,
      professional_summary: body.professional_summary,
      skills: body.skills,
      experience: body.experience,
      education: body.education,
      projects: body.projects,
      certifications: body.certifications,
    })

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: body.full_name || null,
        email: body.email || null,
        phone: body.phone || null,
        location: body.location || null,
        title: body.title || null,
        website: body.website || null,
        linkedin: body.linkedin || null,
        github: body.github || null,
        professional_summary: body.professional_summary || null,
        skills: Array.isArray(body.skills) ? body.skills : [],
        experience: Array.isArray(body.experience) ? body.experience : [],
        education: Array.isArray(body.education) ? body.education : [],
        projects: Array.isArray(body.projects) ? body.projects : [],
        certifications: Array.isArray(body.certifications) ? body.certifications : [],
        profile_completeness: completeness,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Profile save error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err) {
    console.error("Profile save error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
