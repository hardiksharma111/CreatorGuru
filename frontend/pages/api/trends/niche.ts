import type { NextApiRequest, NextApiResponse } from "next";

type TrendOpportunity = {
  topic: string;
  uplift: string;
  angle: string;
  why: string;
  tags: string[];
};

type TrendsNicheResponse = {
  ok: true;
  source: "live-api";
  niche: string;
  opportunities: TrendOpportunity[];
};

const baseTemplates: TrendOpportunity[] = [
  {
    topic: "Behind-the-Scenes Build Logs",
    uplift: "+22%",
    angle: "Show your process in under 60 seconds with one core lesson.",
    why: "Transparent process content continues to outperform polished-only formats.",
    tags: ["creator", "strategy", "shorts"]
  },
  {
    topic: "3 Mistakes I Made This Week",
    uplift: "+19%",
    angle: "Lead with one painful mistake, then rapid-fire fixes.",
    why: "Failure-story framing is currently driving stronger retention in discovery feeds.",
    tags: ["growth", "retention"]
  },
  {
    topic: "Trend Breakdown: What Actually Works",
    uplift: "+17%",
    angle: "Compare hype vs reality using your own data from recent posts.",
    why: "Audiences are rewarding practical debunks over generic trend summaries.",
    tags: ["analysis", "education"]
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse<TrendsNicheResponse>) {
  const nicheFromQuery = typeof req.query.niche === "string" ? req.query.niche.trim() : "";
  const niche = nicheFromQuery || "creator economy";
  const opportunities = baseTemplates.map((item) => ({
    ...item,
    topic: `${item.topic} (${niche})`,
    why: `${item.why} In ${niche}, this aligns with current audience questions and comment themes.`
  }));

  res.status(200).json({
    ok: true,
    source: "live-api",
    niche,
    opportunities
  });
}
