type Props = {
  topic: string;
  uplift: string;
  angle?: string;
  why?: string;
  tags?: string[];
};

export function TrendCard({ topic, uplift, angle, why, tags = [] }: Props) {
  return (
    <article className="card stack trend-card">
      <h4>{topic}</h4>
      <p className="kpi">Estimated uplift: {uplift}</p>
      {angle ? <p><strong>Suggested angle:</strong> {angle}</p> : null}
      {why ? <p className="muted">{why}</p> : null}
      <div className="row">
        {tags.map((tag) => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>
    </article>
  );
}

