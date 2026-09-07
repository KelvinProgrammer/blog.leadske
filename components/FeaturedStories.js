import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function FeaturedStories() {
  let mainStory = null
  let sideStories = []

  try {
    const supabase = await createClient()
    const { data: blogs } = await supabase
      .from("blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4)

    if (blogs && blogs.length > 0) {
      const formatted = blogs.map((b) => ({
        id: b.id,
        slug: b.slug,
        category: (b.category || "General").toUpperCase(),
        date: new Date(b.published_at || b.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        title: b.title,
        excerpt: b.excerpt || (b.content ? b.content.replace(/<[^>]*>/g, "").slice(0, 150) + "..." : ""),
        image: b.featured_image || "/climate-change-protest-with-activists.jpg",
      }))

      mainStory = formatted[0]
      sideStories = formatted.slice(1, 4)
    }
  } catch (err) {
    console.warn("FeaturedStories live fetch error:", err.message)
  }

  if (!mainStory) {
    mainStory = {
      slug: "climate-summit",
      category: "CLIMATE",
      date: "DEC 15, 2024",
      title: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
      excerpt: "World leaders unite in unprecedented commitment to reduce global carbon emissions by 50% within the next decade, marking a pivotal moment in climate action.",
      image: "/climate-change-protest-with-activists.jpg",
    }
  }

  if (sideStories.length === 0) {
    sideStories = [
      {
        slug: "ai-revolution-healthcare",
        category: "TECHNOLOGY",
        date: "DEC 14, 2024",
        title: "AI Revolution Transforms Healthcare Diagnostics",
        excerpt: "Machine learning algorithms now detect diseases with 95% accuracy, revolutionizing early intervention strategies.",
        image: "/--story-image-.jpg",
      },
      {
        slug: "sustainable-energy-investments",
        category: "BUSINESS",
        date: "DEC 13, 2024",
        title: "Sustainable Energy Investments Reach Record High",
        excerpt: "Global renewable energy funding surpasses $2 trillion, signaling massive shift toward clean technology.",
        image: "/--story-image-.jpg",
      },
      {
        slug: "digital-art-movement",
        category: "CULTURE",
        date: "DEC 12, 2024",
        title: "Digital Art Movement Redefines Creative Expression",
        excerpt: "Virtual galleries and NFT platforms create new opportunities for artists worldwide to showcase their work.",
        image: "/--story-image-.jpg",
      },
    ]
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-light text-foreground mb-4">Today&apos;s Headlines</h2>
          <div className="w-24 h-px bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Story */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-0 shadow-sm">
              <div
                className="h-80 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${mainStory.image}')`,
                }}
              />
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs text-accent font-medium tracking-wide">{mainStory.category}</span>
                  <span className="text-xs text-muted-foreground">{mainStory.date}</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-foreground mb-4 leading-tight">
                  <Link href={`/blog/${mainStory.slug}`} className="hover:underline">
                    {mainStory.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {mainStory.excerpt}
                </p>
                <Link href={`/blog/${mainStory.slug}`}>
                  <Button variant="ghost" className="group p-0 h-auto">
                    Continue Reading
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Side Stories */}
          <div className="space-y-6">
            {sideStories.map((story, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="h-32 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${story.image}')`,
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs text-accent font-medium tracking-wide">{story.category}</span>
                    <span className="text-xs text-muted-foreground">{story.date}</span>
                  </div>
                  <h4 className="text-lg font-serif font-light text-foreground mb-3 leading-tight">
                    <Link href={`/blog/${story.slug}`} className="hover:underline">
                      {story.title}
                    </Link>
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{story.excerpt}</p>
                  <Link href={`/blog/${story.slug}`}>
                    <Button variant="ghost" size="sm" className="group p-0 h-auto">
                      Read More
                      <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
