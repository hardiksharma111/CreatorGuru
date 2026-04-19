import type { NextApiRequest, NextApiResponse } from "next";
import {
  buildTrendAnalysis,
  TrendApiError,
  TrendOpportunity,
  supportedNiches,
  SupportedNiche
} from "../../../lib/trendInsights";

type ProviderChoice =
  | { provider: "gemini"; key: string }
  | { provider: "groq"; key: string };

type ProductionBrief = {
  topic: string;
  idealDuration: string;
  hookScript: string;
  platform: string;
  angles: string[];
  audioSuggestions: string[];
};

type TrendSearchResponse = {
  ok: true;
  query: string;
  provider: "gemini" | "groq" | "heuristic";
  niche: string;
  days: number;
  expandedTopics: string[];
  opportunities: TrendOpportunity[];
  briefs: ProductionBrief[];
  updatedAt: string;
};

function pickProvider(): ProviderChoice | null {
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    return { provider: "groq", key: groq };
  }

  const gemini = process.env.GEMINI_API_KEY;
  if (gemini) {
    return { provider: "gemini", key: gemini };
  }

  return null;
}

function asSupportedNiche(value: string | undefined): SupportedNiche {
  if (!value) {
    return "tech";
  }

  const normalized = value.trim().toLowerCase();
  return (supportedNiches as readonly string[]).includes(normalized) ? (normalized as SupportedNiche) : "tech";
}

function parseDays(value: string | undefined) {
  const parsed = Number(value || 7);
  if (!Number.isFinite(parsed)) {
    return 7;
  }
  return Math.max(7, Math.min(30, Math.round(parsed)));
}

function tryParseJsonArray(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  const jsonText = start >= 0 && end > start ? text.slice(start, end + 1) : text;
  const parsed = JSON.parse(jsonText) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Response is not an array.");
  }
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

function tryParseBriefs(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  const jsonText = start >= 0 && end > start ? text.slice(start, end + 1) : text;
  const parsed = JSON.parse(jsonText) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Brief response is not an array.");
  }

  return parsed
    .map((item) => item as Partial<ProductionBrief>)
    .filter((item) => item && typeof item.topic === "string")
    .map((item) => ({
      topic: String(item.topic || "").trim(),
      idealDuration: String(item.idealDuration || "25-40 seconds").trim(),
      hookScript: String(item.hookScript || "Start with the result first, then prove it in 3 steps.").trim(),
      platform: String(item.platform || "YouTube Shorts + Instagram Reels").trim(),
      angles: Array.isArray(item.angles) ? item.angles.map((angle) => String(angle).trim()).filter(Boolean).slice(0, 3) : [],
      audioSuggestions: Array.isArray(item.audioSuggestions)
        ? item.audioSuggestions.map((audio) => String(audio).trim()).filter(Boolean).slice(0, 3)
        : []
    }));
}

async function callGroq(apiKey: string, prompt: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned empty content.");
  }

  return text;
}

async function callGemini(apiKey: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 700 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
  if (!text) {
    throw new Error("Gemini returned empty content.");
  }

  return text;
}

async function callProvider(picked: ProviderChoice, prompt: string) {
  if (picked.provider === "groq") {
    return callGroq(picked.key, prompt);
  }

  return callGemini(picked.key, prompt);
}

function fallbackExpandedTopics(query: string) {
  const base = query.trim().toLowerCase();
  return [
    base,
    `${base} challenge`,
    `${base} tutorial`,
    `${base} trend`,
    `${base} beginner guide`,
    `${base} creator strategy`
  ].map((topic) => topic.trim()).filter(Boolean);
}

async function expandQueryTopics(query: string, niche: SupportedNiche, picked: ProviderChoice | null) {
  if (!picked) {
    return { topics: fallbackExpandedTopics(query), provider: "heuristic" as const };
  }

  const prompt = [
    "Expand this creator trend query into 6 to 8 specific sub-trends.",
    "Return only valid JSON array of short strings.",
    "No markdown, no explanation.",
    `Niche context: ${niche}`,
    `Query: ${query}`
  ].join("\n");

  try {
    const text = await callProvider(picked, prompt);
    const topics = tryParseJsonArray(text).slice(0, 8);
    return {
      topics: topics.length ? topics : fallbackExpandedTopics(query),
      provider: picked.provider
    };
  } catch {
    return { topics: fallbackExpandedTopics(query), provider: "heuristic" as const };
  }
}

function fallbackBriefForOpportunity(opportunity: TrendOpportunity): ProductionBrief {
  const fast = opportunity.best_format === "Short-form" || opportunity.best_format === "Tutorial";
  return {
    topic: opportunity.topic,
    idealDuration: fast ? "25-40 seconds" : "4-8 minutes",
    hookScript: `Everyone says ${opportunity.topic} is crowded. Here is the angle still working this week and how to ship it today.`,
    platform: fast ? "YouTube Shorts + Instagram Reels" : "YouTube Long-form",
    angles: opportunity.recommended_angles.slice(0, 3),
    audioSuggestions: [
      "Use a currently rising original audio in your niche",
      "Use a clean rhythmic loop with no vocal conflict",
      "A/B test one high-energy vs one calm narrative bed"
    ]
  };
}

async function generateBriefs(opportunities: TrendOpportunity[], picked: ProviderChoice | null) {
  const top = opportunities.slice(0, 6);
  if (!top.length) {
    return { briefs: [] as ProductionBrief[], provider: picked?.provider || "heuristic" as const };
  }

  if (!picked) {
    return { briefs: top.map(fallbackBriefForOpportunity), provider: "heuristic" as const };
  }

  const compactInput = top.map((item) => ({
    topic: item.topic,
    direction: item.direction,
    format: item.best_format,
    score: item.trend_score,
    angles: item.recommended_angles.slice(0, 3)
  }));

  const prompt = [
    "You are a creator strategist.",
    "Generate production briefs for each topic in the JSON input.",
    "Return ONLY JSON array with objects using this exact shape:",
    "{ topic, idealDuration, hookScript, platform, angles, audioSuggestions }",
    "angles must be exactly 3 items. audioSuggestions must be exactly 3 items.",
    "Input:",
    JSON.stringify(compactInput)
  ].join("\n");

  try {
    const text = await callProvider(picked, prompt);
    const aiBriefs = tryParseBriefs(text);
    const merged = top.map((opportunity) => {
      const found = aiBriefs.find((brief) => brief.topic.toLowerCase() === opportunity.topic.toLowerCase());
      return found || fallbackBriefForOpportunity(opportunity);
    });
    return { briefs: merged, provider: picked.provider };
  } catch {
    return { briefs: top.map(fallbackBriefForOpportunity), provider: "heuristic" as const };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendSearchResponse | TrendApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const rawQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!rawQuery) {
    return res.status(400).json({ ok: false, error: "q is required" });
  }

  const niche = asSupportedNiche(typeof req.query.niche === "string" ? req.query.niche : undefined);
  const days = parseDays(typeof req.query.days === "string" ? req.query.days : undefined);

  try {
    const picked = pickProvider();
    const expanded = await expandQueryTopics(rawQuery, niche, picked);
    const analysis = await buildTrendAnalysis(niche, days, {
      customTopics: expanded.topics,
      useOnlyCustomTopics: true
    });
    const briefResult = await generateBriefs(analysis.opportunities, picked);

    return res.status(200).json({
      ok: true,
      query: rawQuery,
      provider: briefResult.provider,
      niche,
      days,
      expandedTopics: expanded.topics,
      opportunities: analysis.opportunities,
      briefs: briefResult.briefs,
      updatedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to run trend search.";
    return res.status(502).json({ ok: false, error: message });
  }
}
