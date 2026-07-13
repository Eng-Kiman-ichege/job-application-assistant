import Link from "next/link"
import { ArrowRight, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-3.5" />
            </div>
            <span className="font-semibold tracking-tight">Jobify</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/sign-up" />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Apply smarter. Land faster.
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Jobify helps you manage applications, tailor your resume, and stay
            organized throughout your job search.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <Button size="lg" render={<Link href="/sign-up" />}>
              Create free account
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/sign-in" />}
            >
              Sign in
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
