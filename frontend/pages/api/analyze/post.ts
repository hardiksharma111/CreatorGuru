import type { NextApiRequest, NextApiResponse } from "next";

type AnalyzePostRequest = {
  url?: string;
};

type AnalyzePostResponse = {
  ok: true;
  source: "heuristic-v1";
  audit: {
    overallScore: number;
    worked: string[];
    underperformed: string[];
    nextIteration: string[];
  };
};

type AnalyzePostError = {
  ok: false;
  error: string;
};

function scoreFromUrl(url: string) {
  const lengthFactor = Math.min(18, Math.floor(url.length / 6));
  const hasVideoHint = /watch|reel|short|video|instagram|youtube/i.test(url) ? 10 : 0;
  const hasTrackingNoise = /utm_|\?|&/.test(url) ? -4 : 0;
  return Math.max(45, Math.min(92, 58 + lengthFactor + hasVideoHint + hasTrackingNoise));
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzePostResponse | AnalyzePostError>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as AnalyzePostRequest;
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!url) {
    return res.status(400).json({ ok: false, error: "url is required" });
  }

  const overallScore = scoreFromUrl(url);

  const worked = [
    "Clear topic targeting aligned with the linked platform format.",
    "Strong potential hook if the first 2 seconds show outcome quickly.",
    "URL pattern suggests short-form compatibility for discovery feeds."
  ];

  const underperformed = [
    "Likely retention drop in the transition between hook and explanation.",
    "Potentially broad framing that can dilute comment intent.",
    "CTA may not be specific enough to drive saves/shares."
  ];

  const nextIteration = [
    "Open with the final result first, then show the 3-step method.",
    "Use one explicit promise in on-screen text during the first 3 seconds.",
    "End with a single CTA tied to one measurable action (save or comment keyword)."
  ];

  return res.status(200).json({
    ok: true,
    source: "heuristic-v1",
    audit: {
      overallScore,
      worked,
      underperformed,
      nextIteration
    }
  });
}