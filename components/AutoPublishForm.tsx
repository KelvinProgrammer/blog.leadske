// components/AutoPublishForm.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  Globe,
  Maximize2,
  Minimize2,
  Minus,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Send
} from "lucide-react"
import LinkNext from "next/link"

const lowlight = createLowlight(common)

interface ScheduledBlog {
  id?: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  featured_image?: string | null
  video_url?: string | null
  category: string
  scheduled_at?: string | null
  require_approval?: boolean
  status?: string
}

interface AutoPublishFormProps {
  userId: string
  initialData?: ScheduledBlog
  onSuccess?: () => void
}

export function AutoPublishForm({ userId, initialData, onSuccess }: AutoPublishFormProps) {
  const router = useRouter()

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [category, setCategory] = useState(initialData?.category || "Technology")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || "")
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "")

  // Scheduling & Approval Fields
  const getDefaultScheduledTime = () => {
    if (initialData?.scheduled_at) {
      const date = new Date(initialData.scheduled_at)
      return date.toISOString().slice(0, 16)
    }
    // Default to 1 hour from now
    const date = new Date(Date.now() + 60 * 60 * 1000)
    return date.toISOString().slice(0, 16)
  }

  const [scheduledAt, setScheduledAt] = useState(getDefaultScheduledTime())
  const [publishBehavior, setPublishBehavior] = useState<"auto" | "approval">(
    initialData?.require_approval ? "approval" : "auto"
  )

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
        placeholder: 'Write your scheduled blog content here...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
    immediatelyRender: false,
  })

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!initialData) {
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
      const fileName = `sched-${Math.random().toString(36).substring(2)}.${fileExt}`
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

  const handleEditorImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setEditorUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `editor-sched-${Math.random().toString(36).substring(2)}.${fileExt}`
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

  const handleSaveScheduledPost = async () => {
    if (!title || !editor?.getHTML() || !slug || !scheduledAt) {
      setError("Please fill in all required fields (title, slug, content, and scheduled date/time)")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const scheduledIso = new Date(scheduledAt).toISOString()
      const requireApproval = publishBehavior === "approval"

      const blogData = {
        title,
        slug,
        content: editor.getHTML(),
        excerpt: excerpt || null,
        featured_image: featuredImage || null,
        video_url: videoUrl || null,
        category,
        status: "scheduled",
        scheduled_at: scheduledIso,
        require_approval: requireApproval,
        author_id: userId,
        published_at: null,
        updated_at: new Date().toISOString(),
      }

      if (initialData?.id) {
        const { error: updateError } = await supabase.from("blogs").update(blogData).eq("id", initialData.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("blogs").insert(blogData)
        if (insertError) throw insertError
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard/autopublish")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving scheduled blog post")
    } finally {
      setIsSaving(false)
    }
  }

  if (!editor) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  const MenuBar = () => (
    <div className="border-b bg-muted/40 p-2 flex flex-wrap items-center gap-1.5">
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
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button 
        type="button"
        size="sm" 
        variant={editor.isActive('link') ? 'secondary' : 'ghost'} 
        className="h-8 p-2 text-xs flex items-center gap-1"
        onClick={openLinkModal}
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
      >
        <ImageIcon className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Add Image</span>
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button 
        type="button"
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button 
        type="button"
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().redo().run()}
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
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Blog Details & Target Destination
          </CardTitle>
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
              <Label htmlFor="category">Category / Target Destination *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology (/technology)</SelectItem>
                  <SelectItem value="Culture">Culture (/culture)</SelectItem>
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
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted/40 text-sm">
                <span>{calculateReadTime()} min read</span>
              </div>
            </div>
          </div>

          {/* Target Route Callout Banner */}
          <div className="rounded-lg bg-primary/5 p-3.5 border border-primary/20 text-xs flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span>This article will be routed & published to:</span>
            <span className="font-semibold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
              {getTargetCategorySlug()}/{slug || "your-slug"}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Brief description (recommended for SEO & card previews)</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief description of your article"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              maxLength={160}
            />
            <div className="text-xs text-muted-foreground text-right">
              {excerpt.length}/160 characters
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
              <div className="mt-2 relative w-fit">
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

      {/* WYSIWYG Content Editor */}
      <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none border-none overflow-y-auto bg-background p-6 flex flex-col h-screen" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-semibold">Content * (WYSIWYG Editor)</CardTitle>
            <p className="text-xs text-muted-foreground">
              Format your text, add embedded images, links, and website preview cards.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t flex-1 flex flex-col">
          <MenuBar />
          <EditorContent editor={editor} className="flex-1 min-h-[400px]" />
        </CardContent>
      </Card>

      {/* Schedule Execution & Approval Mode Config */}
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Execution & Approval Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="scheduled-time">Scheduled Date & Time for Execution *</Label>
            <Input
              id="scheduled-time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="max-w-md font-mono"
            />
            <p className="text-xs text-muted-foreground">
              When the time arrives, the background cron job will execute the post action.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-base font-semibold">Publish Behavior / Approval Mode *</Label>
            <RadioGroup
              value={publishBehavior}
              onValueChange={(val) => setPublishBehavior(val as "auto" | "approval")}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors cursor-pointer ${publishBehavior === 'auto' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <RadioGroupItem value="auto" id="behavior-auto" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="behavior-auto" className="font-semibold cursor-pointer flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Auto-Publish (Automatic)
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cron job will automatically convert status to <strong>Published</strong> and make the article live on its target route when scheduled time arrives.
                  </p>
                </div>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors cursor-pointer ${publishBehavior === 'approval' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <RadioGroupItem value="approval" id="behavior-approval" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="behavior-approval" className="font-semibold cursor-pointer flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Wait Approval Before Publish
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cron job will flag post as <strong>Pending Approval</strong> when scheduled time arrives, requiring you to manually click "Approve & Publish".
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200">
          {error}
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex gap-4">
        <LinkNext href="/dashboard/autopublish" className="flex-1">
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
        </LinkNext>
        <Button 
          onClick={handleSaveScheduledPost} 
          disabled={isSaving} 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {initialData ? "Update Scheduled Post" : "Create Scheduled Post Card"}
        </Button>
      </div>

      {/* IMAGE DIALOG MODAL */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Add Image to Content
            </DialogTitle>
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
                {editorUploading && <Loader2 className="h-4 w-4 animate-spin text-primary mt-1" />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="editor-alt-upload">Alt Text (Optional)</Label>
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
                  placeholder="https://..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
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

      {/* LINK & WEBSITE CARD MODAL */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Add Link or Website Preview Card
            </DialogTitle>
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
                  Open link in a new tab (`target="_blank"`)
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label htmlFor="card-url">Website URL *</Label>
                <Input
                  id="card-url"
                  placeholder="https://..."
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-title">Title</Label>
                <Input
                  id="card-title"
                  placeholder="Website Title"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                />
              </div>
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
