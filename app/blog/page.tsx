//app/blog/page.tsx
import { createClient } from "@/lib/supabase/server"
import { getAllArticles } from "@/lib/articles"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  // Fetch Supabase blogs
  const { data: supabaseBlogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  // Get static articles
  const staticArticles = getAllArticles()

  // Combine both sources FIRST, then filter by category
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
      author: blog.author,
      isSupabase: true,
      categorySlug: blog.category ? blog.category.toLowerCase() : "blog",
      sortDate: new Date(blog.published_at),
    })),
    ...staticArticles.map((article) => ({
      id: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      date: article.date,
      slug: article.slug,
      featured_image: `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(article.image)}`,
      author: article.author,
      isSupabase: false,
      categorySlug: article.categorySlug,
      sortDate: new Date(article.date),
    })),
  ]

  // Filter by category if specified
  const filteredBlogs = category
    ? allBlogs.filter((blog) => blog.category.toLowerCase() === category.toLowerCase())
    : allBlogs

  // Sort by date
  const sortedBlogs = filteredBlogs.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())

  // Get unique categories from all blogs
  const allCategories = [...new Set(allBlogs.map(blog => blog.category))]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="font-serif text-2xl font-light text-foreground mb-4 inline-block">
            pulse.
          </Link>
          <h1 className="text-4xl font-serif font-light text-foreground mb-2">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Stories` : "All Stories"}
          </h1>
          <p className="text-muted-foreground mb-6">Discover the latest news and insights</p>
          
          {/* Category Filter */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link href="/blog">
                <Badge 
                  variant={!category ? "default" : "outline"} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  All
                </Badge>
              </Link>
              {allCategories.map((cat) => (
                <Link key={cat} href={`/blog?category=${cat.toLowerCase()}`}>
                  <Badge 
                    variant={category?.toLowerCase() === cat.toLowerCase() ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors"
                  >
                    {cat}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sortedBlogs && sortedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBlogs.map((blog) => (
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
            <p className="text-muted-foreground mb-4">
              {category 
                ? `No stories found in the ${category} category.`
                : "No published stories found."
              }
            </p>
            <Link href={category ? "/blog" : "/"}>
              <Button variant="outline">
                {category ? "View All Stories" : "Back to Home"}
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}