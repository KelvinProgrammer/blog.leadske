import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export default function TopStories({ stories }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-serif font-light text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-accent" />
        Top Stories
      </h3>
      <div className="space-y-4">
        {stories.map((story, index) => (
          <Link key={index} href={`/${story.categorySlug}/${story.slug}`} className="block group">
            <div className="flex gap-3">
              <span className="text-2xl font-serif text-accent">{index + 1}</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-tight mb-1">
                  {story.title}
                </h4>
                <p className="text-xs text-muted-foreground">{story.category}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
