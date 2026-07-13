"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function SignUpForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const nextErrors: typeof errors = {}
    if (!fullName.trim()) nextErrors.fullName = "Full name is required"
    if (!email) nextErrors.email = "Email is required"
    if (!password) nextErrors.password = "Password is required"
    else if (password.length < 8)
      nextErrors.password = "Password must be at least 8 characters"
    if (password !== confirmPassword)
      nextErrors.confirmPassword = "Passwords do not match"
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Account created! Check your email to confirm, or sign in now.")
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Start your job search journey with Jobify
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.fullName}
              />
              <FieldError>{errors.fullName}</FieldError>
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.email}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.password}
              />
              <FieldError>{errors.password}</FieldError>
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.confirmPassword}
              />
              <FieldError>{errors.confirmPassword}</FieldError>
            </Field>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Spinner className="size-4" /> : "Create account"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6">
          <FieldSeparator>or continue with</FieldSeparator>
          <div className="mt-6">
            <GoogleAuthButton redirectTo="/dashboard" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
