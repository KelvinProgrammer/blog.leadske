import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogEditor } from "@/components/blog-editor"

export default async function EditBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ title?: string; content?: string }>
}) {
  const { id } = await params
  const { title: newTitle, content: newContent } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch the blog post
  const { data: blog, error: blogError } = await supabase.from("blogs").select("*").eq("id", id).single()

  if (blogError || !blog) {
    notFound()
  }

  // Ensure the user owns this blog
  if (blog.author_id !== user.id) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <BlogEditor userId={user.id} blog={blog} initialTitle={newTitle} initialContent={newContent} />
      </main>
    </div>
  )
}
