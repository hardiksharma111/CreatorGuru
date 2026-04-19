import type { NextApiRequest, NextApiResponse } from "next";

type ChatMessageBody = {
  message?: string;
  platform?: string;
  context?: {
    currentPlatformMix?: string;
    topFormat?: string;
    latestScore?: string;
    calendarFocus?: string;
  };
};

type ChatMessageResponse = {
  ok: true;
  provider: "gemini" | "groq";
  reply: {
    role: "assistant";
    content: string;
    time: string;
  };
  intent: string;
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

function classifyIntent(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("post") && normalized.includes("weekend")) {
    return "content-plan";
  }

  if (normalized.includes("hook") || normalized.includes("retention")) {
    return "hook-optimization";
  }

  if (normalized.includes("time") || normalized.includes("post")) {
    return "posting-window";
  }

  return "strategy-advice";
}

function buildPrompt(message: string, platform?: string, context?: ChatMessageBody["context"]) {
  const platformLabel = platform?.trim() || "Instagram + YouTube";
  const contextBlock = [
    `Platform mix: ${context?.currentPlatformMix || "unknown"}`,
    `Top format: ${context?.topFormat || "unknown"}`,
    `Latest score: ${context?.latestScore || "unknown"}`,
    `Calendar focus: ${context?.calendarFocus || "unknown"}`
  ].join("\n");

  return [
    "You are CreatorGuru, an AI growth coach for social creators.",
    "Give practical, concise, and execution-ready advice.",
    `Platform scope: ${platformLabel}.`,
    "Creator context:",
    contextBlock,
    "User message:",
    message,
    "Respond in plain text with: 1) diagnosis 2) clear next actions 3) one test to run."
  ].join("\n\n");
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 500 }
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
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
      messages: [
        { role: "system", content: "You are CreatorGuru, a concise growth coach." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ChatMessageResponse | { ok: false; error: string }>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as ChatMessageBody;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return res.status(400).json({ ok: false, error: "message is required" });
  }

  const picked = pickProvider();
  if (!picked) {
    return res.status(503).json({
      ok: false,
      error: "No AI provider key configured. Add GEMINI_API_KEY or GROQ_API_KEY in keys.md or environment variables."
    });
  }

  const prompt = buildPrompt(message, body.platform, body.context);
  const intent = classifyIntent(message);

  const run = async () => {
    if (picked.provider === "gemini") {
      return callGemini(picked.key, prompt);
    }
    return callGroq(picked.key, prompt);
  };

  return run()
    .then((content) => {
      res.status(200).json({
        ok: true,
        provider: picked.provider,
        intent,
        reply: {
          role: "assistant",
          content,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      });
    })
    .catch((error: unknown) => {
      const messageText = error instanceof Error ? error.message : "Provider call failed.";
      res.status(502).json({ ok: false, error: messageText });
    });
}