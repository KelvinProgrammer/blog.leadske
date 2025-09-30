"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Reply } from "lucide-react"

export default function CommentSection({ articleSlug }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Alex Johnson",
      date: "2 hours ago",
      content: "Great article! This really provides valuable insights into the topic.",
      likes: 12,
    },
    {
      id: 2,
      author: "Maria Garcia",
      date: "5 hours ago",
      content: "I appreciate the thorough research and balanced perspective presented here.",
      likes: 8,
    },
    {
      id: 3,
      author: "David Kim",
      date: "1 day ago",
      content: "This is exactly the kind of in-depth analysis we need more of. Thank you for sharing!",
      likes: 15,
    },
  ])

  const [newComment, setNewComment] = useState("")

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: "You",
        date: "Just now",
        content: newComment,
        likes: 0,
      }
      setComments([comment, ...comments])
      setNewComment("")
    }
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-serif font-light text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmitComment}>
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-4 min-h-[100px]"
          />
          <Button type="submit">Post Comment</Button>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 bg-accent flex items-center justify-center text-accent-foreground">
                {comment.author.charAt(0)}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-foreground">{comment.author}</span>
                  <span className="text-sm text-muted-foreground">{comment.date}</span>
                </div>
                <p className="text-foreground leading-relaxed mb-4">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {comment.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
