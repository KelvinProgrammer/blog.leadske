//app/blog/page.tsx
import { createClient } from "@/lib/supabase/server"
import { getAllArticles } from "@/lib/articles"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("blogs")
    .select("*, profiles(display_name)")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (category) {
    query = query.eq("category", category)
  }

  const { data: supabaseBlogs } = await query

  // Get static articles
  const staticArticles = getAllArticles()

  // Filter static articles by category if needed
  const filteredStaticArticles = category
    ? staticArticles.filter((article) => article.category.toLowerCase() === category.toLowerCase())
    : staticArticles

  // Combine and format both data sources
  const allBlogs = [
    ...(supabaseBlogs || []).map((blog) => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      category: blog.category,
      date: new Date(blog.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      slug: blog.slug,
      featured_image: blog.featured_image,
      isSupabase: true,
      sortDate: new Date(blog.published_at),
    })),
    ...filteredStaticArticles.map((article) => ({
      id: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      date: article.date,
      slug: article.slug,
      featured_image: `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(article.image)}`,
      isSupabase: false,
      categorySlug: article.categorySlug,
      sortDate: new Date(article.date),
    })),
  ].sort((a, b) => b.sortDate - a.sortDate)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="font-serif text-2xl font-light text-foreground mb-4 inline-block">
            pulse.
          </Link>
          <h1 className="text-4xl font-serif font-light text-foreground mb-2">
            {category ? `${category} Stories` : "All Stories"}
          </h1>
          <p className="text-muted-foreground">Discover the latest news and insights</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {allBlogs && allBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allBlogs.map((blog) => (
              <Card key={blog.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                {blog.featured_image && (
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${blog.featured_image}')`,
                    }}
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs text-accent font-medium tracking-wide">{blog.category.toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground">{blog.date}</span>
                  </div>
                  <h3 className="text-xl font-serif font-light text-foreground mb-3 leading-tight line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {blog.excerpt || "Read more to discover the full story"}
                  </p>
                  <Link href={blog.isSupabase ? `/blog/${blog.slug}` : `/article/${blog.categorySlug}/${blog.slug}`}>
                    <Button variant="ghost" size="sm" className="group p-0 h-auto">
                      Read More
                      <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No published stories found.</p>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
