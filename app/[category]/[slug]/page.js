// app/[category]/[slug]/page.js
import Header from "../../../components/Header"
import Footer from "../../../components/Footer"
import ShareButtons from "../../../components/ShareButtons"
import CommentSection from "../../../components/CommentSection"
import RelatedStories from "../../../components/RelatedStories"
import TopStories from "../../../components/TopStories"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar } from "lucide-react"
import { getArticleBySlug, getRelatedArticles, getTopStories } from "../../../lib/articles"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ArticlePage({ params }) {
  const { category, slug } = await params
  const supabase = await createClient()

  // First try fetching from Supabase
  const { data: supabaseBlog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  let article = null

  if (supabaseBlog) {
    article = {
      title: supabaseBlog.title,
      category: supabaseBlog.category,
      author: supabaseBlog.author || "Editorial Team",
      date: new Date(supabaseBlog.published_at || supabaseBlog.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      readTime: `${Math.max(1, Math.ceil((supabaseBlog.content || "").split(/\s+/).length / 200))} min read`,
      excerpt: supabaseBlog.excerpt,
      content: supabaseBlog.content,
      image: supabaseBlog.featured_image,
      isSupabaseImage: true,
      videoUrl: supabaseBlog.video_url,
    }
  } else {
    article = getArticleBySlug(category, slug)
  }

  if (!article) {
    notFound()
  }

  const relatedArticles = getRelatedArticles(category, slug)
  const topStories = getTopStories()

  const isHtml = typeof article.content === "string" && (article.content.trim().startsWith("<") || /<[a-z][\s\S]*>/i.test(article.content))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-8">
            {/* Article Header */}
            <div className="mb-8">
              <Badge className="mb-4">{article.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6 leading-tight">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>
              )}

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {article.image && (
              <div className="mb-8">
                <img
                  src={article.isSupabaseImage ? article.image : `/.jpg?height=600&width=1200&query=${encodeURIComponent(article.image)}`}
                  alt={article.title}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            )}

            {/* Video if available */}
            {article.videoUrl && (
              <div className="mb-8">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">▶️</div>
                    <p className="text-sm text-muted-foreground">{article.videoUrl}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            {isHtml ? (
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-light prose-a:text-accent mb-8"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="prose prose-lg max-w-none mb-8">
                {article.content ? article.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-foreground leading-relaxed mb-6">
                    {paragraph}
                  </p>
                )) : null}
              </div>
            )}

            {/* Share Buttons */}
            <ShareButtons title={article.title} />

            {/* Comment Section */}
            <CommentSection articleSlug={slug} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              <TopStories stories={topStories} />
              <RelatedStories articles={relatedArticles} category={category} />
            </div>
          </aside>
        </div>
      </article>

      <Footer />
    </div>
  )
}
