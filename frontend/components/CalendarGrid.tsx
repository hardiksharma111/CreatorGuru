type CalendarEntry = { day: number; topic: string };

export function CalendarGrid({ entries }: { entries: CalendarEntry[] }) {
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.day}>Day {entry.day}: {entry.topic}</li>
      ))}
    </ul>
  );
}

