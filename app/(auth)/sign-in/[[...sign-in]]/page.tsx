import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto w-full",
          cardBox: "shadow-none border-0 w-full p-0 bg-transparent",
          card: "shadow-none border-0 w-full p-0 bg-transparent",
          headerTitle: "text-2xl font-semibold tracking-tight text-foreground",
          headerSubtitle: "text-sm text-muted-foreground",
          socialButtonsBlockButton: "border border-border bg-background hover:bg-muted text-foreground transition-all duration-200 cursor-pointer",
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-200 cursor-pointer shadow-sm",
          formFieldLabel: "text-sm font-medium text-foreground",
          formFieldInput: "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          footerActionLink: "text-primary hover:underline font-medium",
        },
      }}
    />
  )
}
