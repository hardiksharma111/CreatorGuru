import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ChatBubble } from "../components/ChatBubble";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  time?: string;
};

type ChatReplyPayload = {
  ok: true;
  provider: "local-adapter" | "gemini" | "groq";
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

const suggestedPrompts = [
  "Why did my last reel underperform?",
  "What should I post this weekend?",
  "What format should I double down on?",
  "How can I improve hook retention in first 5 seconds?"
];

const contextCards = [
  { label: "Current Platform Mix", value: "65% Instagram / 35% YouTube" },
  { label: "Top Format", value: "Educational Reels" },
  { label: "Latest Score", value: "71/100" },
  { label: "Calendar Focus", value: "Myth-busting + process breakdowns" }
];

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "You had a retention drop at 0:07 in your last reel. Tighten the opening and show the final payoff in the first 2 seconds.",
      time: "09:11"
    },
    {
      role: "user",
      content: "What should I post this weekend to recover momentum?",
      time: "09:12"
    },
    {
      role: "assistant",
      content: "Post a short myth-vs-reality video tied to your top performing topic, then follow with a carousel recap.",
      time: "09:12"
    }
  ]);
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
