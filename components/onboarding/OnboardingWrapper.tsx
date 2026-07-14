"use client"

import { useRouter } from "next/navigation"
import { OnboardingDialog } from "./OnboardingDialog"

/**
 * Client-side wrapper so the dashboard Server Component
 * can render the onboarding dialog without passing a function prop
 * across the server/client boundary.
 */
export function OnboardingWrapper() {
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return <OnboardingDialog onSuccess={handleSuccess} />
}
