import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { CalendarGrid } from "../components/CalendarGrid";
import { calendarEntries } from "../data/mockData";
import { addAnalysisHistoryEntry } from "../lib/persistence";
import { useAuth } from "../hooks/useAuth";

type CalendarEntry = {
  day: number;
  topic: string;
  platform: "YouTube" | "Instagram";
  contentType: "Reel" | "Short" | "Long-form";
};

type CalendarResponse = {
  ok: true;
  plan: {
    niche: string;
    cadencePerWeek: number;
    days: number;
    generatedAt: string;
    entries: CalendarEntry[];
  };
};

export default function Page() {
  const { isAuthenticated } = useAuth();
  const [niche, setNiche] = useState("creator economy");
  const [cadencePerWeek, setCadencePerWeek] = useState(5);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  async function generatePlan() {
    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      setEntries(calendarEntries);
      setGeneratedAt(new Date().toISOString());
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/calendar/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          niche,
          cadencePerWeek
        })
      });

      const payload = (await response.json()) as CalendarResponse | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error(!payload.ok ? payload.error : "Unable to generate calendar right now.");
      }

      setEntries(payload.plan.entries);
      setGeneratedAt(payload.plan.generatedAt);
      addAnalysisHistoryEntry({
        kind: "calendar",
        title: "30-day calendar generated",
        summary: `Generated ${payload.plan.entries.length} entries for ${payload.plan.niche}`,
        mode: isAuthenticated ? "live" : "demo",
        details: {
          cadence: payload.plan.cadencePerWeek,
          entries: payload.plan.entries.length
        }
      });
    } catch (generateError) {
      const message = generateError instanceof Error ? generateError.message : "Unexpected calendar generation error.";
      setError(message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void generatePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatedLabel = generatedAt ? new Date(generatedAt).toLocaleString() : null;

  return (
    <AppShell
      title="30-Day Content Calendar"
      subtitle="Generate, adjust, and execute a personalized publishing plan"
      currentPath="/calendar"
    >
      <article className="card stack">
        <div className="grid-2" style={{ marginTop: 0 }}>
          <div className="stack" style={{ gap: 8 }}>
            <label htmlFor="calendar-niche">Niche</label>
            <input
              id="calendar-niche"
              className="input"
              value={niche}
              onChange={(event) => setNiche(event.target.value)}
              placeholder="e.g. AI productivity"
            />
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <label htmlFor="calendar-cadence">Cadence (posts/week)</label>
            <input
              id="calendar-cadence"
              className="input"
              type="number"
              min={1}
              max={14}
              value={cadencePerWeek}
              onChange={(event) => setCadencePerWeek(Number(event.target.value || 5))}
            />
          </div>
        </div>
        <div className="row">
          <button className="btn btn-primary" type="button" onClick={() => void generatePlan()} disabled={loading}>
            {loading ? "Generating..." : "Generate Calendar"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => void generatePlan()} disabled={loading}>
            Regenerate with New Inputs
          </button>
        </div>
        <p className="muted">Each entry includes platform, format, and topic focus to remove execution friction.</p>
        {!isAuthenticated ? <p className="muted">Demo mode active. Sign in to generate a live calendar from your data.</p> : null}
        {generatedLabel ? <p className="muted">Generated at: {generatedLabel}</p> : null}
        {error ? <p className="muted">{error}</p> : null}
      </article>

      <CalendarGrid entries={entries} />
    </AppShell>
  );
}

