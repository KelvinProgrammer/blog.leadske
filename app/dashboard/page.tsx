import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { BlogList } from "@/components/blog-list"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's blogs
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your blog posts</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Blog Post
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <BlogList blogs={blogs || []} />
      </main>
    </div>
  )
}
