type Props = {
  label: string;
  value: number;
  helper?: string;
  delta?: string;
};

export function ScoreCard({ label, value, helper, delta }: Props) {
  return (
    <section className="card stack">
      <h3>{label}</h3>
      <p style={{ fontSize: "1.5rem", fontWeight: 900 }}>{value}/100</p>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      {helper ? <p className="muted">{helper}</p> : null}
      {delta ? <p className="kpi">{delta}</p> : null}
    </section>
  );
}

