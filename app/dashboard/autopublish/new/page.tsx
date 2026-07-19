// app/dashboard/autopublish/new/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AutoPublishForm } from "@/components/AutoPublishForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewAutoPublishPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/autopublish">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Auto-Publish Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-serif font-light">Schedule New Auto-Publish Post</h1>
              <p className="text-muted-foreground mt-1">
                Configure article content, scheduled execution time, and approval settings.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <AutoPublishForm userId={user.id} />
      </main>
    </div>
  )
}
