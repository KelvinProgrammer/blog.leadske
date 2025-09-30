import { Button } from "@/components/ui/button"

export default function Newsletter() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-serif font-light text-foreground mb-4">Stay Informed</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
          Get the most important stories delivered to your inbox every morning. Join over 100,000 readers who trust
          Pulse for their daily news.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <Button className="px-8">Subscribe</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">No spam, unsubscribe at any time.</p>
      </div>
    </section>
  )
}
