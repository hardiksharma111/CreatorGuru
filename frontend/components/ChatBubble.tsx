type Props = { role: 'user' | 'assistant'; content: string };

export function ChatBubble({ role, content }: Props) {
  const align = role === 'user' ? 'flex-end' : 'flex-start';
  return (
    <div style={{ display: 'flex', justifyContent: align, margin: '8px 0' }}>
      <div style={{ maxWidth: 520, border: '1px solid #ddd', padding: 10, borderRadius: 8 }}>{content}</div>
    </div>
  );
}

