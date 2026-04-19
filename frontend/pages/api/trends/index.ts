import type { NextApiRequest, NextApiResponse } from "next";
import { buildTrendAnalysis, TrendApiError, TrendAnalysisPayload } from "../../../lib/trendInsights";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendAnalysisPayload | TrendApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const niche = typeof req.query.niche === "string" ? req.query.niche : "tech";
    const days = Number(Array.isArray(req.query.days) ? req.query.days[0] : req.query.days || 7);
    const payload = await buildTrendAnalysis(niche, days);
    return res.status(200).json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to build trend analysis.";
    return res.status(502).json({ ok: false, error: message });
  }
}
