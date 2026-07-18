import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { topic, tone, length, keywords } = await req.json()

    const lengthMap = {
      short: "300-500 words",
      medium: "500-800 words",
      long: "800-1200 words",
    }

    const prompt = `Write a comprehensive blog post about "${topic}".

Tone: ${tone}
Length: ${lengthMap[length as keyof typeof lengthMap] || "500-800 words"}
${keywords ? `Keywords to include: ${keywords}` : ""}

Please write an engaging, well-structured blog post with:
- An attention-grabbing introduction
- Clear sections with subheadings
- Informative and valuable content
- A compelling conclusion
- Natural flow and readability

Format the content in markdown with proper headings (##, ###) and paragraphs.`

    const provider = process.env.AI_PROVIDER || "openai"
    let modelInstance

    if (provider === "deepseek") {
      const deepseekClient = createOpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY || "",
        baseURL: "https://api.deepseek.com/v1",
      })
      modelInstance = deepseekClient.chat("deepseek-chat")
    } else {
      const openaiClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
      })
      modelInstance = openaiClient("gpt-4o-mini")
    }

    const result = streamText({
      model: modelInstance,
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Error generating blog:", error)
    return new Response("Error generating content", { status: 500 })
  }
}
