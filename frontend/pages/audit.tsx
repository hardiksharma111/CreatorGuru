import { AppShell } from "../components/AppShell";

export default function Page() {
  return (
    <AppShell title="Post / Video Auditor" subtitle="Audit a specific post and learn what to repeat or fix" currentPath="/audit">
      <article className="card stack">
        <label htmlFor="url">YouTube video URL or Instagram post URL</label>
        <input id="url" className="input" placeholder="https://..." />
        <div className="row">
          <button className="btn btn-primary" type="button">Run Audit</button>
          <button className="btn btn-secondary" type="button">Try Example URL</button>
        </div>
      </article>

      <div className="grid-3">
        <article className="card stack">
          <h3>What Worked</h3>
          <p className="muted">Clear promise in first 2 seconds and strong CTA at the end.</p>
        </article>
        <article className="card stack">
          <h3>What Underperformed</h3>
          <p className="muted">Retention dropped when transitioning into a long setup section.</p>
        </article>
        <article className="card stack">
          <h3>Next Iteration</h3>
          <p className="muted">Compress setup, show payoff earlier, and use tighter on-screen text contrast.</p>
        </article>
      </div>
    </AppShell>
  );
}

