import { AppShell } from "../components/AppShell";
import { ScoreCard } from "../components/ScoreCard";
import { useAnalysis } from "../hooks/useAnalysis";
import { healthScores } from "../data/mockData";

export default function Page() {
  const { data } = useAnalysis();

  return (
    <AppShell
      title="Profile Analyzer"
      subtitle="Paste a YouTube URL or Instagram handle to generate creator health insights"
      currentPath="/analyze"
    >
      <article className="card stack">
        <label htmlFor="creator-input">Channel URL or Handle</label>
        <input id="creator-input" className="input" placeholder="e.g. youtube.com/@yourchannel or @yourhandle" />
        <div className="row">
          <button className="btn btn-primary" type="button">Run Analysis</button>
          <button className="btn btn-secondary" type="button">Use Demo Profile</button>
        </div>
      </article>

      <div className="grid-3">
        {healthScores.map((score) => (
          <ScoreCard key={score.label} {...score} />
        ))}
      </div>

      <article className="card stack">
        <h3>Overall Health Score</h3>
        <p style={{ fontSize: "2rem", fontWeight: 900 }}>{data?.overallScore}/100</p>
        <p className="muted">{data?.recommendation}</p>
      </article>
    </AppShell>
  );
}

