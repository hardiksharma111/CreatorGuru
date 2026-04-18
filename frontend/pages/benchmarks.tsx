import { AppShell } from "../components/AppShell";
import { competitorRows } from "../data/mockData";

export default function Page() {
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
        />
        <div className="row">
          <button className="btn btn-primary" type="button">Compare Profiles</button>
        </div>
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
              {competitorRows.map((row) => (
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
        <p className="kpi">Best move: Increase weekly short-form frequency from 3 to 5 while keeping educational angle.</p>
      </article>
    </AppShell>
  );
}

