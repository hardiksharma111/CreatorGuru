import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ScoreCard } from "../components/ScoreCard";
import { TrendCard } from "../components/TrendCard";
import { healthScores, trendOpportunities } from "../data/mockData";

export default function Page() {
  return (
    <AppShell title="Dashboard" subtitle="Your creator command center" currentPath="/dashboard">
      <div className="grid-3" style={{ marginTop: 0 }}>
        {healthScores.map((score) => (
          <ScoreCard key={score.label} {...score} />
        ))}
      </div>

      <div className="grid-2">
        <article className="card stack">
          <h3>Quick Actions</h3>
          <div className="row">
            <Link href="/analyze" className="btn btn-primary">Analyze Profile</Link>
            <Link href="/chat" className="btn btn-secondary">Open Coach Chat</Link>
            <Link href="/calendar" className="btn btn-secondary">Generate Calendar</Link>
            <Link href="/thumbnail" className="btn btn-secondary">Score Thumbnail</Link>
          </div>
          <p className="muted">You are in mock mode now. Connect APIs in settings to run live analysis.</p>
        </article>

        <article className="card stack">
          <h3>Recent Analysis Summary</h3>
          <p className="muted">
            Last week, your short-form hooks improved but posting consistency dropped 14% on weekends. Rebalance cadence and
            focus on value-forward openings.
          </p>
          <div className="kpi">Priority move: 2 educational reels + 1 breakdown short this weekend</div>
        </article>
      </div>

      <div className="grid-3">
        {trendOpportunities.map((trend) => (
          <TrendCard key={trend.topic} {...trend} />
        ))}
      </div>
    </AppShell>
  );
}

