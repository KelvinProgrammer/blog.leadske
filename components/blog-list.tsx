"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface Blog {
  id: string
  title: string
  excerpt: string | null
  category: string
  status: string
  featured_image: string | null
  created_at: string
  published_at: string | null
}

export function BlogList({ blogs }: { blogs: Blog[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    setDeletingId(id)
    const supabase = createClient()

    const { error } = await supabase.from("blogs").delete().eq("id", id)

    if (error) {
      alert("Error deleting blog post")
      setDeletingId(null)
      return
    }

    router.refresh()
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You haven&apos;t created any blog posts yet.</p>
        <Link href="/dashboard/new">
          <Button>Create your first blog post</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <Card key={blog.id} className="flex flex-col">
          {blog.featured_image && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={blog.featured_image || "/placeholder.svg"}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
              <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
            </div>
            <CardDescription className="line-clamp-2">{blog.excerpt || "No excerpt"}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{blog.category}</Badge>
              <span>•</span>
              <span>{new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href={`/dashboard/edit/${blog.id}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            {blog.status === "published" && (
              <Link href={`/blog/${blog.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(blog.id)}
              disabled={deletingId === blog.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
