import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ||
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.username ||
    user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  const avatarUrl = profile?.avatar_url ?? user.imageUrl;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={{ name: displayName, avatar: avatarUrl }} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
