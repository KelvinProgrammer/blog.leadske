// app/dashboard/new/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TipTapBlogEditor } from "@/components/TipTapBlogEditor"

export default async function NewBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; content?: string }>
}) {
  const { title, content } = await searchParams
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-light">Create New Blog Post</h1>
              <p className="text-muted-foreground mt-1">
                Write, format, and optimize your content for maximum reach
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <TipTapBlogEditor userId={user.id} initialTitle={title} initialContent={content} />
      </main>
    </div>
  )
}