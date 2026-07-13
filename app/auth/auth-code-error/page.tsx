import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Authentication failed</CardTitle>
          <CardDescription>
            We couldn&apos;t complete your sign in. The link may have expired or
            already been used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/sign-in" />} className="w-full">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
