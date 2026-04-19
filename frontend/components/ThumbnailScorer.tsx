import { useState } from "react";
import { addAnalysisHistoryEntry } from "../lib/persistence";
import { useAuth } from "../hooks/useAuth";

type ThumbnailPayload = {
  ok: true;
  source: "heuristic-v1";
  scoring: {
    visualClarity: number;
    hookStrength: number;
    ctaImpact: number;
    keywordRelevance: number;
    overall: number;
  };
  recommendations: string[];
};

export function ThumbnailScorer() {
  const { isAuthenticated } = useAuth();
  const [caption, setCaption] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ThumbnailPayload | null>(null);

  async function runScoring(nextCaption?: string, nextHasImage?: boolean) {
    const text = (nextCaption ?? caption).trim();
    const imageAttached = typeof nextHasImage === "boolean" ? nextHasImage : hasImage;

    if (!text || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        const demoPayload: ThumbnailPayload = {
          ok: true,
          source: "heuristic-v1",
          scoring: {
            visualClarity: imageAttached ? 78 : 64,
            hookStrength: Math.min(90, 70 + Math.min(12, text.length % 11)),
            ctaImpact: 72,
            keywordRelevance: Math.min(88, 60 + Math.min(20, text.split(/\s+/).length)),
            overall: 74
          },
          recommendations: [
            imageAttached ? "Demo mode: keep one focal object and remove visual clutter." : "Demo mode: add an image to improve visual clarity.",
            "Demo mode: lead with a curiosity hook in the first line.",
            "Demo mode: keep one explicit CTA near the end of the caption."
          ]
        };

        setResult(demoPayload);
        addAnalysisHistoryEntry({
          kind: "thumbnail",
          title: "Demo thumbnail score",
          summary: `Overall score ${demoPayload.scoring.overall}/100`,
          mode: "demo",
          details: {
            score: demoPayload.scoring.overall,
            hasImage: imageAttached
          }
        });
        return;
      }

      const response = await fetch("/api/analyze/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          caption: text,
          hasImage: imageAttached
        })
      });

      const payload = (await response.json()) as ThumbnailPayload | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error(!payload.ok ? payload.error : "Unable to score asset right now.");
      }

      setResult(payload);
      addAnalysisHistoryEntry({
        kind: "thumbnail",
        title: "Thumbnail and caption scored",
        summary: `Overall score ${payload.scoring.overall}/100`,
        mode: isAuthenticated ? "live" : "demo",
        details: {
          score: payload.scoring.overall,
          hasImage: imageAttached
        }
      });
    } catch (scoringError) {
      const message = scoringError instanceof Error ? scoringError.message : "Unexpected scoring error.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function useSample() {
    const sample = "3 AI shortcuts that save me 10 hours every week. Comment TOOLKIT for the checklist.";
    setCaption(sample);
    setHasImage(true);
    void runScoring(sample, true);
  }

  const scores = result?.scoring;

  return (
    <section className="card stack">
      <h3>Thumbnail & Caption Scorer</h3>
      <p className="muted">Upload a thumbnail and paste a caption to get actionable recommendations.</p>
      <input className="input" type="file" accept="image/*" onChange={(event) => setHasImage(Boolean(event.target.files?.length))} />
      <textarea
        className="textarea"
        placeholder="Paste caption text to score emotional hook, keywords, CTA, and clarity."
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
      />
      <div className="grid-3" style={{ marginTop: 0 }}>
        <div className="stat-pill">
          <p>Visual Clarity</p>
          <p>{scores?.visualClarity ?? "--"}</p>
        </div>
        <div className="stat-pill">
          <p>Hook Strength</p>
          <p>{scores?.hookStrength ?? "--"}</p>
        </div>
        <div className="stat-pill">
          <p>CTA Impact</p>
          <p>{scores?.ctaImpact ?? "--"}</p>
        </div>
      </div>
      {scores ? <p className="kpi">Overall score: {scores.overall}/100</p> : null}
      {result?.recommendations?.length ? (
        <article className="card stack" style={{ marginTop: 0 }}>
          <h3>Recommendations</h3>
          {result.recommendations.map((point) => (
            <p key={point} className="muted">{point}</p>
          ))}
        </article>
      ) : null}
      {error ? <p className="muted">{error}</p> : null}
      <div className="row">
        <button className="btn btn-primary" type="button" onClick={() => void runScoring()} disabled={loading}>
          {loading ? "Scoring..." : "Score Asset"}
        </button>
        <button className="btn btn-secondary" type="button" onClick={useSample} disabled={loading}>Use Sample</button>
      </div>
    </section>
  );
}

