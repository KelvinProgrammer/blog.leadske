// app/api/cron/publish/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client for background cron operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export async function GET(request: Request) {
  return handleCronPublish(request)
}

export async function POST(request: Request) {
  return handleCronPublish(request)
}

async function handleCronPublish(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase environment variables missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const nowIso = new Date().toISOString()

    // Query all scheduled blogs due for execution
    const { data: dueBlogs, error: fetchError } = await supabase
      .from("blogs")
      .select("*")
      .in("status", ["scheduled", "pending_approval"])
      .lte("scheduled_at", nowIso)

    if (fetchError) {
      console.error("[Cron Publish Error]:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!dueBlogs || dueBlogs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled posts due for publication at this time.",
        publishedCount: 0,
        pendingApprovalCount: 0,
      })
    }

    let publishedCount = 0
    let pendingApprovalCount = 0
    const processedBlogs = []

    for (const blog of dueBlogs) {
      if (blog.require_approval) {
        // Flag as pending approval if approval mode is active
        if (blog.status !== "pending_approval") {
          const { error: updateError } = await supabase
            .from("blogs")
            .update({ status: "pending_approval", updated_at: nowIso })
            .eq("id", blog.id)

          if (!updateError) {
            pendingApprovalCount++
            processedBlogs.push({ id: blog.id, title: blog.title, status: "pending_approval" })
          }
        }
      } else {
        // Auto-Publish
        const { error: publishError } = await supabase
          .from("blogs")
          .update({
            status: "published",
            published_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", blog.id)

        if (!publishError) {
          publishedCount++
          processedBlogs.push({ id: blog.id, title: blog.title, status: "published" })
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: nowIso,
      publishedCount,
      pendingApprovalCount,
      processedBlogs,
    })
  } catch (err) {
    console.error("[Cron Publish Exception]:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Cron Error" },
      { status: 500 }
    )
  }
}
