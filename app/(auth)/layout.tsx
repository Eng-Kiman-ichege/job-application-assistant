import Link from "next/link"
import { Briefcase } from "lucide-react"

type AuthLayoutProps = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-600/40 via-transparent to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-violet-600/20 blur-3xl"
          aria-hidden
        />

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
            <Briefcase className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Jobify</span>
        </Link>

        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Land your dream job with AI-powered applications
          </h2>
          <p className="text-base leading-relaxed text-zinc-400">
            Track applications, tailor your resume, and stay organized — all in
            one place.
          </p>
        </div>

        <p className="relative z-10 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Jobify. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Jobify</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
