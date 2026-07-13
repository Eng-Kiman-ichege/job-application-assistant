"use client";
import React from "react";

import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider>
        {children}
        <Toaster richColors position="top-center" />
      </ClerkProvider>
    </ThemeProvider>
  );
}
