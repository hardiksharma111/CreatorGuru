import type { NextApiRequest, NextApiResponse } from "next";
import { buildYouTubeSpotlight, TrendApiError, YoutubeVideo } from "../../lib/trendInsights";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: true; niche: string; videos: YoutubeVideo[] } | TrendApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const niche = typeof req.query.niche === "string" ? req.query.niche : "tech";
    const payload = await buildYouTubeSpotlight(niche);
    return res.status(200).json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch YouTube spotlight.";
    return res.status(502).json({ ok: false, error: message });
  }
}
