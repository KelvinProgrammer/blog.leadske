import { createClient } from "@/lib/supabase/server"
import { getAllArticles } from "@/lib/articles"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function TechnologyPage() {
  const supabase = await createClient()

  // Fetch published blogs with Technology category from Supabase
  const { data: supabaseBlogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .eq("category", "Technology")
    .order("published_at", { ascending: false })

  // Get static articles
  const staticArticles = getAllArticles()
  const staticTechArticles = staticArticles.filter(
    (article) => article.category.toLowerCase() === "technology"
  )

  // Combine and format both data sources
  const allTechArticles = [
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
      image: blog.featured_image,
      isSupabase: true,
      sortDate: new Date(blog.published_at),
    })),
    ...staticTechArticles.map((article) => ({
      id: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      date: article.date,
      slug: article.slug,
      image: `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(article.image)}`,
      isSupabase: false,
      categorySlug: article.categorySlug,
      sortDate: new Date(article.date),
    })),
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-light text-foreground mb-4">Technology</h1>
          <div className="w-24 h-px bg-accent" />
        </div>

        {allTechArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {allTechArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs text-accent font-medium tracking-wide">
                      {article.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <h2 className="text-xl font-serif font-light text-foreground mb-3 leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt || "Read more to discover the full story"}
                  </p>
                  <Link
                    href={
                      article.isSupabase
                        ? `/blog/${article.slug}`
                        : `/article/${article.categorySlug}/${article.slug}`
                    }
                  >
                    <Button variant="ghost" className="group p-0 h-auto">
                      Read Full Article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No technology articles found.</p>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}