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

type SignInFormProps = {
  redirectTo?: string
}

export function SignInForm({ redirectTo = "/dashboard" }: SignInFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const nextErrors: { email?: string; password?: string } = {}
    if (!email) nextErrors.email = "Email is required"
    if (!password) nextErrors.password = "Password is required"
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Welcome back!")
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                aria-invalid={!!errors.password}
              />
              <FieldError>{errors.password}</FieldError>
            </Field>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Spinner className="size-4" /> : "Sign in"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6">
          <FieldSeparator>or continue with</FieldSeparator>
          <div className="mt-6">
            <GoogleAuthButton redirectTo={redirectTo} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
