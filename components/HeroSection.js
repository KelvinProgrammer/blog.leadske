import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 z-10" />
      <div
        className="h-[70vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url('/modern-newsroom.png')`,
        }}
      >
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="text-accent-foreground/80 text-sm font-medium mb-4 tracking-wide">BREAKING NEWS</div>
              <h1 className="text-4xl md:text-6xl font-serif font-light text-accent-foreground mb-6 leading-tight text-balance">
                The Future of Journalism in the Digital Age
              </h1>
              <p className="text-lg text-accent-foreground/90 mb-8 leading-relaxed max-w-2xl">
                Exploring how technology is reshaping the way we consume and create news, from AI-powered reporting to
                immersive storytelling experiences.
              </p>
              <Button size="lg" variant="secondary" className="group">
                Read Full Story
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
