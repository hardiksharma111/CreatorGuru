import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { addAnalysisHistoryEntry } from "../lib/persistence";
import { useAuth } from "../hooks/useAuth";

type AuditPayload = {
  ok: true;
  source: "heuristic-v1";
  audit: {
    overallScore: number;
    worked: string[];
    underperformed: string[];
    nextIteration: string[];
  };
};

export default function Page() {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditPayload["audit"] | null>(null);

  function buildDemoAudit(candidate: string): AuditPayload["audit"] {
    const base = Math.max(62, Math.min(90, 68 + Math.min(12, candidate.length % 11)));

    return {
      overallScore: base,
      worked: [
        "Demo mode: the opening promise is understandable and clear.",
        "The structure suggests a good outcome-first flow.",
        "The CTA appears aligned with the topic intent."
      ],
      underperformed: [
        "Demo mode: the middle section could still be tighter.",
        "There may be a missed opportunity to show payoff sooner.",
        "The CTA could be more specific."
      ],
      nextIteration: [
        "Move the result into the first 2 seconds.",
        "Trim any explanation that delays the main payoff.",
        "End with one measurable CTA."
      ]
    };
  }

  async function runAudit(nextUrl?: string) {
    const candidate = (nextUrl ?? url).trim();
    if (!candidate || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        const demoAudit = buildDemoAudit(candidate);
        setResult(demoAudit);
        addAnalysisHistoryEntry({
          kind: "audit",
          title: "Demo post audit",
          summary: `Overall score ${demoAudit.overallScore}/100 for demo review`,
          mode: "demo",
          details: {
            score: demoAudit.overallScore,
            url: candidate
          }
        });
        return;
      }

      const response = await fetch("/api/analyze/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: candidate })
      });

      const payload = (await response.json()) as AuditPayload | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error(!payload.ok ? payload.error : "Unable to run audit right now.");
      }

      setResult(payload.audit);
      addAnalysisHistoryEntry({
        kind: "audit",
        title: "Post audit completed",
        summary: `Overall score ${payload.audit.overallScore}/100 for ${candidate}`,
        mode: isAuthenticated ? "live" : "demo",
        details: {
          score: payload.audit.overallScore,
          url: candidate
        }
      });
    } catch (auditError) {
      const message = auditError instanceof Error ? auditError.message : "Unexpected audit error.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function useExample() {
    const sample = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    setUrl(sample);
    void runAudit(sample);
  }

  return (
    <AppShell title="Post / Video Auditor" subtitle="Audit a specific post and learn what to repeat or fix" currentPath="/audit">
      <article className="card stack">
        <label htmlFor="url">YouTube video URL or Instagram post URL</label>
        <input id="url" className="input" placeholder="https://..." value={url} onChange={(event) => setUrl(event.target.value)} />
        <div className="row">
          <button className="btn btn-primary" type="button" onClick={() => void runAudit()} disabled={loading}>
            {loading ? "Running Audit..." : "Run Audit"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={useExample} disabled={loading}>Try Example URL</button>
        </div>
        {result ? <p className="kpi">Overall score: {result.overallScore}/100</p> : null}
        {error ? <p className="muted">{error}</p> : null}
      </article>

      <div className="grid-3">
        <article className="card stack">
          <h3>What Worked</h3>
          {result?.worked?.length ? (
            result.worked.map((point) => <p key={point} className="muted">{point}</p>)
          ) : (
            <p className="muted">Run an audit to see what likely performed well.</p>
          )}
        </article>
        <article className="card stack">
          <h3>What Underperformed</h3>
          {result?.underperformed?.length ? (
            result.underperformed.map((point) => <p key={point} className="muted">{point}</p>)
          ) : (
            <p className="muted">Run an audit to see likely weak points.</p>
          )}
        </article>
        <article className="card stack">
          <h3>Next Iteration</h3>
          {result?.nextIteration?.length ? (
            result.nextIteration.map((point) => <p key={point} className="muted">{point}</p>)
          ) : (
            <p className="muted">Run an audit to get iteration recommendations.</p>
          )}
        </article>
      </div>
    </AppShell>
  );
}

