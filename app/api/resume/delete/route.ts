import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

const BUCKET = "resumes"

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing resume ID" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the record to get path first
    const { data: record, error: fetchError } = await supabase
      .from("resume_files")
      .select("file_path, user_id")
      .eq("id", id)
      .single()

    if (fetchError || !record) {
      return NextResponse.json({ error: "Resume file not found" }, { status: 404 })
    }

    // Auth check on the path
    if (record.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([record.file_path])
    if (storageError) {
      console.error("Storage delete error:", storageError)
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from("resume_files")
      .delete()
      .eq("id", id)

    if (dbError) {
      console.error("Database delete error:", dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Clear resume_url in profile if it was the current one
    const { data: profile } = await supabase
      .from("profiles")
      .select("resume_url")
      .eq("id", user.id)
      .single()

    if (profile?.resume_url === record.file_path) {
      await supabase
        .from("profiles")
        .update({ resume_url: null, resume_file_name: null })
        .eq("id", user.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete resume error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
