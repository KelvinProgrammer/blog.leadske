import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function HeroSection() {
  let heroStory = null

  try {
    const supabase = await createClient()
    const { data: blogs } = await supabase
      .from("blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)

    if (blogs && blogs.length > 0) {
      const b = blogs[0]
      heroStory = {
        title: b.title,
        excerpt: b.excerpt || (b.content ? b.content.replace(/<[^>]*>/g, "").slice(0, 160) + "..." : ""),
        slug: b.slug,
        category: (b.category || "BREAKING NEWS").toUpperCase(),
        image: b.featured_image || "/modern-newsroom.png",
      }
    }
  } catch (err) {
    console.warn("HeroSection live fetch error:", err.message)
  }

  if (!heroStory) {
    heroStory = {
      title: "The Future of Digital Growth & B2B Lead Intelligence",
      excerpt: "Exploring how AI-driven automation, verified contact enrichment, and multi-channel marketing are reshaping business growth.",
      slug: "email-marketing-workflows",
      category: "FEATURED STORY",
      image: "/modern-newsroom.png",
    }
  }

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 z-10" />
      <div
        className="h-[70vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url('${heroStory.image}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="text-emerald-400 text-sm font-semibold mb-4 tracking-wider uppercase">
                {heroStory.category}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-6 leading-tight text-balance">
                {heroStory.title}
              </h1>
              <p className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl">
                {heroStory.excerpt}
              </p>
              <Link href={`/blog/${heroStory.slug}`}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium group">
                  Read Full Story
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
