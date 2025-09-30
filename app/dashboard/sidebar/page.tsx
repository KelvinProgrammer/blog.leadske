"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Sparkles,
  Settings,
  BarChart3,
  Folder,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface SidebarProps {
  stats?: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
  }
}

export function Sidebar({ stats }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem("sidebar-collapsed")
    if (collapsed) {
      setIsCollapsed(collapsed === "true")
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const navigation = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "All Posts",
          href: "/dashboard/posts",
          icon: FileText,
          badge: stats?.totalPosts,
        },
      ],
    },
    {
      title: "Create",
      items: [
        {
          name: "New Post",
          href: "/dashboard/new",
          icon: PlusCircle,
        },
        {
          name: "AI Writer",
          href: "/dashboard/ai-writer",
          icon: Sparkles,
        },
      ],
    },
    {
      title: "Manage",
      items: [
        {
          name: "Categories",
          href: "/dashboard/categories",
          icon: Folder,
        },
        {
          name: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
        },
        {
          name: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ]

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 z-50 h-8 w-8 rounded-full border bg-background"
        onClick={toggleSidebar}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 px-3">
          {navigation.map((section, index) => (
            <div key={section.title}>
              {index > 0 && <Separator className="my-4" />}
              {!isCollapsed && (
                <h4 className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isCollapsed ? "px-2" : "px-3",
                          isActive && "bg-secondary"
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.name}</span>
                            {item.badge !== undefined && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Stats Section */}
      {!isCollapsed && stats && (
        <div className="border-t p-4 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Quick Stats</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium">{stats.publishedPosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Drafts</span>
              <span className="font-medium">{stats.draftPosts}</span>
            </div>
            <div className="flex justify-between pt-1 border-t">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{stats.totalPosts}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}