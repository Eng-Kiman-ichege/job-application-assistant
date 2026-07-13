import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

import type { Database } from "@/lib/database.types"

export async function createClient() {
  const { getToken } = await auth()
  const token = await getToken({ template: "supabase" })

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
    }
  )
}
