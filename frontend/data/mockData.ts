export const healthScores = [
  { label: "Reach", value: 78, helper: "Strong exposure from short-form content.", delta: "+8% this month" },
  { label: "Engagement", value: 71, helper: "Audience response is improving on Q&A posts.", delta: "+5% this month" },
  { label: "Consistency", value: 64, helper: "Posting cadence has gaps on weekends.", delta: "-2% this month" },
  { label: "Growth Velocity", value: 69, helper: "Channel momentum is healthy but uneven.", delta: "+6% this month" }
];

export const trendOpportunities = [
  {
    topic: "Behind-the-Scenes Build Logs",
    uplift: "+22%",
    angle: "Show your process in under 60 seconds with one core lesson.",
    why: "Your audience has recently favored transparent, process-heavy content.",
    tags: ["creator", "strategy", "shorts"]
  },
  {
    topic: "3 Mistakes I Made This Week",
    uplift: "+19%",
    angle: "Lead with one painful mistake, then rapid-fire fixes.",
    why: "High-performing creators in your niche are seeing better retention on failure stories.",
    tags: ["growth", "retention"]
  },
  {
    topic: "Trend Breakdown: What Actually Works",
    uplift: "+17%",
    angle: "Compare hype vs reality using your own performance data.",
    why: "Audience comments indicate demand for practical, non-generic advice.",
    tags: ["analysis", "education"]
  }
];

export const coachMessages = [
  {
    role: "assistant" as const,
    content: "You had a retention drop at 0:07 in your last reel. Tighten the opening and show the final payoff in the first 2 seconds.",
    time: "09:11"
  },
  {
    role: "user" as const,
    content: "What should I post this weekend to recover momentum?",
    time: "09:12"
  },
  {
    role: "assistant" as const,
    content: "Post a short myth-vs-reality video tied to your top performing topic, then follow with a carousel recap.",
    time: "09:12"
  }
];

export const calendarEntries = [
  { day: 1, topic: "Quick Win Tutorial", platform: "Instagram" as const, contentType: "Reel" as const },
  { day: 2, topic: "Case Study Breakdown", platform: "YouTube" as const, contentType: "Long-form" as const },
  { day: 3, topic: "Myth vs Reality", platform: "YouTube" as const, contentType: "Short" as const },
  { day: 4, topic: "Subscriber Q&A", platform: "Instagram" as const, contentType: "Reel" as const },
  { day: 5, topic: "Workflow Walkthrough", platform: "YouTube" as const, contentType: "Long-form" as const },
  { day: 6, topic: "Hot Take Reaction", platform: "Instagram" as const, contentType: "Reel" as const },
  { day: 7, topic: "Weekly Recap", platform: "YouTube" as const, contentType: "Short" as const }
];

export const competitorRows = [
  { name: "CreatorAlpha", postsPerWeek: 5, engagementRate: "6.2%", growthRate: "+2.4%" },
  { name: "StudioBravo", postsPerWeek: 3, engagementRate: "7.8%", growthRate: "+1.2%" },
  { name: "GrowthNinja", postsPerWeek: 6, engagementRate: "5.4%", growthRate: "+3.1%" }
];

export const suggestedPrompts = [
  "Why did my last reel underperform?",
  "What should I post this weekend?",
  "What format should I double down on?",
  "How can I improve hook retention in first 5 seconds?"
];
