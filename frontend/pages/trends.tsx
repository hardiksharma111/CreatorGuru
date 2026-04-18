import { AppShell } from "../components/AppShell";
import { TrendCard } from "../components/TrendCard";
import { trendOpportunities } from "../data/mockData";

export default function Page() {
  return (
    <AppShell
      title="Trend Radar"
      subtitle="Find trend opportunities mapped to your niche and current content gaps"
      currentPath="/trends"
    >
      <article className="card stack">
        <label htmlFor="niche">Niche</label>
        <div className="row">
          <input id="niche" className="input" placeholder="e.g. productivity, fitness, creator economy" />
          <button className="btn btn-primary" type="button">Fetch Trends</button>
        </div>
      </article>

      <div className="grid-3">
        {trendOpportunities.map((trend) => (
          <TrendCard key={trend.topic} {...trend} />
        ))}
      </div>
    </AppShell>
  );
}

