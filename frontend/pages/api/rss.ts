import type { NextApiRequest, NextApiResponse } from "next";
import { buildRssPulse, RssHeadline, TrendApiError } from "../../lib/trendInsights";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: true; niche: string; headlines: RssHeadline[] } | TrendApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const niche = typeof req.query.niche === "string" ? req.query.niche : "tech";
    const payload = await buildRssPulse(niche);
    return res.status(200).json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch RSS headlines.";
    return res.status(502).json({ ok: false, error: message });
  }
}
