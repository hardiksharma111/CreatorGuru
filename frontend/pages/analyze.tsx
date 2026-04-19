import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { ScoreCard } from "../components/ScoreCard";
import { demoProfile } from "../data/mockData";
import { addAnalysisHistoryEntry } from "../lib/persistence";
import { useAuth } from "../hooks/useAuth";

type HealthScore = {
  label: string;
  value: number;
  helper: string;
  delta: string;
};

type AnalyzeProfilePayload = {
  ok: true;
  source: "gemini" | "groq";
  profile: {
    pulse: string;
    thisWeekPlannedPosts: number;
    summary: string;
    priorityMove: string;
    priorityProgress: number;
    healthScores: HealthScore[];
  };
};

export default function Page() {
  const { isAuthenticated } = useAuth();
  const [creatorInput, setCreatorInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<AnalyzeProfilePayload["profile"] | null>(null);

  async function runAnalysis(withDemo = false) {
    if (loading) {
      return;
    }

    if (!isAuthenticated && !withDemo) {
      setProfile(demoProfile);
      setError("Demo mode: sign in to analyze your own profile data.");
      return;
    }

    const nextInput = withDemo ? "https://youtube.com/@creatorguru-demo" : creatorInput.trim();
    if (!nextInput) {
      setError("Please provide a channel URL or handle.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = withDemo && !isAuthenticated
        ? null
        : await fetch("/api/analyze/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          channelUrl: nextInput,
          niche: "creator economy",
          platform: "youtube"
        })
      });

      if (!response) {
        setProfile(demoProfile);
        addAnalysisHistoryEntry({
          kind: "profile",
          title: "Demo profile analysis",
          summary: demoProfile.summary,
          mode: "demo",
          details: {
            score: Math.round(demoProfile.healthScores.reduce((acc, score) => acc + score.value, 0) / demoProfile.healthScores.length)
          }
        });
        return;
      }

      const payload = (await response.json()) as AnalyzeProfilePayload | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error(!payload.ok ? payload.error : "Unable to analyze profile right now.");
      }

      setProfile(payload.profile);
      addAnalysisHistoryEntry({
        kind: "profile",
        title: "Live profile analysis",
        summary: payload.profile.summary,
        mode: isAuthenticated ? "live" : "demo",
        details: {
          score: Math.round(payload.profile.healthScores.reduce((acc, score) => acc + score.value, 0) / payload.profile.healthScores.length),
          source: payload.source
        }
      });
      if (withDemo) {
        setCreatorInput(nextInput);
      }
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : "Unexpected analysis error.";
      setError(message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  const healthScores = profile?.healthScores ?? [];
  const overallScore = healthScores.length
    ? Math.round(healthScores.reduce((acc, score) => acc + score.value, 0) / healthScores.length)
    : null;

  return (
    <AppShell
      title="Profile Analyzer"
      subtitle="Paste a YouTube URL or Instagram handle to generate creator health insights"
      currentPath="/analyze"
    >
      <article className="card stack">
        <label htmlFor="creator-input">Channel URL or Handle</label>
        <input
          id="creator-input"
          className="input"
          placeholder="e.g. youtube.com/@yourchannel or @yourhandle"
          value={creatorInput}
          onChange={(event) => setCreatorInput(event.target.value)}
        />
        <div className="row">
          <button className="btn btn-primary" type="button" onClick={() => void runAnalysis()} disabled={loading}>
            {loading ? "Analyzing..." : isAuthenticated ? "Run Analysis" : "Load Demo Analysis"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => void runAnalysis(true)} disabled={loading}>
            Use Demo Profile
          </button>
        </div>
        {error ? <p className="muted">{error}</p> : null}
      </article>

      <div className="grid-3">
        {healthScores.length > 0 ? (
          healthScores.map((score) => (
            <ScoreCard key={score.label} {...score} />
          ))
        ) : (
          <article className="card stack">
            <h3>Health Scores</h3>
            <p className="muted">Run analysis to load live score cards.</p>
          </article>
        )}
      </div>

      <article className="card stack">
        <h3>Overall Health Score</h3>
        <p style={{ fontSize: "2rem", fontWeight: 900 }}>{overallScore ?? "--"}{overallScore !== null ? "/100" : ""}</p>
        <p className="muted">{profile?.summary || "Run analysis to generate a live profile summary."}</p>
      </article>
    </AppShell>
  );
}

