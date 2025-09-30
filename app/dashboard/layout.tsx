import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "./header/page"
import { Sidebar } from "./sidebar/page"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch blog stats for sidebar
  const { data: blogs } = await supabase
    .from("blogs")
    .select("status")
    .eq("author_id", user.id)

  const stats = {
    totalPosts: blogs?.length || 0,
    publishedPosts: blogs?.filter((b) => b.status === "published").length || 0,
    draftPosts: blogs?.filter((b) => b.status === "draft").length || 0,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar stats={stats} />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}