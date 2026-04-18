import { AppShell } from "../components/AppShell";
import { ChatBubble } from "../components/ChatBubble";
import { coachMessages, suggestedPrompts } from "../data/mockData";

export default function Page() {
  return (
    <AppShell title="AI Coach Chat" subtitle="Persistent strategy chat with creator context" currentPath="/chat">
      <div className="grid-2" style={{ alignItems: "start" }}>
        <article className="card stack">
          <h3>Coach Conversation</h3>
          <div className="chat-window" role="log" aria-live="polite">
            {coachMessages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} role={message.role} content={message.content} time={message.time} />
            ))}
          </div>

          <div className="row">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} className="btn btn-secondary" type="button">{prompt}</button>
            ))}
          </div>

          <textarea className="textarea" placeholder="Ask your coach anything about your content performance..." />
          <div className="row">
            <button className="btn btn-primary" type="button">Send Message</button>
          </div>
        </article>

        <article className="card stack">
          <h3>Context Sidebar</h3>
          <p className="muted">This context is attached to every AI response.</p>
          <div className="stat-pill"><p>Current Platform Mix</p><p>65% Instagram / 35% YouTube</p></div>
          <div className="stat-pill"><p>Top Format</p><p>Educational Reels</p></div>
          <div className="stat-pill"><p>Latest Score</p><p>71/100</p></div>
          <div className="stat-pill"><p>Calendar Focus</p><p>Myth-busting + process breakdowns</p></div>
        </article>
      </div>
    </AppShell>
  );
}

