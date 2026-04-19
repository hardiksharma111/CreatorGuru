import type { NextApiRequest, NextApiResponse } from "next";

type HealthScore = {
  label: "Reach" | "Engagement" | "Consistency" | "Growth Velocity";
  value: number;
  helper: string;
  delta: string;
};

type AnalyzeProfileResponse = {
  ok: true;
  source: "gemini" | "groq";
  profile: {
    pulse: string;
    thisWeekPlannedPosts: number;
    summary: string;
    priorityMove: string;
    priorityProgress: number;
    healthScores: HealthScore[];
    updatedAt: string;
  };
};

type AnalyzeProfileErrorResponse = {
  ok: false;
  error: string;
};

type ProviderChoice =
  | { provider: "gemini"; key: string }
  | { provider: "groq"; key: string };

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

function buildPrompt() {
  return [
    "You are a creator analytics coach.",
    "Generate a realistic weekly profile summary for a solo creator on Instagram + YouTube.",
    "Return ONLY valid JSON object with this exact shape:",
    "{ pulse, thisWeekPlannedPosts, summary, priorityMove, priorityProgress, healthScores }",
    "healthScores must contain 4 items with labels: Reach, Engagement, Consistency, Growth Velocity.",
    "Each score item shape: { label, value, helper, delta }.",
    "value should be an integer between 0 and 100.",
    "priorityProgress should be an integer between 0 and 100."
  ].join("\n");
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 700 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
  if (!text) {
    throw new Error("Gemini returned empty profile output.");
  }

  return text;
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.45
    })
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned empty profile output.");
  }

  return text;
}

function parseProfile(raw: string): AnalyzeProfileResponse["profile"] {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const jsonText = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
  const parsed = JSON.parse(jsonText) as AnalyzeProfileResponse["profile"];

  if (!parsed || typeof parsed.pulse !== "string" || !Array.isArray(parsed.healthScores)) {
    throw new Error("Profile payload shape was invalid.");
  }

  return {
    pulse: parsed.pulse,
    thisWeekPlannedPosts: Number(parsed.thisWeekPlannedPosts || 0),
    summary: String(parsed.summary || ""),
    priorityMove: String(parsed.priorityMove || ""),
    priorityProgress: Number(parsed.priorityProgress || 0),
    updatedAt: new Date().toISOString(),
    healthScores: parsed.healthScores
      .slice(0, 4)
      .map((item) => ({
        label: item.label,
        value: Math.max(0, Math.min(100, Number(item.value || 0))),
        helper: String(item.helper || ""),
        delta: String(item.delta || "")
      })) as HealthScore[]
  };
}

export default function handler(_req: NextApiRequest, res: NextApiResponse<AnalyzeProfileResponse | AnalyzeProfileErrorResponse>) {
  const picked = pickProvider();
  if (!picked) {
    return res.status(503).json({
      ok: false,
      error: "No AI provider key configured. Add GEMINI_API_KEY or GROQ_API_KEY in keys.md or environment variables."
    });
  }

  const prompt = buildPrompt();
  const run = picked.provider === "gemini" ? callGemini(picked.key, prompt) : callGroq(picked.key, prompt);

  return run
    .then((rawText) => {
      const profile = parseProfile(rawText);

      res.status(200).json({
        ok: true,
        source: picked.provider,
        profile
      });
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to generate profile insights.";
      res.status(502).json({ ok: false, error: message });
    });
}
