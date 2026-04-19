import type { NextApiRequest, NextApiResponse } from "next";

type AnalyzeThumbnailRequest = {
  caption?: string;
  hasImage?: boolean;
};

type AnalyzeThumbnailResponse = {
  ok: true;
  source: "heuristic-v1";
  scoring: {
    visualClarity: number;
    hookStrength: number;
    ctaImpact: number;
    keywordRelevance: number;
    overall: number;
  };
  recommendations: string[];
};

type AnalyzeThumbnailError = {
  ok: false;
  error: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeThumbnailResponse | AnalyzeThumbnailError>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as AnalyzeThumbnailRequest;
  const caption = typeof body.caption === "string" ? body.caption.trim() : "";
  const hasImage = Boolean(body.hasImage);

  if (!caption) {
    return res.status(400).json({ ok: false, error: "caption is required" });
  }

  const words = caption.split(/\s+/).filter(Boolean);
  const hasCta = /(comment|save|share|subscribe|follow|download|click)/i.test(caption);
  const hasNumbers = /\d/.test(caption);
  const hasQuestion = /\?/.test(caption);

  const visualClarity = clampScore(55 + (hasImage ? 18 : -8) + (words.length <= 22 ? 8 : -6));
  const hookStrength = clampScore(52 + (hasNumbers ? 10 : 0) + (hasQuestion ? 8 : 0) + (words.length <= 16 ? 8 : -4));
  const ctaImpact = clampScore(48 + (hasCta ? 24 : -6));
  const keywordRelevance = clampScore(50 + Math.min(20, words.length));
  const overall = clampScore((visualClarity + hookStrength + ctaImpact + keywordRelevance) / 4);

  const recommendations = [
    hasImage ? "Thumbnail input detected: keep one focal subject and reduce background clutter." : "Add a thumbnail image to improve visual clarity scoring.",
    hasQuestion ? "Question hook detected: keep it in the first line for stronger stop-scroll behavior." : "Try a curiosity-led opening question in the first line.",
    hasCta ? "CTA detected: keep it singular and explicit for better conversion." : "Add one clear CTA (save/comment/share) near the end of caption."
  ];

  return res.status(200).json({
    ok: true,
    source: "heuristic-v1",
    scoring: {
      visualClarity,
      hookStrength,
      ctaImpact,
      keywordRelevance,
      overall
    },
    recommendations
  });
}