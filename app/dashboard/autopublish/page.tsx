// app/dashboard/autopublish/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AutoPublishDashboard } from "@/components/AutoPublishDashboard"

export default async function AutoPublishPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string }>
}) {
  const { tab = "all", search = "" } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch scheduled and published blogs for user
  let query = supabase
    .from("blogs")
    .select("*")
    .eq("author_id", user.id)
    .order("scheduled_at", { ascending: true, nullsFirst: false })

  const { data: blogs } = await query

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      <AutoPublishDashboard user={user} initialBlogs={blogs || []} initialTab={tab} initialSearch={search} />
    </div>
  )
}
