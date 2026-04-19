import type { NextApiRequest, NextApiResponse } from "next";

type CalendarEntry = {
  day: number;
  topic: string;
  platform: "YouTube" | "Instagram";
  contentType: "Reel" | "Short" | "Long-form";
};

type GenerateCalendarRequest = {
  niche?: string;
  cadencePerWeek?: number;
};

type GenerateCalendarResponse = {
  ok: true;
  plan: {
    niche: string;
    cadencePerWeek: number;
    days: number;
    generatedAt: string;
    entries: CalendarEntry[];
  };
};

type GenerateCalendarError = {
  ok: false;
  error: string;
};

const topicTemplates = [
  "Myth vs Reality",
  "3 Mistakes to Avoid",
  "Beginner Blueprint",
  "Behind the Scenes",
  "Quick Workflow",
  "Case Study Breakdown",
  "Tool Stack Walkthrough",
  "Hot Take + Lessons",
  "Q&A from Comments",
  "One-Week Challenge"
];

function clampCadence(value: number) {
  return Math.max(1, Math.min(14, Math.round(value)));
}

function buildEntries(niche: string, cadencePerWeek: number, days = 30): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  const totalPosts = Math.max(1, Math.round((days * cadencePerWeek) / 7));
  const plannedDays = new Set<number>();

  for (let index = 1; index <= totalPosts; index += 1) {
    const projectedDay = Math.round(((index - 0.5) * days) / totalPosts);
    const clampedDay = Math.max(1, Math.min(days, projectedDay));
    plannedDays.add(clampedDay);
  }

  for (const day of Array.from(plannedDays).sort((a, b) => a - b)) {

    const platform: CalendarEntry["platform"] = day % 3 === 0 ? "YouTube" : "Instagram";
    const contentType: CalendarEntry["contentType"] = platform === "YouTube"
      ? (day % 4 === 0 ? "Long-form" : "Short")
      : "Reel";

    const template = topicTemplates[(day - 1) % topicTemplates.length];
    entries.push({
      day,
      topic: `${template} (${niche})`,
      platform,
      contentType
    });
  }

  return entries;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateCalendarResponse | GenerateCalendarError>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as GenerateCalendarRequest;
  const niche = typeof body.niche === "string" && body.niche.trim() ? body.niche.trim() : "creator economy";
  const cadenceInput = Number(body.cadencePerWeek ?? 5);

  if (!Number.isFinite(cadenceInput)) {
    return res.status(400).json({ ok: false, error: "cadencePerWeek must be a valid number" });
  }

  const cadencePerWeek = clampCadence(cadenceInput);
  const entries = buildEntries(niche, cadencePerWeek, 30);

  return res.status(200).json({
    ok: true,
    plan: {
      niche,
      cadencePerWeek,
      days: 30,
      generatedAt: new Date().toISOString(),
      entries
    }
  });
}