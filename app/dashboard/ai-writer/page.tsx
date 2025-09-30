import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AIBlogWriter } from "@/components/ai-blog-writer"

export default async function AIWriterPage({
  searchParams,
}: {
  searchParams: Promise<{ blogId?: string }>
}) {
  const { blogId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  let blog = null
  if (blogId) {
    const { data } = await supabase.from("blogs").select("*").eq("id", blogId).single()
    if (data && data.author_id === user.id) {
      blog = data
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">AI Blog Writer</h1>
          <p className="text-sm text-muted-foreground">Generate blog content with AI assistance</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AIBlogWriter userId={user.id} blog={blog} />
      </main>
    </div>
  )
}
