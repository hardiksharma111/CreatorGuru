import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ChatBubble } from "../components/ChatBubble";
import { suggestedPrompts } from "../data/mockData";
import { addAnalysisHistoryEntry } from "../lib/persistence";
import { useAuth } from "../hooks/useAuth";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  time?: string;
};

type ChatReplyPayload = {
  ok: true;
  provider: "gemini" | "groq";
  intent: string;
  reply: {
    role: "assistant";
    content: string;
    time: string;
  };
};

type ChatErrorPayload = {
  ok: false;
  error: string;
};

const contextCards = [
  { label: "Current Platform Mix", value: "65% Instagram / 35% YouTube" },
  { label: "Top Format", value: "Educational Reels" },
  { label: "Latest Score", value: "71/100" },
  { label: "Calendar Focus", value: "Myth-busting + process breakdowns" }
];

export default function Page() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const requestContext = useMemo(
    () => ({
      currentPlatformMix: "65% Instagram / 35% YouTube",
      topFormat: "Educational Reels",
      latestScore: "71/100",
      calendarFocus: "Myth-busting + process breakdowns"
    }),
    []
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(messageText: string) {
    const message = messageText.trim();
    if (!message || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: "Demo coach: this is sample guidance. Sign in to get personalized responses from your live creator data.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        return;
      }

      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          platform: "Instagram + YouTube",
          context: requestContext
        })
      });

      const payload = (await response.json()) as ChatReplyPayload | ChatErrorPayload;

      if (!response.ok || !payload.ok) {
        throw new Error(!payload.ok ? payload.error : "Unable to generate a chat response right now.");
      }

      setMessages((current) => [...current, { role: "assistant", content: payload.reply.content, time: payload.reply.time }]);
      addAnalysisHistoryEntry({
        kind: "chat",
        title: "Coach reply generated",
        summary: payload.reply.content.slice(0, 120),
        mode: isAuthenticated ? "live" : "demo",
        details: {
          intent: payload.intent.length,
          provider: payload.provider
        }
      });
    } catch (sendError) {
      const messageTextFallback = sendError instanceof Error ? sendError.message : "Unexpected chat error.";
      setError(messageTextFallback);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  return (
    <AppShell title="AI Coach Chat" subtitle="Persistent strategy chat with creator context" currentPath="/chat">
      <div className="grid-2" style={{ alignItems: "start" }}>
        <article className="card stack">
          <h3>Coach Conversation</h3>
          <div className="chat-window" role="log" aria-live="polite" ref={listRef}>
            {messages.length === 0 ? (
              <ChatBubble role="assistant" content="Ask anything about your content strategy and I will respond using your configured AI provider." />
            ) : null}
            {messages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} role={message.role} content={message.content} time={message.time} />
            ))}
            {loading ? <ChatBubble role="assistant" content="Thinking through your creator context..." /> : null}
          </div>

          <div className="row">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} className="btn btn-secondary" type="button" onClick={() => setDraft(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="stack">
            <textarea
              className="textarea"
              placeholder="Ask your coach anything about your content performance..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
            />
            {error ? <p className="muted" style={{ color: "var(--danger)" }}>{error}</p> : null}
            {!isAuthenticated ? <p className="muted">Demo mode active. Sign in to receive live AI responses.</p> : null}
            <div className="row">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </article>

        <article className="card stack">
          <h3>Context Sidebar</h3>
          <p className="muted">This context is attached to every AI response.</p>
          {contextCards.map((item) => (
            <div className="stat-pill" key={item.label}>
              <p>{item.label}</p>
              <p>{item.value}</p>
            </div>
          ))}
        </article>
      </div>
    </AppShell>
  );
}
