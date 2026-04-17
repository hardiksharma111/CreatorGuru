type Props = { label: string; value: number };

export function ScoreCard({ label, value }: Props) {
  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <h3>{label}</h3>
      <p>{value}/100</p>
    </section>
  );
}

