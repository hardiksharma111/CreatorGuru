import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { competitorRows } from "../data/mockData";
import { addAnalysisHistoryEntry } from "../lib/persistence";
import { useAuth } from "../hooks/useAuth";

type BenchmarkRow = {
  name: string;
  postsPerWeek: number;
  engagementRate: string;
  growthRate: string;
  engagementRateValue: number;
  growthRateValue: number;
};

type ComparePayload = {
  ok: true;
  source: "heuristic-v1";
  rows: BenchmarkRow[];
  recommendation: string;
};

export default function Page() {
  const { isAuthenticated } = useAuth();
  const [rawCompetitors, setRawCompetitors] = useState("CreatorAlpha\nStudioBravo\nGrowthNinja");
  const [sortBy, setSortBy] = useState<"engagement" | "growth" | "posts">("engagement");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minEngagement, setMinEngagement] = useState(0);
  const [rows, setRows] = useState<BenchmarkRow[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const competitorList = useMemo(
    () => rawCompetitors.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 5),
    [rawCompetitors]
  );

  async function compareProfiles() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      setRows(competitorRows);
      setRecommendation("Demo mode: sign in to compare against your own connected competitors.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/benchmarks/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          competitors: competitorList,
          sortBy,
          sortOrder,
          minEngagement
        })
      });

      const payload = (await response.json()) as ComparePayload | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error(!payload.ok ? payload.error : "Unable to compare profiles right now.");
      }

      setRows(payload.rows);
      setRecommendation(payload.recommendation);
      addAnalysisHistoryEntry({
        kind: "benchmarks",
        title: "Competitor benchmark compare",
        summary: payload.recommendation,
        mode: isAuthenticated ? "live" : "demo",
        details: {
          competitorCount: competitorList.length,
          topRows: payload.rows.length
        }
      });
    } catch (compareError) {
      const message = compareError instanceof Error ? compareError.message : "Unexpected benchmark error.";
      setError(message);
      setRows([]);
      setRecommendation("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Competitor Benchmarking"
      subtitle="Compare your profile against up to five competitors and identify the highest-leverage move"
      currentPath="/benchmarks"
    >
      <article className="card stack">
        <label htmlFor="competitors">Competitor handles or URLs</label>
        <textarea
          id="competitors"
          className="textarea"
          placeholder="Paste up to 5 competitor profiles, one per line"
          value={rawCompetitors}
          onChange={(event) => setRawCompetitors(event.target.value)}
        />
        <div className="grid-3" style={{ marginTop: 0 }}>
          <div className="stack" style={{ gap: 8 }}>
            <label htmlFor="sortBy">Sort by</label>
            <select id="sortBy" className="input" value={sortBy} onChange={(event) => setSortBy(event.target.value as "engagement" | "growth" | "posts")}>
              <option value="engagement">Engagement</option>
              <option value="growth">Growth</option>
              <option value="posts">Posts / Week</option>
            </select>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <label htmlFor="sortOrder">Order</label>
            <select id="sortOrder" className="input" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <label htmlFor="minEngagement">Min engagement (%)</label>
            <input
              id="minEngagement"
              type="number"
              className="input"
              min={0}
              max={100}
              step={0.1}
              value={minEngagement}
              onChange={(event) => setMinEngagement(Number(event.target.value || 0))}
            />
          </div>
        </div>
        <div className="row">
          <button className="btn btn-primary" type="button" onClick={() => void compareProfiles()} disabled={loading}>
            {loading ? "Comparing..." : "Compare Profiles"}
          </button>
        </div>
        {!isAuthenticated ? <p className="muted">Demo mode active. Sign in to compare your live competitors.</p> : null}
        {error ? <p className="muted">{error}</p> : null}
      </article>

      <article className="card stack">
        <h3>Comparison Snapshot</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Creator</th>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Posts / Week</th>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Engagement</th>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Growth</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td style={{ padding: "8px 0" }}>{row.name}</td>
                  <td style={{ padding: "8px 0" }}>{row.postsPerWeek}</td>
                  <td style={{ padding: "8px 0" }}>{row.engagementRate}</td>
                  <td style={{ padding: "8px 0" }}>{row.growthRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <p className="muted">No comparison rows yet. Run a compare to load data.</p> : null}
        {recommendation ? <p className="kpi">{recommendation}</p> : null}
      </article>
    </AppShell>
  );
}

