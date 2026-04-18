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
  provider: "local-adapter" | "gemini" | "groq";
  reply: {
    role: "assistant";
    content: string;
    time: string;
  };
  intent: string;
};

function pickProvider(): ChatMessageResponse["provider"] {
  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  if (process.env.GROQ_API_KEY) {
    return "groq";
  }

  return "local-adapter";
}

function buildReply(message: string, platform?: string, context?: ChatMessageBody["context"]) {
  const normalized = message.toLowerCase();
  const platformLabel = platform?.trim() || "your creator stack";
  const followUp = context?.calendarFocus ? ` Your current calendar focus is ${context.calendarFocus}.` : "";

  if (normalized.includes("post") && normalized.includes("weekend")) {
    return {
      intent: "content-plan",
      content: `For ${platformLabel}, use a myth-vs-reality angle on Saturday and a process breakdown on Sunday.${followUp} Keep the hook under 2 seconds and end with a direct CTA.`
    };
  }

  if (normalized.includes("hook") || normalized.includes("retention")) {
    return {
      intent: "hook-optimization",
      content: `Open with the outcome first, then show the tension. Your first 3 seconds should state the payoff clearly.${followUp} Pair the hook with a stronger on-screen text line.`
    };
  }

  if (normalized.includes("time") || normalized.includes("post")) {
    return {
      intent: "posting-window",
      content: `Post at the strongest engagement window for ${platformLabel} after a short warm-up story. If you want higher reach, test one slot in the evening and one on a weekend morning.${followUp}`
    };
  }

  return {
    intent: "strategy-advice",
    content: `You should keep the message concrete and tied to a measurable outcome. Based on ${platformLabel}, I would optimize for consistency, sharper hooks, and one repeatable content format.${followUp}`
  };
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

  const provider = pickProvider();
  const reply = buildReply(message, body.platform, body.context);

  return res.status(200).json({
    ok: true,
    provider,
    intent: reply.intent,
    reply: {
      role: "assistant",
      content: reply.content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  });
}