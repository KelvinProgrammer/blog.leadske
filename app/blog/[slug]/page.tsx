import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import ShareButtons from "@/components/ShareButtons"
import CommentSection from "@/components/CommentSection"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch the blog post
  const { data: blog, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !blog) {
    notFound()
  }

  // Fetch related blogs from the same category
  const { data: relatedBlogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("category", blog.category)
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3)

  // Fetch top/recent stories
  const { data: topStories } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5)

  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = blog.content.split(/\s+/).length
  const readTime = Math.ceil(wordCount / 200)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </header>

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-8">
            {/* Article Header */}
            <div className="mb-8">
              <Badge className="mb-4">{blog.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6 leading-tight">
                {blog.title}
              </h1>
              
              {blog.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                  {blog.excerpt}
                </p>
              )}

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
                {blog.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{blog.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(blog.published_at || blog.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} min read</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {blog.featured_image && (
              <div className="mb-8">
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Video if available */}
            {blog.video_url && (
              <div className="mb-8">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {blog.video_url.includes('youtube.com') || blog.video_url.includes('youtu.be') ? (
                    <iframe
                      src={blog.video_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-4xl mb-2">▶️</div>
                        <p className="text-sm text-muted-foreground">{blog.video_url}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-light prose-a:text-accent mb-8">
              <ReactMarkdown>{blog.content}</ReactMarkdown>
            </div>

            {/* Share Buttons */}
            <ShareButtons title={blog.title} />

            {/* Comment Section */}
            <CommentSection articleSlug={slug} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              {/* Top Stories */}
              {topStories && topStories.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-xl font-serif font-light mb-4">Top Stories</h3>
                  <div className="space-y-4">
                    {topStories.map((story) => (
                      <Link
                        key={story.id}
                        href={`/blog/${story.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {story.featured_image && (
                            <img
                              src={story.featured_image}
                              alt={story.title}
                              className="w-20 h-20 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm group-hover:text-accent transition-colors line-clamp-2">
                              {story.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(story.published_at || story.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Stories */}
              {relatedBlogs && relatedBlogs.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-xl font-serif font-light mb-4">Related Stories</h3>
                  <div className="space-y-6">
                    {relatedBlogs.map((article) => (
                      <Link
                        key={article.id}
                        href={`/blog/${article.slug}`}
                        className="block group"
                      >
                        {article.featured_image && (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        <Badge variant="secondary" className="mb-2">
                          {article.category}
                        </Badge>
                        <h4 className="font-medium group-hover:text-accent transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </div>
  )
}