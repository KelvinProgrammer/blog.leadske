export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="font-serif text-2xl font-light text-foreground mb-4">pulse.</div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Independent journalism for the digital age. Delivering truth, context, and insight to readers worldwide.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-4">Sections</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/world" className="hover:text-foreground transition-colors">
                  World News
                </a>
              </li>
              <li>
                <a href="/politics" className="hover:text-foreground transition-colors">
                  Politics
                </a>
              </li>
              <li>
                <a href="/business" className="hover:text-foreground transition-colors">
                  Business
                </a>
              </li>
              <li>
                <a href="/technology" className="hover:text-foreground transition-colors">
                  Technology
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Pulse News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
