import { ClaudeAiService } from "@/lib/ClaudeAiService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    // ✅ Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, message: "Invalid messages format" },
        { status: 400 },
      );
    }

    // ✅ Limit memory (important for performance + cost)
    const trimmedMessages = messages.slice(-20);

    // ✅ Optional: Add system instruction (VERY IMPORTANT)
    const systemPrompt = {
      role: "system",
      content:
        "You are a professional civil engineer AI. Help with construction planning, budgeting, materials, and cost optimization. Give clear, structured answers with tables when needed.",
    };

    // ✅ Final messages sent to AI
    const finalMessages = [systemPrompt, ...trimmedMessages];

    // 🔥 Call your Claude service
    const result = await ClaudeAiService(finalMessages);

    // ✅ Safe response extraction
    const aiReply =
      result?.data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({
      success: true,
      message: aiReply,
    });
  } catch (error) {
    console.error("AI Assistant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
