import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";

type HealthScore = {
  label: string;
  value: number;
  helper?: string;
  delta?: string;
};

type TrendOpportunity = {
  topic: string;
  uplift: string;
  angle?: string;
  why?: string;
  tags?: string[];
};

type ProfilePayload = {
  pulse: string;
  thisWeekPlannedPosts: number;
  summary: string;
  priorityMove: string;
  priorityProgress: number;
  healthScores: HealthScore[];
};

type QuickAction = {
  href: string;
  title: string;
  subtitle: string;
  tone: "violet" | "blue" | "green";
};

const quickActions: QuickAction[] = [
  { href: "/analyze", title: "Analyze Profile", subtitle: "Deep-dive into your metrics", tone: "violet" },
  { href: "/chat", title: "Open Coach Chat", subtitle: "Get personalized strategy tips", tone: "blue" },
  { href: "/calendar", title: "Generate Calendar", subtitle: "AI-powered content schedule", tone: "green" }
];

function scoreColor(label: string) {
  switch (label.toLowerCase()) {
    case "reach":
      return "var(--tile-violet)";
    case "engagement":
      return "var(--tile-blue)";
    case "consistency":
      return "var(--tile-green)";
    default:
      return "var(--tile-orange)";
  }
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSliceData() {
      try {
        setLoading(true);
        setError(null);

        const profileRes = await fetch("/api/analyze/profile");

        if (!profileRes.ok) {
          throw new Error("Unable to load live dashboard data right now.");
        }

        const profileJson = await profileRes.json();

        if (!mounted) {
          return;
        }

        setProfile(profileJson.profile as ProfilePayload);
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : "Unexpected error while loading dashboard data.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSliceData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell title="Dashboard" subtitle="Your creator command center" currentPath="/dashboard">
      <article className="hero-insight card">
        <div className="hero-insight-head">
          <span className="insight-pill">Creator Pulse - Active</span>
          <span className="week-pill">+24% this week</span>
        </div>

        <h2 className="insight-title">
          Your content is <span>growing</span>. Let&apos;s push it <em>further</em>.
        </h2>

        <p className="insight-copy">
          {loading
            ? "Loading your latest performance insight..."
            : profile?.summary}
        </p>

        <div className="hero-mini-stats">
          <article className="spark-card">
            <p>Engagement Trend</p>
            <div className="sparkline" aria-hidden="true">
              <span />
            </div>
          </article>
          <article>
            <strong>{profile?.healthScores?.[1]?.value ?? 0}%</strong>
            <p>Avg. Engagement %</p>
          </article>
          <article>
            <strong>{847}</strong>
            <p>New Followers (7d)</p>
          </article>
          <article>
            <strong>{profile?.thisWeekPlannedPosts ?? 0}</strong>
            <p>Posts This Week</p>
          </article>
        </div>
      </article>

      {error ? (
        <article className="card" style={{ marginTop: 14 }}>
          <p className="muted">{error}</p>
        </article>
      ) : null}

      <div className="metrics-grid-clean">
        {(profile?.healthScores ?? []).map((score, index) => (
          <article className="metric-tile" key={score.label}>
            <div className="metric-topline">
              <span className="metric-icon" aria-hidden="true">{index % 2 === 0 ? "◌" : "◇"}</span>
              <span className={`metric-delta ${score.delta?.startsWith("-") ? "negative" : "positive"}`}>{score.delta}</span>
            </div>
            <p className="metric-label">{score.label} Score</p>
            <p className="metric-value">{score.value}<span>/100</span></p>
            <div className="metric-bar" aria-hidden="true">
              <span style={{ width: `${Math.max(0, Math.min(100, score.value))}%`, background: scoreColor(score.label) }} />
            </div>
            <p className="metric-foot">vs last month: {score.delta}</p>
          </article>
        ))}
      </div>

      <section className="quick-actions-clean">
        <div className="quick-actions-header">
          <h3>Quick Actions</h3>
          <Link href="/settings">View all tools</Link>
        </div>
        <div className="quick-actions-row">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="action-card">
              <span className={`action-glyph ${action.tone}`} aria-hidden="true">◍</span>
              <span>
                <strong>{action.title}</strong>
                <small>{action.subtitle}</small>
              </span>
              <span className="action-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

