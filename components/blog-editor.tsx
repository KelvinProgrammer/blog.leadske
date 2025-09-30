"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  category: string
  status: string
}

interface BlogEditorProps {
  userId: string
  blog?: Blog
  initialTitle?: string
  initialContent?: string
}

export function BlogEditor({ userId, blog, initialTitle, initialContent }: BlogEditorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [title, setTitle] = useState(blog?.title || initialTitle || "")
  const [slug, setSlug] = useState(blog?.slug || "")
  const [content, setContent] = useState(blog?.content || initialContent || "")
  const [excerpt, setExcerpt] = useState(blog?.excerpt || "")
  const [category, setCategory] = useState(blog?.category || "Technology")
  const [featuredImage, setFeaturedImage] = useState(blog?.featured_image || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const titleParam = searchParams.get("title")
    const contentParam = searchParams.get("content")

    if (titleParam && !blog) {
      setTitle(titleParam)
      setSlug(generateSlug(titleParam))
    }
    if (contentParam && !blog) {
      setContent(contentParam)
    }
  }, [searchParams, blog])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!blog) {
      setSlug(generateSlug(value))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `blog-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("blog-images").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(filePath)

      setFeaturedImage(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (status: "draft" | "published") => {
    if (!title || !content || !slug) {
      setError("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const blogData = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featured_image: featuredImage || null,
        category,
        status,
        author_id: userId,
        published_at: status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      if (blog) {
        // Update existing blog
        const { error: updateError } = await supabase.from("blogs").update(blogData).eq("id", blog.id)

        if (updateError) throw updateError
      } else {
        // Create new blog
        const { error: insertError } = await supabase.from("blogs").insert(blogData)

        if (insertError) throw insertError
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving blog")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blog Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" placeholder="blog-post-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief description of your blog post"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featured-image">Featured Image</Label>
            <div className="flex gap-4">
              <Input
                id="featured-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
            {featuredImage && (
              <div className="mt-2">
                <img
                  src={featuredImage || "/placeholder.svg"}
                  alt="Featured"
                  className="h-40 w-auto rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Content *</CardTitle>
          <Link href={`/dashboard/ai-writer${blog ? `?blogId=${blog.id}` : ""}`}>
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Writer
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}

      <div className="flex gap-4">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Cancel
          </Button>
        </Link>
        <Button onClick={() => handleSave("draft")} disabled={isSaving} className="flex-1" variant="secondary">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save as Draft
        </Button>
        <Button onClick={() => handleSave("published")} disabled={isSaving} className="flex-1">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Publish
        </Button>
      </div>
    </div>
  )
}
