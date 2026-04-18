import { AppShell } from "../components/AppShell";

const integrations = [
  { key: "YouTube API", status: "Disconnected", tone: "warn" },
  { key: "Instagram API", status: "Disconnected", tone: "warn" },
  { key: "Supabase", status: "Connected", tone: "ok" },
  { key: "Gemini", status: "Connected", tone: "ok" },
  { key: "Groq Fallback", status: "Optional", tone: "muted" }
];

export default function Page() {
  return (
    <AppShell title="Settings & Integrations" subtitle="Manage API keys and connection states" currentPath="/settings">
      <div className="grid-2" style={{ marginTop: 0 }}>
        <article className="card stack">
          <h3>Environment Keys</h3>
          <input className="input" placeholder="YOUTUBE_API_KEY" />
          <input className="input" placeholder="INSTAGRAM_ACCESS_TOKEN" />
          <input className="input" placeholder="SUPABASE_URL" />
          <input className="input" placeholder="SUPABASE_ANON_KEY" />
          <input className="input" placeholder="GEMINI_API_KEY" />
          <div className="row">
            <button className="btn btn-primary" type="button">Save Configuration</button>
            <button className="btn btn-secondary" type="button">Validate Keys</button>
          </div>
        </article>

        <article className="card stack">
          <h3>Integration Status</h3>
          {integrations.map((integration) => (
            <div key={integration.key} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              <span>{integration.key}</span>
              <span className="tag">{integration.status}</span>
            </div>
          ))}
          <p className="muted">Keys are server-side only and should never be exposed in client-side bundles.</p>
        </article>
      </div>
    </AppShell>
  );
}
