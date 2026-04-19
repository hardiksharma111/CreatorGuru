export const healthScores = [
  { label: "Reach", value: 78, helper: "Strong exposure from short-form content.", delta: "+8% this month" },
  { label: "Engagement", value: 71, helper: "Audience response is improving on Q&A posts.", delta: "+5% this month" },
  { label: "Consistency", value: 64, helper: "Posting cadence has gaps on weekends.", delta: "-2% this month" },
  { label: "Growth Velocity", value: 69, helper: "Channel momentum is healthy but uneven.", delta: "+6% this month" }
];

export const demoProfile = {
  pulse: "Momentum is positive, but your strongest leverage is consistency and sharper hooks.",
  thisWeekPlannedPosts: 3,
  summary: "Demo profile: your short-form hooks are improving; tighten posting consistency for stronger weekly growth.",
  priorityMove: "2 educational reels + 1 breakdown short this weekend",
  priorityProgress: 62,
  healthScores
};

export const trendOpportunities = [
  {
    topic: "Behind-the-Scenes Build Logs",
    uplift: "+22%",
    angle: "Show your process in under 60 seconds with one core lesson.",
    why: "Your audience has recently favored transparent, process-heavy content.",
    tags: ["creator", "strategy", "shorts"],
    confidenceScore: 74,
    evidence: {
      summary: "Demo discovery signal",
      points: ["Strong retention potential", "High replay likelihood", "Format fit for shorts"]
    }
  },
  {
    topic: "3 Mistakes I Made This Week",
    uplift: "+19%",
    angle: "Lead with one painful mistake, then rapid-fire fixes.",
    why: "High-performing creators in your niche are seeing better retention on failure stories.",
    tags: ["growth", "retention"],
    confidenceScore: 68,
    evidence: {
      summary: "Demo discovery signal",
      points: ["High comment intent", "Strong first-hook opportunity"]
    }
  }
];

export const coachMessages = [
  {
    role: "assistant" as const,
    content: "Demo coach: test one clearer hook and one stronger CTA this week.",
    time: "09:11"
  }
];

export const calendarEntries = [
  { day: 1, topic: "Quick Win Tutorial", platform: "Instagram" as const, contentType: "Reel" as const },
  { day: 4, topic: "Case Study Breakdown", platform: "YouTube" as const, contentType: "Long-form" as const },
  { day: 7, topic: "Myth vs Reality", platform: "YouTube" as const, contentType: "Short" as const },
  { day: 10, topic: "Subscriber Q&A", platform: "Instagram" as const, contentType: "Reel" as const },
  { day: 14, topic: "Workflow Walkthrough", platform: "YouTube" as const, contentType: "Long-form" as const }
];

export const competitorRows = [
  { name: "CreatorAlpha", postsPerWeek: 5, engagementRate: "6.2%", growthRate: "+2.4%", engagementRateValue: 6.2, growthRateValue: 2.4 },
  { name: "StudioBravo", postsPerWeek: 3, engagementRate: "7.8%", growthRate: "+1.2%", engagementRateValue: 7.8, growthRateValue: 1.2 },
  { name: "GrowthNinja", postsPerWeek: 6, engagementRate: "5.4%", growthRate: "+3.1%", engagementRateValue: 5.4, growthRateValue: 3.1 }
];

export const suggestedPrompts = [
  "Why did my last reel underperform?",
  "What should I post this weekend?",
  "What format should I double down on?",
  "How can I improve hook retention in first 5 seconds?"
];