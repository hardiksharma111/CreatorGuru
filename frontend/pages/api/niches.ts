import type { NextApiRequest, NextApiResponse } from "next";
import { buildNicheReport, supportedNiches, TrendApiError } from "../../lib/trendInsights";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: true; niches: readonly string[]; report: ReturnType<typeof buildNicheReport> } | TrendApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const niche = typeof req.query.niche === "string" ? req.query.niche : "tech";
  return res.status(200).json({ ok: true, niches: supportedNiches, report: buildNicheReport(niche) });
}
