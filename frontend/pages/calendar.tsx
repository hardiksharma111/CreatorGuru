import { AppShell } from "../components/AppShell";
import { CalendarGrid } from "../components/CalendarGrid";
import { calendarEntries } from "../data/mockData";

export default function Page() {
  return (
    <AppShell
      title="30-Day Content Calendar"
      subtitle="Generate, adjust, and execute a personalized publishing plan"
      currentPath="/calendar"
    >
      <article className="card stack">
        <div className="row">
          <button className="btn btn-primary" type="button">Generate Calendar</button>
          <button className="btn btn-secondary" type="button">Regenerate with New Trend Inputs</button>
        </div>
        <p className="muted">Each entry includes platform, format, and topic focus to remove execution friction.</p>
      </article>

      <CalendarGrid entries={calendarEntries} />
    </AppShell>
  );
}

