"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Copy, Check } from "lucide-react"
import Link from "next/link"

interface Blog {
  id: string
  title: string
  content: string
}

interface AIBlogWriterProps {
  userId: string
  blog?: Blog | null
}

export function AIBlogWriter({ userId, blog }: AIBlogWriterProps) {
  const router = useRouter()
  const [topic, setTopic] = useState(blog?.title || "")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [keywords, setKeywords] = useState("")
  const [generatedContent, setGeneratedContent] = useState(blog?.content || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic) {
      setError("Please enter a topic")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedContent("")

    try {
      const response = await fetch("/api/generate-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          tone,
          length,
          keywords,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No reader available")

      let content = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        content += chunk
        setGeneratedContent(content)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating content")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleUseContent = () => {
    const params = new URLSearchParams({
      title: topic,
      content: generatedContent,
    })

    if (blog) {
      router.push(`/dashboard/edit/${blog.id}?${params.toString()}`)
    } else {
      router.push(`/dashboard/new?${params.toString()}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Blog Content</CardTitle>
          <CardDescription>Provide details about your blog post and let AI create content for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Title *</Label>
            <Input
              id="topic"
              placeholder="e.g., The Future of Artificial Intelligence"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (300-500 words)</SelectItem>
                  <SelectItem value="medium">Medium (500-800 words)</SelectItem>
                  <SelectItem value="long">Long (800-1200 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (optional)</Label>
            <Input
              id="keywords"
              placeholder="e.g., AI, machine learning, technology"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>

          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950">{error}</div>}
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Content</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="sm" onClick={handleUseContent}>
                  Use This Content
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <Textarea value={generatedContent} readOnly rows={20} className="font-mono" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Link href={blog ? `/dashboard/edit/${blog.id}` : "/dashboard"}>
          <Button variant="outline">Back to {blog ? "Editor" : "Dashboard"}</Button>
        </Link>
      </div>
    </div>
  )
}
