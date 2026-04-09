import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function ClaudeAiService(messages: Message[]) {
  try {
    // ✅ Limit history (performance + cost control)
    const trimmedMessages = messages.slice(-20);

    // ✅ System instruction (keep it strong)
    const systemPrompt: Message = {
      role: "system",
      content: `
You are Claude, an AI construction and real estate consultant for the BuildNest platform.

Your job is to help users plan construction projects based on their budget and preferences.

You must:
1. Provide a detailed house plan (layout, rooms, floors, materials).
2. Provide a structured budget breakdown (tables preferred).
3. Explain reasoning clearly and professionally.
4. Ask clarifying questions if needed.
5. Keep responses clean, readable, and well formatted in Markdown.

Important:
- Always structure output properly
- Use tables where useful
- Be practical and cost-aware
`,
    };

    // ✅ Merge system + history
    const finalMessages: Message[] = [systemPrompt, ...trimmedMessages];

    // 🔥 OpenRouter API call
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-haiku-4.5",

        // ✅ FULL MEMORY HERE
        messages: finalMessages,

        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response;
  } catch (err: any) {
    console.error("OpenRouter API error:", err.response?.data || err.message);

    throw new Error("AI request failed");
  }
}
