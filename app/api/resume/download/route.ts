import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

const BUCKET = "resumes"

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ error: "Missing file path" }, { status: 400 })
    }

    // Ensure the user only downloads their own files (path begins with user.id)
    if (!filePath.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.storage.from(BUCKET).download(filePath)

    if (error) {
      console.error("Storage download error:", error)
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
    }

    const buffer = Buffer.from(await data.arrayBuffer())
    
    // Attempt to extract file extension/name from path
    const parts = filePath.split("/")
    const fileName = parts[parts.length - 1] || "resume.pdf"
    const extension = fileName.split(".").pop()?.toLowerCase()
    
    const contentType = extension === "docx" 
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      : "application/pdf"

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (err) {
    console.error("Resume download error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
