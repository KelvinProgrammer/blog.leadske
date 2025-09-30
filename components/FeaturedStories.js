import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function FeaturedStories() {
  const sideStories = [
    {
      category: "TECHNOLOGY",
      date: "DEC 14, 2024",
      title: "AI Revolution Transforms Healthcare Diagnostics",
      excerpt:
        "Machine learning algorithms now detect diseases with 95% accuracy, revolutionizing early intervention strategies.",
      image: "medical AI technology with doctors using digital interfaces",
    },
    {
      category: "BUSINESS",
      date: "DEC 13, 2024",
      title: "Sustainable Energy Investments Reach Record High",
      excerpt:
        "Global renewable energy funding surpasses $2 trillion, signaling massive shift toward clean technology.",
      image: "solar panels and wind turbines in a modern energy facility",
    },
    {
      category: "CULTURE",
      date: "DEC 12, 2024",
      title: "Digital Art Movement Redefines Creative Expression",
      excerpt:
        "Virtual galleries and NFT platforms create new opportunities for artists worldwide to showcase their work.",
      image: "digital art gallery with virtual reality headsets and modern displays",
    },
  ]

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-light text-foreground mb-4">Today's Headlines</h2>
          <div className="w-24 h-px bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Story */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-0 shadow-sm">
              <div
                className="h-80 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/climate-change-protest-with-activists.jpg')`,
                }}
              />
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs text-accent font-medium tracking-wide">CLIMATE</span>
                  <span className="text-xs text-muted-foreground">DEC 15, 2024</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-foreground mb-4 leading-tight">
                  Global Climate Summit Reaches Historic Agreement on Carbon Emissions
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  World leaders unite in unprecedented commitment to reduce global carbon emissions by 50% within the
                  next decade, marking a pivotal moment in climate action.
                </p>
                <Button variant="ghost" className="group p-0 h-auto">
                  Continue Reading
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
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
                    backgroundImage: `url('/--story-image-.jpg')`,
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs text-accent font-medium tracking-wide">{story.category}</span>
                    <span className="text-xs text-muted-foreground">{story.date}</span>
                  </div>
                  <h4 className="text-lg font-serif font-light text-foreground mb-3 leading-tight">{story.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{story.excerpt}</p>
                  <Button variant="ghost" size="sm" className="group p-0 h-auto">
                    Read More
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
