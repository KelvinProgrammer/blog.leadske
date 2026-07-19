import { Button } from "@/components/ui/button"
import { Menu, Search, Bell } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="font-serif text-2xl font-light text-foreground">
              pulse.
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/world" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                World
              </Link>
              <Link href="/politics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Politics
              </Link>
              <Link href="/business" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Business
              </Link>
              <Link href="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Technology
              </Link>
              <Link href="/culture" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Culture
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Link href="/auth/login">
                <Button size="sm" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
