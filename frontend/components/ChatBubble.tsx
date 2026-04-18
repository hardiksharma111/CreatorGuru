type Props = { role: "user" | "assistant"; content: string; time?: string };

export function ChatBubble({ role, content, time }: Props) {
  return (
    <div className={`chat-bubble ${role}`}>
      <p>{content}</p>
      {time ? (
        <p style={{ marginTop: 6, fontSize: "0.74rem", opacity: 0.75 }}>{time}</p>
      ) : null}
    </div>
  );
}

