import { AppShell } from "../components/AppShell";
import { useAnalysisHistory } from "../hooks/useAnalysisHistory";
import { useAuth } from "../hooks/useAuth";

const integrations = [
  { key: "YouTube API", status: "Disconnected", tone: "warn" },
  { key: "Instagram API", status: "Disconnected", tone: "warn" },
  { key: "Supabase", status: "Connected", tone: "ok" },
  { key: "Gemini", status: "Connected", tone: "ok" },
  { key: "Groq Fallback", status: "Optional", tone: "muted" }
];

export default function Page() {
  const { user, isAuthenticated, signInDemo, signOut } = useAuth();
  const { history, clearHistory } = useAnalysisHistory();

  return (
    <AppShell title="Settings & Integrations" subtitle="Connect your data sources and theme preferences" currentPath="/settings">
      <article className="card stack" style={{ marginBottom: 16 }}>
        <h3>Connection-first setup</h3>
        <p className="muted">
          We do not ask creators to paste raw environment keys here. Connect services through the backend later, while this
          screen keeps the product clear and safe for normal users.
        </p>
        <div className="row">
          <button className="btn btn-primary" type="button" onClick={signInDemo}>Sign in demo</button>
          <button className="btn btn-secondary" type="button" onClick={signOut}>Sign out</button>
          <button className="btn btn-secondary" type="button">Connect YouTube</button>
        </div>
      </article>

      <div className="grid-2" style={{ marginTop: 0 }}>
        <article className="card stack">
          <h3>Integration Status</h3>
          {integrations.map((integration) => (
            <div
              key={integration.key}
              className="row"
              style={{ justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}
            >
              <span>{integration.key}</span>
              <span className="tag">{integration.status}</span>
            </div>
          ))}
        </article>

        <article className="card stack">
          <h3>Session</h3>
          <p className="muted">{isAuthenticated ? `Signed in as ${user?.name} (${user?.email})` : "You are browsing in demo mode."}</p>
          <p className="muted">Session persists locally across refreshes in this build.</p>
          <div className="row">
            <button className="btn btn-primary" type="button" onClick={signInDemo}>Log in demo session</button>
            <button className="btn btn-secondary" type="button" onClick={signOut}>Log out</button>
          </div>

          <h3 style={{ marginTop: 12 }}>Theme Preferences</h3>
          <p className="muted">Switch between Morning Mode and Night Mode from the left sidebar beneath Settings. It persists locally.</p>
          <div className="feature-card">
            <h3>Morning Mode</h3>
            <p>Bright, warm, and daylight-friendly for planning sessions.</p>
          </div>
          <div className="feature-card">
            <h3>Night Mode</h3>
            <p>Deeper contrast with a studio-like feel for late-night editing and analysis.</p>
          </div>
        </article>
      </div>

      <article className="card stack" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>Saved History</h3>
          <button className="btn btn-secondary" type="button" onClick={clearHistory}>Clear History</button>
        </div>
        {history.length > 0 ? (
          history.slice(0, 8).map((item) => (
            <div key={item.id} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.summary}</p>
              </div>
              <span className="tag">{item.mode}</span>
            </div>
          ))
        ) : (
          <p className="muted">No saved history yet. Run any analysis to create a persisted record.</p>
        )}
      </article>
    </AppShell>
  );
}
