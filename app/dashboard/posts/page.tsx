import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import { BlogList } from "@/components/blog-list"

export default async function AllPostsPage({
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

  // Fetch all blogs
  let query = supabase
    .from("blogs")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  // Filter by status
  if (tab === "published") {
    query = query.eq("status", "published")
  } else if (tab === "drafts") {
    query = query.eq("status", "draft")
  }

  // Search filter
  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  const { data: blogs } = await query

  const allBlogs = blogs || []
  const publishedCount = blogs?.filter((b) => b.status === "published").length || 0
  const draftCount = blogs?.filter((b) => b.status === "draft").length || 0

  return (
    <div className="space-y-8 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize all your blog posts
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="pl-10"
            defaultValue={search}
            name="search"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={tab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href="/dashboard/posts?tab=all">
              All ({allBlogs.length})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="published" asChild>
            <Link href="/dashboard/posts?tab=published">
              Published ({publishedCount})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="drafts" asChild>
            <Link href="/dashboard/posts?tab=drafts">
              Drafts ({draftCount})
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <BlogList blogs={allBlogs} />
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <BlogList blogs={allBlogs.filter((b) => b.status === "published")} />
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <BlogList blogs={allBlogs.filter((b) => b.status === "draft")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}