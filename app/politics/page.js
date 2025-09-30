"use client"

import { useState } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { articles } from "../../lib/articles"

export default function PoliticsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 6

  const politicsNews = articles.politics || []

  // Calculate pagination
  const totalPages = Math.ceil(politicsNews.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentArticles = politicsNews.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-light text-foreground mb-4">Politics</h1>
          <div className="w-24 h-px bg-accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {currentArticles.map((article, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <img
                src={`/.jpg?height=300&width=600&query=${encodeURIComponent(article.image)}`}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs text-accent font-medium tracking-wide">{article.category}</span>
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                </div>
                <h2 className="text-xl font-serif font-light text-foreground mb-3 leading-tight">{article.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{article.excerpt}</p>
                <Link href={`/politics/${article.slug}`}>
                  <Button variant="ghost" className="group p-0 h-auto">
                    Read Full Article
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>

      <Footer />
    </div>
  )
}
