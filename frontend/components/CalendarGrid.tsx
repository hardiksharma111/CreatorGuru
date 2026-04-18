type CalendarEntry = {
  day: number;
  topic: string;
  platform: "YouTube" | "Instagram";
  contentType: "Reel" | "Short" | "Long-form";
};

export function CalendarGrid({ entries }: { entries: CalendarEntry[] }) {
  return (
    <ul className="calendar-grid" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {entries.map((entry) => (
        <li key={entry.day} className="calendar-item stack">
          <p style={{ fontWeight: 800 }}>Day {entry.day}</p>
          <p>{entry.topic}</p>
          <div className="row">
            <span className="tag">{entry.platform}</span>
            <span className="tag">{entry.contentType}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

