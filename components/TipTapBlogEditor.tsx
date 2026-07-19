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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  AlignJustify,
  Link2,
  ImageIcon,
  Youtube,
  Globe,
  Upload,
  Maximize2,
  Minimize2,
  Minus,
  ExternalLink,
  PlusCircle
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
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Image Modal state
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [imageAltInput, setImageAltInput] = useState("")
  const [editorUploading, setEditorUploading] = useState(false)

  // Link Modal state
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrlInput, setLinkUrlInput] = useState("")
  const [linkTextInput, setLinkTextInput] = useState("")
  const [linkNewTab, setLinkNewTab] = useState(true)
  const [linkType, setLinkType] = useState<"hyperlink" | "card">("hyperlink")
  const [cardTitle, setCardTitle] = useState("")
  const [cardDescription, setCardDescription] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline font-medium hover:text-primary/80 transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 shadow-sm border',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your story here... Add rich text, embedded links, and images.',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: blog?.content || (initialContent ? (marked.parse(initialContent, { async: false }) as string) : ''),
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[450px] p-6',
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

  // Handle uploading image directly to Content Editor via Modal
  const handleEditorImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setEditorUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `editor-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `blog-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("blog-images").upload(filePath, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(filePath)

      editor.chain().focus().setImage({ src: publicUrl, alt: imageAltInput || file.name }).run()
      setIsImageDialogOpen(false)
      setImageUrlInput("")
      setImageAltInput("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading image to editor")
    } finally {
      setEditorUploading(false)
    }
  }

  const handleInsertImageUrl = () => {
    if (imageUrlInput && editor) {
      editor.chain().focus().setImage({ src: imageUrlInput, alt: imageAltInput || "Blog Image" }).run()
      setIsImageDialogOpen(false)
      setImageUrlInput("")
      setImageAltInput("")
    }
  }

  const openLinkModal = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    const existingHref = editor.getAttributes('link').href || ""

    setLinkTextInput(selectedText)
    setLinkUrlInput(existingHref)
    setCardTitle(selectedText || "")
    setCardDescription("")
    setIsLinkDialogOpen(true)
  }

  const handleApplyLink = () => {
    if (!editor || !linkUrlInput) return

    let formattedUrl = linkUrlInput.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`
    }

    if (linkType === "hyperlink") {
      if (linkTextInput && editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${formattedUrl}" target="${linkNewTab ? '_blank' : '_self'}" rel="noopener noreferrer">${linkTextInput}</a>`)
          .run()
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: formattedUrl, target: linkNewTab ? '_blank' : '_self' })
          .run()
      }
    } else {
      // Insert rich website bookmark card
      try {
        const urlObj = new URL(formattedUrl)
        const domain = urlObj.hostname.replace('www.', '')
        const displayTitle = cardTitle || linkTextInput || domain
        const displayDesc = cardDescription || formattedUrl

        const cardHtml = `<div class="my-4 p-4 border rounded-xl bg-card hover:bg-accent/40 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-border shadow-sm"><div class="space-y-1"><div class="font-semibold text-foreground flex items-center gap-2"><span>${displayTitle}</span><span class="text-xs text-muted-foreground font-normal">(${domain})</span></div><p class="text-xs text-muted-foreground leading-relaxed">${displayDesc}</p></div><a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0">Visit Website <span aria-hidden="true">→</span></a></div><p></p>`

        editor.chain().focus().insertContent(cardHtml).run()
      } catch {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${formattedUrl}</a>`)
          .run()
      }
    }

    setIsLinkDialogOpen(false)
    setLinkUrlInput("")
    setLinkTextInput("")
    setCardTitle("")
    setCardDescription("")
  }

  const calculateReadTime = () => {
    const content = editor?.getText() || ''
    const wordCount = content.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / 200))
  }

  const getTargetCategorySlug = () => {
    const catLower = category.toLowerCase()
    if (catLower === "general blog" || catLower === "blog") return "/blog"
    return `/${catLower}`
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
    <div className="border-b bg-muted/40 p-2 flex flex-wrap items-center gap-1.5">
      {/* Headings */}
      <Select 
        value={
          editor.isActive('heading', { level: 1 }) ? 'h1' :
          editor.isActive('heading', { level: 2 }) ? 'h2' :
          editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
        } 
        onValueChange={(val) => {
          if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run()
          else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run()
          else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run()
          else editor.chain().focus().setParagraph().run()
        }}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p">Paragraph</SelectItem>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Basic Text Formatting */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Alignment */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists & Quotes */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('code') ? 'secondary' : 'ghost'}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Insert Horizontal Divider"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Link & Image Modals */}
      <Button 
        type="button"
        size="sm" 
        variant={editor.isActive('link') ? 'secondary' : 'ghost'} 
        className="h-8 p-2 text-xs flex items-center gap-1"
        onClick={openLinkModal}
        title="Add Link / Website Preview Card"
      >
        <Link2 className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Link / Website</span>
      </Button>
      
      <Button 
        type="button"
        size="sm" 
        variant="ghost" 
        className="h-8 p-2 text-xs flex items-center gap-1"
        onClick={() => setIsImageDialogOpen(true)}
        title="Add Image"
      >
        <ImageIcon className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Add Image</span>
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Undo/Redo */}
      <Button 
        type="button"
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button 
        type="button"
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Details & Target Destination</CardTitle>
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
                  onChange={(e) => setSlug(generateSlug(e.target.value))} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category / Target Section Page *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Culture">Culture (/culture)</SelectItem>
                      <SelectItem value="Technology">Technology (/technology)</SelectItem>
                      <SelectItem value="Business">Business (/business)</SelectItem>
                      <SelectItem value="Politics">Politics (/politics)</SelectItem>
                      <SelectItem value="World">World (/world)</SelectItem>
                      <SelectItem value="General Blog">General Blog (/blog)</SelectItem>
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
                  <Label>Estimated Reading Time</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-muted/40">
                    <span className="text-sm">{calculateReadTime()} min read</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Target Page Routing Banner */}
              <div className="rounded-lg bg-primary/5 p-3.5 border border-primary/20 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary shrink-0" />
                  <span>This article will be routed & published to:</span>
                  <span className="font-semibold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {getTargetCategorySlug()}/{slug || "your-slug"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description (recommended for SEO & card previews)"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{excerpt.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured-image">Featured Header Image</Label>
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
                  <div className="mt-2 relative group w-fit">
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="h-40 w-auto rounded-lg object-cover border"
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

          {/* WYSIWYG Editor Card */}
          <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none border-none overflow-y-auto bg-background p-6 flex flex-col h-screen" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span>Content * (WYSIWYG Editor)</span>
                  {isFullscreen && (
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Fullscreen Mode
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Use the toolbar below to insert images, links, websites, and custom formatting.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <LinkNext href={`/dashboard/ai-writer${blog ? `?blogId=${blog.id}` : ""}`}>
                  <Button variant="outline" size="sm">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    AI Writer
                  </Button>
                </LinkNext>
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t flex-1 flex flex-col">
              <MenuBar />
              <EditorContent editor={editor} className="flex-1 min-h-[450px]" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Optimization</CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimize your blog for search engines and social media previews
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
                  placeholder="blog, culture, technology, news"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
              </div>

              <div className="rounded-lg border p-4 bg-muted/40">
                <h4 className="font-medium mb-2 text-sm">Google Search Preview</h4>
                <div className="space-y-1 font-sans">
                  <div className="text-lg text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">
                    {metaTitle || title || 'Your Article Title'}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-500 font-mono">
                    yourdomain.com{getTargetCategorySlug()}/{slug || 'your-slug'}
                  </div>
                  <div className="text-sm text-muted-foreground leading-snug">
                    {metaDescription || excerpt || 'Your article description will appear here in search engine results...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Article Full Preview</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target Page Route: <span className="font-mono text-primary font-semibold">{getTargetCategorySlug()}/{slug || 'your-slug'}</span>
                  </p>
                </div>
                <div className="text-xs bg-muted px-3 py-1.5 rounded-full font-medium">
                  Category: {category}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{category}</span>
                  <h1 className="text-4xl font-serif font-light text-foreground mt-2 mb-4 leading-tight">
                    {title || 'Untitled Story'}
                  </h1>
                  {excerpt && (
                    <p className="text-lg text-muted-foreground leading-relaxed italic border-l-2 pl-4 py-1">
                      {excerpt}
                    </p>
                  )}
                </div>

                {featuredImage && (
                  <div className="overflow-hidden rounded-xl border">
                    <img src={featuredImage} alt={title} className="w-full h-auto object-cover max-h-[450px]" />
                  </div>
                )}

                <div 
                  className="prose prose-lg dark:prose-invert max-w-none py-4" 
                  dangerouslySetInnerHTML={{ __html: editor.getHTML() }} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200">
          {error}
        </div>
      )}

      {/* Form Action Buttons */}
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
          Publish to {category}
        </Button>
      </div>

      {/* IMAGE INSERT MODAL DIALOG */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Add Image to Content
            </DialogTitle>
            <DialogDescription>
              Upload an image from your computer or insert an image URL.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label htmlFor="editor-file-input">Choose Image File</Label>
                <Input
                  id="editor-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleEditorImageFileUpload}
                  disabled={editorUploading}
                />
                {editorUploading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Uploading image to storage...</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="editor-alt-upload">Alt Text / Caption (Optional)</Label>
                <Input
                  id="editor-alt-upload"
                  placeholder="Image description"
                  value={imageAltInput}
                  onChange={(e) => setImageAltInput(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label htmlFor="editor-url-input">Image URL *</Label>
                <Input
                  id="editor-url-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editor-alt-url">Alt Text / Caption (Optional)</Label>
                <Input
                  id="editor-alt-url"
                  placeholder="Image description"
                  value={imageAltInput}
                  onChange={(e) => setImageAltInput(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleInsertImageUrl} disabled={!imageUrlInput}>
                  Insert Image
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* LINK & WEBSITE PREVIEW EMBED MODAL DIALOG */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Add Link or Website Preview Card
            </DialogTitle>
            <DialogDescription>
              Insert a standard hyperlink or an interactive website bookmark preview card into your article.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={linkType} onValueChange={(val) => setLinkType(val as "hyperlink" | "card")} className="w-full mt-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hyperlink">Standard Link</TabsTrigger>
              <TabsTrigger value="card">Website Preview Card</TabsTrigger>
            </TabsList>

            <TabsContent value="hyperlink" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label htmlFor="link-url">Target URL *</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-text">Display Text (Optional)</Label>
                <Input
                  id="link-text"
                  placeholder="Clickable link text"
                  value={linkTextInput}
                  onChange={(e) => setLinkTextInput(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="new-tab"
                  checked={linkNewTab}
                  onCheckedChange={(chk) => setLinkNewTab(!!chk)}
                />
                <Label htmlFor="new-tab" className="text-sm font-normal cursor-pointer">
                  Open link in a new browser tab (`target="_blank"`)
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label htmlFor="card-url">Website URL *</Label>
                <Input
                  id="card-url"
                  placeholder="https://techcrunch.com/article..."
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-title">Website / Article Title</Label>
                <Input
                  id="card-title"
                  placeholder="e.g. Official Website or Article Title"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-desc">Description / Excerpt</Label>
                <Textarea
                  id="card-desc"
                  placeholder="Brief description of the linked website or source"
                  value={cardDescription}
                  onChange={(e) => setCardDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Preview Box inside modal */}
              {linkUrlInput && (
                <div className="rounded-lg border p-3 bg-muted/40 text-xs space-y-1">
                  <span className="font-semibold text-muted-foreground">Live Card Preview:</span>
                  <div className="p-3 border rounded-lg bg-card flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">{cardTitle || linkTextInput || 'Website Title'}</div>
                      <div className="text-muted-foreground line-clamp-1">{cardDescription || linkUrlInput}</div>
                    </div>
                    <span className="text-primary font-medium shrink-0">Visit Website →</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyLink} disabled={!linkUrlInput}>
              Apply Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}