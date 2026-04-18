import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { TrendCard } from "../components/TrendCard";

type TrendOpportunity = {
  topic: string;
  uplift: string;
  angle?: string;
  why?: string;
  tags?: string[];
};

export default function Page() {
  const [niche, setNiche] = useState("creator economy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<TrendOpportunity[]>([]);

  async function fetchTrends(nextNiche: string) {
    try {
      setLoading(true);
      setError(null);

      const query = encodeURIComponent(nextNiche.trim() || "creator economy");
      const response = await fetch(`/api/trends/niche?niche=${query}`);

      if (!response.ok) {
        throw new Error("Could not fetch trend opportunities.");
      }

      const payload = await response.json();
      setTrends((payload.opportunities as TrendOpportunity[]) ?? []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unexpected trend fetch error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrends(niche);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetchTrends(niche);
  }

  return (
    <AppShell
      title="Trend Radar"
      subtitle="Find trend opportunities mapped to your niche and current content gaps"
      currentPath="/trends"
    >
      <article className="card stack" style={{ marginBottom: 16 }}>
        <label htmlFor="niche">Niche</label>
        <form className="row" onSubmit={onSubmit}>
          <input
            id="niche"
            className="input"
            placeholder="e.g. productivity, fitness, creator economy"
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Fetching..." : "Fetch Trends"}
          </button>
        </form>
        {error ? <p className="muted">{error}</p> : null}
      </article>

      <div className="grid-3">
        {trends.map((trend) => (
          <TrendCard key={trend.topic} {...trend} />
        ))}
      </div>
    </AppShell>
  );
}

