// components/AutoPublishDashboard.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  PlusCircle, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  Play, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  Loader2,
  Globe,
  Sparkles,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  category: string
  status: string
  scheduled_at: string | null
  require_approval: boolean | null
  published_at: string | null
  created_at: string
}

interface AutoPublishDashboardProps {
  user: any
  initialBlogs: Blog[]
  initialTab?: string
  initialSearch?: string
}

export function AutoPublishDashboard({
  user,
  initialBlogs,
  initialTab = "all",
  initialSearch = "",
}: AutoPublishDashboardProps) {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
  const [search, setSearch] = useState(initialSearch)
  const [tab, setTab] = useState(initialTab)
  const [isRunningCron, setIsRunningCron] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Calculate stats
  const scheduledBlogs = blogs.filter((b) => b.status === "scheduled" || b.status === "pending_approval")
  const autoPublishQueue = blogs.filter((b) => (b.status === "scheduled" || b.status === "pending_approval") && !b.require_approval)
  const pendingApprovalQueue = blogs.filter((b) => b.status === "pending_approval" || ((b.status === "scheduled") && b.require_approval))
  const publishedCount = blogs.filter((b) => b.status === "published").length

  // Filtered blogs based on search and active tab
  const getFilteredBlogs = () => {
    let list = blogs

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q))
    }

    if (tab === "auto-queue") {
      return list.filter((b) => (b.status === "scheduled" || b.status === "pending_approval") && !b.require_approval)
    } else if (tab === "requires-approval") {
      return list.filter((b) => b.status === "pending_approval" || (b.status === "scheduled" && b.require_approval))
    } else if (tab === "published") {
      return list.filter((b) => b.status === "published")
    }
    return list.filter((b) => b.status === "scheduled" || b.status === "pending_approval" || b.status === "published")
  }

  // Handle Approve & Publish Now action
  const handleApproveAndPublishNow = async (blogId: string) => {
    setActionLoadingId(blogId)
    try {
      const supabase = createClient()
      const nowIso = new Date().toISOString()

      const { error } = await supabase
        .from("blogs")
        .update({
          status: "published",
          published_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", blogId)

      if (error) throw error

      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId ? { ...b, status: "published", published_at: nowIso } : b
        )
      )
      toast.success("Post approved & published successfully!")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish post")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handle Delete / Cancel post
  const handleDeletePost = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) return

    setActionLoadingId(blogId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("blogs").delete().eq("id", blogId)

      if (error) throw error

      setBlogs((prev) => prev.filter((b) => b.id !== blogId))
      toast.success("Scheduled post deleted")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Manual Trigger Cron Job API test
  const handleRunCronJobNow = async () => {
    setIsRunningCron(true)
    try {
      const res = await fetch("/api/cron/publish", { method: "POST" })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Cron execution failed")

      toast.success(`Cron executed successfully! Published: ${data.publishedCount || 0}, Marked Pending: ${data.pendingApprovalCount || 0}`)
      
      // Refresh list
      const supabase = createClient()
      const { data: updatedBlogs } = await supabase
        .from("blogs")
        .select("*")
        .eq("author_id", user.id)
        .order("scheduled_at", { ascending: true, nullsFirst: false })

      if (updatedBlogs) setBlogs(updatedBlogs)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error running cron job")
    } finally {
      setIsRunningCron(false)
    }
  }

  const filtered = getFilteredBlogs()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Auto-Publish Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule blog post creation cards to auto-publish or hold for your manual approval.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRunCronJobNow} 
            disabled={isRunningCron}
            className="border-primary/30"
          >
            {isRunningCron ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> : <Play className="mr-2 h-4 w-4 text-primary fill-primary/20" />}
            Run Cron Now (Test)
          </Button>

          <Link href="/dashboard/autopublish/new">
            <Button size="lg" className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Schedule New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledBlogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Queued for future execution</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auto-Publish Queue</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {autoPublishQueue.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Publishes automatically when due</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-amber-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Requires Approval</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingApprovalQueue.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Waits for manual approval click</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Published</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Live on site</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search scheduled posts..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="all">All Cards</TabsTrigger>
            <TabsTrigger value="auto-queue">Auto-Publish</TabsTrigger>
            <TabsTrigger value="requires-approval">Approval Needed</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scheduled Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((blog) => {
            const isDue = blog.scheduled_at && new Date(blog.scheduled_at).getTime() <= Date.now()
            const targetRoute = `/${blog.category.toLowerCase() === 'general blog' ? 'blog' : blog.category.toLowerCase()}/${blog.slug}`

            return (
              <Card key={blog.id} className="overflow-hidden flex flex-col justify-between border shadow-sm hover:shadow-md transition-shadow">
                <div>
                  {/* Card Header Media Image */}
                  <div className="h-40 bg-muted relative overflow-hidden">
                    {blog.featured_image ? (
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/60 text-muted-foreground text-xs">
                        No image chosen
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {blog.status === "published" ? (
                        <Badge className="bg-emerald-600 text-white font-medium">Published</Badge>
                      ) : blog.status === "pending_approval" ? (
                        <Badge className="bg-amber-500 text-white font-medium flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> Ready for Approval
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-card/90 backdrop-blur font-medium">
                          Scheduled
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary uppercase tracking-wide">{blog.category}</span>
                      {blog.require_approval ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> Wait Approval
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Auto-Publish
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-lg font-medium leading-snug line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Target Route Callout */}
                    <div className="text-xs font-mono text-muted-foreground bg-muted/50 p-2 rounded border">
                      Target: <span className="text-foreground font-semibold">{targetRoute}</span>
                    </div>

                    {blog.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}

                    {/* Scheduled Timestamp */}
                    <div className="pt-2 border-t text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {blog.scheduled_at ? (
                          <>
                            Scheduled: <span className="font-medium text-foreground">{new Date(blog.scheduled_at).toLocaleString()}</span>
                          </>
                        ) : (
                          "No date set"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-muted/20 border-t flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePost(blog.id)}
                      disabled={actionLoadingId === blog.id}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {blog.status === "published" ? (
                    <Link href={`/blog/${blog.slug}`} target="_blank">
                      <Button size="sm" variant="ghost" className="text-xs gap-1">
                        View Article <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApproveAndPublishNow(blog.id)}
                      disabled={actionLoadingId === blog.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                    >
                      {actionLoadingId === blog.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      Approve & Publish Now
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="text-center py-12 p-6">
          <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-lg font-medium">No scheduled posts found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create a scheduled post card to set up automated publishing or approval workflows.
          </p>
          <Link href="/dashboard/autopublish/new">
            <Button className="bg-primary text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Post
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
