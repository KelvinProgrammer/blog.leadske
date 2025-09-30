import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogEditor } from "@/components/blog-editor"

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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <BlogEditor userId={user.id} initialTitle={title} initialContent={content} />
      </main>
    </div>
  )
}
