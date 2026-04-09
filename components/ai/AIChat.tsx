"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Loader, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  role: "engineer" | "customer";
}

export default function AIChat({ role }: AIChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // ✅ Fix markdown tables
  const cleanMarkdown = (text: string) => {
    return text?.replace(/\|\s*\|/g, "|\n|");
  };

  // ✅ Auto scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // ✅ Role-based prompts
  const examplePrompts =
    role === "engineer"
      ? [
          "RCC budget planning",
          "Steel construction tips",
          "Material cost estimation",
          "Foundation design advice",
        ]
      : [
          "Build a house in 10 lakhs",
          "Low budget home ideas",
          "2BHK house plan",
          "Cost saving tips for construction",
        ];

  // ✅ Load chat history
  useEffect(() => {
    const loadMessages = async () => {
      setHistoryLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      try {
        const { data } = await supabase
          .from("ai_chats")
          .select("messages")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data?.messages) {
          setMessages(data.messages);
        }
      } finally {
        setHistoryLoading(false);
      }
    };

    loadMessages();
  }, [role]);

  // ✅ Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const userMessage: Message = { role: "user", content: input };

    // Optimistic UI
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 1️⃣ Get existing messages
      const { data: existing } = await supabase
        .from("ai_chats")
        .select("messages")
        .eq("user_id", user.id)
        .maybeSingle();

      let updatedMessages: Message[] = existing?.messages || [];

      updatedMessages.push(userMessage);

      // 🔥 Limit memory
      updatedMessages = updatedMessages.slice(-20);

      // 2️⃣ Call AI
      const res = await axios.post("/api/ai/chat", {
        messages: updatedMessages,
        role, // 🔥 send role to backend
      });

      const aiMessage: Message = {
        role: "assistant",
        content: res.data.message,
      };

      updatedMessages.push(aiMessage);

      // 3️⃣ Save to Supabase
      await supabase.from("ai_chats").upsert({
        user_id: user.id,
        messages: updatedMessages,
      });

      // 4️⃣ Update UI
      setMessages(updatedMessages);
    } catch (err) {
      console.error("AI error:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Could not get response.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-background overflow-y-auto">
      {/* Chat Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6"
      >
        {historyLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Ask anything 👇</h2>
              <p className="text-muted-foreground text-sm">
                {role === "engineer"
                  ? "Advanced construction planning & engineering help"
                  : "Get help with construction planning & budgeting"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="p-3 text-sm text-left rounded-xl border border-border hover:bg-muted transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[60%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted border border-border rounded-bl-sm"
                  }`}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {cleanMarkdown(message.content)}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl border border-border">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur px-4 md:px-6 py-4">
        <form
          onSubmit={handleSend}
          className="max-w-3xl mx-auto flex items-center gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about construction, budget, materials..."
            disabled={isLoading}
            className="flex-1 rounded-full px-5 py-3 bg-muted border-none focus-visible:ring-1"
          />

          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center mt-2">
          AI suggestions may not be perfect. Verify before decisions.
        </p>
      </div>
    </div>
  );
}
