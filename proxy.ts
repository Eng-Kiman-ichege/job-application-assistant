import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedPrefixes = ["/dashboard"];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isProtected = protectedPrefixes.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtected && !userId) {
    // Send unauthenticated visitors back to the homepage
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
