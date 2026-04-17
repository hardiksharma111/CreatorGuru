type Props = { topic: string; uplift: string };

export function TrendCard({ topic, uplift }: Props) {
  return (
    <article style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <h4>{topic}</h4>
      <p>Estimated uplift: {uplift}</p>
    </article>
  );
}

