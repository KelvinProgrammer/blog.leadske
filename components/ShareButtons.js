"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react"
import { useState } from "react"

export default function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="border-y border-border py-6 my-8">
      <h3 className="text-sm font-medium text-foreground mb-4">Share this article</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, "_blank")
          }
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")}
        >
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`, "_blank")}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
    </div>
  )
}
