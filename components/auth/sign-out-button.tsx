"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Signed out successfully")
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? (
        <Spinner className="size-3.5" />
      ) : (
        <>
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </>
      )}
    </Button>
  )
}
