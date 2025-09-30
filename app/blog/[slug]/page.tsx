import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*, profiles(display_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-accent font-medium tracking-wide">{blog.category.toUpperCase()}</span>
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(blog.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {blog.profiles?.display_name && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                {blog.profiles.display_name}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6 leading-tight text-balance">
            {blog.title}
          </h1>

          {blog.excerpt && <p className="text-xl text-muted-foreground leading-relaxed mb-8">{blog.excerpt}</p>}

          {blog.featured_image && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
              <img
                src={blog.featured_image || "/placeholder.svg"}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-light prose-a:text-accent">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              View All Stories
            </Button>
          </Link>
        </div>
      </article>
    </div>
  )
}
