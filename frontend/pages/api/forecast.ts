import type { NextApiRequest, NextApiResponse } from "next";
import { buildForecast, ForecastPayload, TrendApiError } from "../../lib/trendInsights";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForecastPayload | TrendApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const topic = typeof req.query.topic === "string" ? req.query.topic : "trend topic";
    const payload = await buildForecast(topic);
    return res.status(200).json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to forecast topic.";
    return res.status(502).json({ ok: false, error: message });
  }
}
