import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ScoreCard } from "../components/ScoreCard";
import { TrendCard } from "../components/TrendCard";

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

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [trends, setTrends] = useState<TrendOpportunity[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadSliceData() {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, trendsRes] = await Promise.all([
          fetch("/api/analyze/profile"),
          fetch("/api/trends/niche?niche=creator%20economy")
        ]);

        if (!profileRes.ok || !trendsRes.ok) {
          throw new Error("Unable to load live dashboard data right now.");
        }

        const profileJson = await profileRes.json();
        const trendsJson = await trendsRes.json();

        if (!mounted) {
          return;
        }

        setProfile(profileJson.profile as ProfilePayload);
        setTrends((trendsJson.opportunities as TrendOpportunity[]) ?? []);
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
      <article className="card stack" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h3>Creator Pulse</h3>
            <p className="muted">{loading ? "Loading live profile data..." : profile?.pulse}</p>
          </div>
          <span className="kpi">This week: {profile?.thisWeekPlannedPosts ?? 0} planned posts</span>
        </div>
      </article>

      {error ? (
        <article className="card" style={{ marginBottom: 16 }}>
          <p className="muted">{error}</p>
        </article>
      ) : null}

      <div className="grid-3" style={{ marginTop: 0 }}>
        {(profile?.healthScores ?? []).map((score) => (
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
          <p className="muted">Live API mode is active for dashboard and trends data.</p>
        </article>

        <article className="card stack">
          <h3>Recent Analysis Summary</h3>
          <p className="muted">{profile?.summary}</p>
          <div className="kpi">Priority move: {profile?.priorityMove}</div>
          <div className="progress"><span style={{ width: `${profile?.priorityProgress ?? 0}%` }} /></div>
        </article>
      </div>

      <div className="grid-3">
        {trends.map((trend) => (
          <TrendCard key={trend.topic} {...trend} />
        ))}
      </div>
    </AppShell>
  );
}

