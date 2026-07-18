// components/TipTapBlogEditor.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { marked } from 'marked'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  ImageIcon,
  Youtube,
  Eye
} from "lucide-react"
import LinkNext from "next/link"

const lowlight = createLowlight(common)

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  video_url: string | null
  category: string
  status: string
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
}

interface TipTapBlogEditorProps {
  userId: string
  blog?: Blog
  initialTitle?: string
  initialContent?: string
}

export function TipTapBlogEditor({ userId, blog, initialTitle, initialContent }: TipTapBlogEditorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Content fields
  const [title, setTitle] = useState(blog?.title || initialTitle || "")
  const [slug, setSlug] = useState(blog?.slug || "")
  const [excerpt, setExcerpt] = useState(blog?.excerpt || "")
  const [category, setCategory] = useState(blog?.category || "Technology")
  const [featuredImage, setFeaturedImage] = useState(blog?.featured_image || "")
  const [videoUrl, setVideoUrl] = useState(blog?.video_url || "")
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState(blog?.meta_title || "")
  const [metaDescription, setMetaDescription] = useState(blog?.meta_description || "")
  const [metaKeywords, setMetaKeywords] = useState(blog?.meta_keywords || "")
  
  // UI state
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing story...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: blog?.content || (initialContent ? marked.parse(initialContent, { async: false }) as string : ''),
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    const titleParam = searchParams.get("title")
    const contentParam = searchParams.get("content")

    if (titleParam && !blog) {
      setTitle(titleParam)
      setSlug(generateSlug(titleParam))
    }
    if (contentParam && !blog && editor) {
      const html = marked.parse(contentParam, { async: false }) as string
      editor.commands.setContent(html)
    }
  }, [searchParams, blog, editor])

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
      // Auto-generate meta title if empty
      if (!metaTitle) {
        setMetaTitle(value.slice(0, 60))
      }
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

  const addImageToEditor = () => {
    const url = prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = prompt('Enter URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const calculateReadTime = () => {
    const content = editor?.getText() || ''
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / 200)
  }

  const handleSave = async (status: "draft" | "published") => {
    if (!title || !editor?.getHTML() || !slug) {
      setError("Please fill in all required fields (title, slug, and content)")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const blogData = {
        title,
        slug,
        content: editor.getHTML(),
        excerpt: excerpt || null,
        featured_image: featuredImage || null,
        video_url: videoUrl || null,
        category,
        status,
        author_id: userId,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        meta_keywords: metaKeywords || null,
        published_at: status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      if (blog) {
        const { error: updateError } = await supabase.from("blogs").update(blogData).eq("id", blog.id)
        if (updateError) throw updateError
      } else {
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

  if (!editor) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  const MenuBar = () => (
    <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
      <Button
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button
        size="sm"
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button
        size="sm"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('code') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button size="sm" variant="ghost" onClick={addLink}>
        <Link2 className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={addImageToEditor}>
        <ImageIcon className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter an engaging title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input 
                  id="slug" 
                  placeholder="blog-post-slug" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">URL: /blog/{slug || 'your-slug'}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description (recommended for SEO)"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{excerpt.length}/160 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Reading Time</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                    <span className="text-sm">{calculateReadTime()} min read</span>
                  </div>
                </div>
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
                      src={featuredImage}
                      alt="Featured"
                      className="h-40 w-auto rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL (YouTube/Vimeo)</Label>
                <div className="flex gap-2">
                  <Youtube className="h-5 w-5 text-muted-foreground mt-2" />
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Content * (WYSIWYG Editor)</CardTitle>
              <LinkNext href={`/dashboard/ai-writer${blog ? `?blogId=${blog.id}` : ""}`}>
                <Button variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Writer
                </Button>
              </LinkNext>
            </CardHeader>
            <CardContent className="p-0">
              <MenuBar />
              <EditorContent editor={editor} className="min-h-[500px]" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Optimization</CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimize your blog for search engines and social media
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  placeholder="SEO-optimized title (50-60 characters)"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  placeholder="Compelling description for search results (150-160 characters)"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-keywords">Keywords (comma-separated)</Label>
                <Input
                  id="meta-keywords"
                  placeholder="blog, technology, tutorial"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Google Search Preview</h4>
                <div className="space-y-1">
                  <div className="text-lg text-blue-600">
                    {metaTitle || title || 'Your Blog Title'}
                  </div>
                  <div className="text-xs text-green-700">
                    yourdomain.com/blog/{slug || 'your-slug'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {metaDescription || excerpt || 'Your blog description will appear here...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <h1>{title || 'Untitled Blog Post'}</h1>
                {featuredImage && (
                  <img src={featuredImage} alt={title} className="rounded-lg" />
                )}
                <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <LinkNext href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
        </LinkNext>
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