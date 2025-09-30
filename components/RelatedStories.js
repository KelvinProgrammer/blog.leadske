import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers } from "lucide-react"
import Link from "next/link"

export default function RelatedStories({ articles, category }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-serif font-light text-foreground mb-4 flex items-center gap-2">
        <Layers className="h-5 w-5 text-accent" />
        Related Stories
      </h3>
      <div className="space-y-6">
        {articles.map((article, index) => (
          <Link key={index} href={`/${category}/${article.slug}`} className="block group">
            <div className="space-y-2">
              <img
                src={`/.jpg?height=200&width=400&query=${encodeURIComponent(article.image)}`}
                alt={article.title}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Badge variant="secondary" className="text-xs">
                {article.category}
              </Badge>
              <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-tight">
                {article.title}
              </h4>
              <p className="text-xs text-muted-foreground">{article.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
