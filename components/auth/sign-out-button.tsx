"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { useClerk } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function SignOutButton() {
  const { signOut } = useClerk()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut({ redirectUrl: "/sign-in" })
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
