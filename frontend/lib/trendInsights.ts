export const supportedNiches = [
  "tech",
  "gaming",
  "finance",
  "fitness",
  "beauty",
  "cooking",
  "travel",
  "education"
] as const;

export type SupportedNiche = (typeof supportedNiches)[number];

export type TrendDirection = "accelerating" | "rising" | "steady" | "cooling";
export type TrendFormat = "Short-form" | "Long-form" | "Tutorial" | "Breakdown" | "Carousel" | "Live";

export type ForecastPoint = {
  day: string;
  actual?: number | null;
  forecast?: number | null;
};

export type TrendOpportunity = {
  topic: string;
  trend_score: number;
  youtube_growth_pct: number;
  google_interest: number;
  sentiment: number;
  forecast_7d: number[];
  history_7d: number[];
  recommended_angles: string[];
  direction: TrendDirection;
  best_format: TrendFormat;
  why_now: string;
  evidence: {
    source_breakdown: string[];
    summary: string;
    momentum_window: string;
    overlap_score: number;
  };
};

export type YoutubeVideo = {
  title: string;
  views: number;
  likes: number;
  channel: string;
  publishedAt: string;
  view_velocity: number;
  thumbnail: string;
  url: string;
};

export type RssHeadline = {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  timeAgo: string;
};

export type TrendAnalysisPayload = {
  ok: true;
  niche: SupportedNiche | string;
  days: number;
  updatedAt: string;
  opportunities: TrendOpportunity[];
  youtube: YoutubeVideo[];
  rss: RssHeadline[];
  summary: {
    direction: string;
    bestVideoType: string;
    nextAction: string;
  };
};

export type ForecastPayload = {
  ok: true;
  topic: string;
  updatedAt: string;
  history_7d: number[];
  forecast_7d: number[];
  recommended_angles: string[];
  direction: TrendDirection;
  best_format: TrendFormat;
};

export type TrendApiError = {
  ok: false;
  error: string;
};

type TrendAnalysisOptions = {
  customTopics?: string[];
  useOnlyCustomTopics?: boolean;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

const nicheSeeds: Record<SupportedNiche, string[]> = {
  tech: ["AI tools", "no-code workflow", "creator automation", "productivity stack", "phone hacks"],
  gaming: ["patch notes", "speedrun", "loadout guide", "reaction clip", "challenge run"],
  finance: ["money tips", "budget systems", "side income", "investing basics", "cash flow"],
  fitness: ["home workout", "fat loss", "meal prep", "mobility", "training split"],
  beauty: ["glow up", "skincare routine", "makeup tutorial", "product review", "before after"],
  cooking: ["meal prep", "high-protein recipe", "easy dinner", "budget meals", "air fryer"],
  travel: ["hidden gem", "travel hacks", "budget travel", "packing list", "itinerary"],
  education: ["study tips", "exam prep", "learn faster", "lesson breakdown", "explainer"]
};

const nicheAngles: Record<SupportedNiche, string[]> = {
  tech: ["workflow automation", "AI shortcut demo", "tool stack teardown"],
  gaming: ["meta breakdown", "patch reaction", "challenge clip"],
  finance: ["mistake breakdown", "simple framework", "money challenge"],
  fitness: ["form breakdown", "7-day challenge", "routine reset"],
  beauty: ["routine refresh", "product ranking", "before/after reveal"],
  cooking: ["recipe shortcut", "budget swap", "one-pan breakdown"],
  travel: ["planning guide", "budget itinerary", "hidden spot reveal"],
  education: ["fast explainer", "study method", "myth vs reality"]
};

const rssSources: Record<SupportedNiche, string[]> = {
  tech: [
    "https://www.theverge.com/rss/index.xml",
    "https://feeds.arstechnica.com/arstechnica/index",
    "https://techcrunch.com/feed/",
    "https://news.google.com/rss/search?q=tech+creator+tools&hl=en-US&gl=US&ceid=US:en"
  ],
  gaming: [
    "https://www.pcgamer.com/rss/",
    "https://www.theverge.com/games/rss/index.xml",
    "https://news.google.com/rss/search?q=gaming+trends&hl=en-US&gl=US&ceid=US:en",
    "https://www.ign.com/rss/articles"
  ],
  finance: [
    "https://www.investing.com/rss/news.rss",
    "https://news.google.com/rss/search?q=personal+finance+trends&hl=en-US&gl=US&ceid=US:en",
    "https://www.marketwatch.com/rss/topstories",
    "https://www.ft.com/?format=rss"
  ],
  fitness: [
    "https://www.bodybuilding.com/rss/articles",
    "https://news.google.com/rss/search?q=fitness+trends&hl=en-US&gl=US&ceid=US:en",
    "https://www.menshealth.com/rss/all.xml/",
    "https://www.womenshealthmag.com/rss/all.xml/"
  ],
  beauty: [
    "https://www.allure.com/feed/rss",
    "https://www.elle.com/rss/beauty/index.xml/",
    "https://news.google.com/rss/search?q=beauty+trends&hl=en-US&gl=US&ceid=US:en",
    "https://www.glamour.com/rss/all.xml/"
  ],
  cooking: [
    "https://www.seriouseats.com/rss",
    "https://www.bonappetit.com/feed/rss",
    "https://news.google.com/rss/search?q=cooking+trends&hl=en-US&gl=US&ceid=US:en",
    "https://www.foodnetwork.com/feeds/latest-news.xml"
  ],
  travel: [
    "https://www.lonelyplanet.com/news/feed/rss",
    "https://news.google.com/rss/search?q=travel+trends&hl=en-US&gl=US&ceid=US:en",
    "https://www.cntraveler.com/feed/rss",
    "https://www.travelandleisure.com/feed/rss"
  ],
  education: [
    "https://www.edutopia.org/rss.xml",
    "https://news.google.com/rss/search?q=education+trends&hl=en-US&gl=US&ceid=US:en",
    "https://www.kqed.org/mindshift/feed",
    "https://www.chronicle.com/feed/rss"
  ]
};

const positiveWords = new Set([
  "win", "growth", "simple", "easy", "fast", "best", "improve", "improved", "boost", "top", "new", "clear", "smart",
  "powerful", "viral", "trending", "helps", "help", "save", "strong", "hot", "fresh", "easy", "better", "creative"
]);

const negativeWords = new Set([
  "bad", "hard", "slow", "weak", "drop", "decline", "declining", "risk", "crisis", "scam", "expensive", "complicated",
  "broken", "fear", "loss", "poor", "stuck", "worry", "warning", "danger", "dead", "low"
]);

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function ttlCache<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.value);
  }

  return loader().then((value) => {
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  });
}

async function fetchText(url: string, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractRssTag(itemXml: string, tag: string) {
  const match = itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] ? decodeXml(match[1]) : "";
}

function parseRssItems(xml: string) {
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)).map((match) => match[1]);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function words(value: string) {
  return stripHtml(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 2);
}

function similarityScore(left: string, right: string) {
  const leftWords = new Set(words(left));
  const rightWords = new Set(words(right));
  let overlap = 0;
  for (const word of leftWords) {
    if (rightWords.has(word)) {
      overlap += 1;
    }
  }
  return overlap / Math.max(1, Math.min(leftWords.size, rightWords.size));
}

function sentimentCompound(text: string) {
  const tokens = words(text);
  let score = 0;
  let total = 0;
  for (const token of tokens) {
    if (positiveWords.has(token)) {
      score += 1;
      total += 1;
    } else if (negativeWords.has(token)) {
      score -= 1;
      total += 1;
    }
  }
  if (total === 0) {
    return 0;
  }
  return clamp((score / total + 1) / 2, 0, 1);
}

function formatTimeAgo(dateIso: string) {
  const date = new Date(dateIso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatCompact(value: number) {
  if (value >= 1_000_000_000) return `${roundOne(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${roundOne(value / 1_000_000)}M`;
  if (value >= 1_000) return `${roundOne(value / 1_000)}k`;
  return `${Math.round(value)}`;
}

function formatSignedPercent(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${roundOne(value)}%`;
}

function formatCurrencyish(value: number) {
  return value.toLocaleString("en-US");
}

function pickFormat(topic: string, niche: SupportedNiche): TrendFormat {
  const normalized = topic.toLowerCase();
  if (/(tutorial|how to|workflow|shortcut|tips|hack)/.test(normalized)) return "Tutorial";
  if (/(breakdown|case study|what actually works|myth|analysis)/.test(normalized)) return "Breakdown";
  if (/(live|q&a|reaction|challenge|stream)/.test(normalized)) return "Live";
  if (/(before|after|routine|guide)/.test(normalized)) return "Carousel";
  if (niche === "gaming") return "Short-form";
  return "Long-form";
}

function directionFromSeries(history: number[], forecast: number[]): TrendDirection {
  const first = history[0] ?? 0;
  const last = forecast[forecast.length - 1] ?? 0;
  const delta = last - first;
  if (delta >= 12) return "accelerating";
  if (delta >= 4) return "rising";
  if (delta <= -8) return "cooling";
  return "steady";
}

function buildAngles(topic: string, format: TrendFormat, niche: string, direction: TrendDirection) {
  const base = [
    `Why ${topic} is picking up in ${niche}`,
    `${format} format to use if you want to ride ${topic}`,
    `3 ways creators can use ${topic} before it saturates`
  ];
  if (direction === "accelerating") {
    return base.map((item) => item.replace("is picking up", "is accelerating"));
  }
  if (direction === "cooling") {
    return [
      `${topic} explained before the wave cools off`,
      `What to publish instead of chasing ${topic}`,
      `How to position ${topic} as a durable series`
    ];
  }
  return base;
}

function buildForecastSeries(seed: number, trendScore: number, slopeBias = 0) {
  const base = clamp(Math.round(45 + (seed % 30) + trendScore * 0.2), 10, 95);
  const slope = clamp((trendScore - 50) / 10 + slopeBias, -6, 8);
  const history = Array.from({ length: 7 }, (_, index) => {
    const drift = (index - 6) * slope * 0.7;
    const seasonality = Math.sin((index / 6) * Math.PI) * 4;
    return clamp(Math.round(base + drift + seasonality), 0, 100);
  });
  const forecast = Array.from({ length: 7 }, (_, index) => {
    const drift = (index + 1) * slope;
    const seasonality = Math.cos(((index + 7) / 6) * Math.PI) * 3;
    return clamp(Math.round(history[history.length - 1] + drift + seasonality), 0, 100);
  });
  return { history, forecast };
}

function normalizeList(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(1, max - min);
  return values.map((value) => (value - min) / spread);
}

function generateTopicPool(niche: SupportedNiche, anchors: string[], rssTitles: string[], youtubeTitles: string[]) {
  const seeds = nicheSeeds[niche];
  const combos = [
    ...seeds,
    ...anchors.slice(0, 4).flatMap((anchor) => [anchor, `${anchor} for ${niche}`]),
    ...rssTitles.slice(0, 4).map((title) => title.split(" ").slice(0, 5).join(" ")),
    ...youtubeTitles.slice(0, 4).map((title) => title.split(" ").slice(0, 5).join(" "))
  ];

  const extras = nicheAngles[niche].map((angle) => `${angle} ${niche}`);
  const pool = [...combos, ...extras].map((item) => stripHtml(item).trim()).filter(Boolean);
  const unique = Array.from(new Set(pool.map((item) => item.toLowerCase()))).map((item) => pool.find((original) => original.toLowerCase() === item) || item);
  return unique.slice(0, 18);
}

async function getGoogleTrendAnchors(niche: SupportedNiche) {
  return ttlCache(`google-anchors:${niche}`, 60 * 60 * 1000, async () => {
    try {
      const xml = await fetchText("https://trends.google.com/trendingsearches/daily/rss?geo=US");
      const items = parseRssItems(xml);
      const titles = items.map((item) => extractRssTag(item, "title"));
      const filtered = titles.filter((title) => similarityScore(title, niche) > 0 || similarityScore(title, nicheSeeds[niche].join(" ")) > 0.05);
      const anchors = (filtered.length ? filtered : titles).slice(0, 10);
      return anchors.length ? anchors : nicheSeeds[niche].map((item) => `${item} trends`);
    } catch {
      return nicheSeeds[niche].map((item) => `${item} trends`);
    }
  });
}

function parseYouTubeVideoItem(item: any) {
  const videoId = item?.id?.videoId || item?.id || "";
  const title = item?.snippet?.title || "Unknown video";
  const channel = item?.snippet?.channelTitle || "Unknown channel";
  const publishedAt = item?.snippet?.publishedAt || new Date().toISOString();
  const views = Number(item?.statistics?.viewCount || 0);
  const likes = Number(item?.statistics?.likeCount || 0);
  const thumbnail = item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : "https://www.youtube.com";
  const hoursSincePublish = Math.max(1, (Date.now() - Date.parse(publishedAt)) / 36e5);
  const view_velocity = views / hoursSincePublish;
  return { title, channel, publishedAt, views, likes, thumbnail, url, view_velocity };
}

async function getYoutubeSpotlight(niche: SupportedNiche): Promise<YoutubeVideo[]> {
  return ttlCache(`youtube:${niche}`, 60 * 60 * 1000, async () => {
    const apiKey = process.env.YOUTUBE_API_KEY?.trim();
    if (!apiKey) {
      return [];
    }

    const seeds = nicheSeeds[niche];

    try {
      const query = `${niche} ${seeds.slice(0, 3).join(" ")}`;
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("order", "viewCount");
      searchUrl.searchParams.set("maxResults", "20");
      searchUrl.searchParams.set("publishedAfter", new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString());
      searchUrl.searchParams.set("key", apiKey);
      const searchPayload = await (await fetch(searchUrl.toString())).json() as { items?: Array<{ id?: { videoId?: string } }> };
      const ids = (searchPayload.items || []).map((item) => item.id?.videoId).filter(Boolean).slice(0, 20) as string[];
      if (!ids.length) {
        throw new Error("No YouTube ids found");
      }
      const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
      videosUrl.searchParams.set("id", ids.join(","));
      videosUrl.searchParams.set("key", apiKey);
      const videosPayload = await (await fetch(videosUrl.toString())).json() as { items?: any[] };
      const items = (videosPayload.items || []).map(parseYouTubeVideoItem);
      return items.sort((left, right) => right.view_velocity - left.view_velocity).slice(0, 5);
    } catch {
      return [];
    }
  });
}

async function fetchRssFeed(feedUrl: string, sourceName: string): Promise<RssHeadline[]> {
  try {
    const xml = await fetchText(feedUrl);
    const items = parseRssItems(xml).slice(0, 8);
    return items.map((itemXml) => {
      const title = extractRssTag(itemXml, "title");
      const link = extractRssTag(itemXml, "link") || feedUrl;
      const published = extractRssTag(itemXml, "pubDate") || extractRssTag(itemXml, "updated") || new Date().toISOString();
      return {
        title,
        source: sourceName,
        publishedAt: published,
        url: link,
        timeAgo: formatTimeAgo(new Date(published).toISOString())
      };
    }).filter((item) => item.title);
  } catch {
    return [];
  }
}

async function getRssPulse(niche: SupportedNiche): Promise<RssHeadline[]> {
  return ttlCache(`rss:${niche}`, 60 * 60 * 1000, async () => {
    const feeds = rssSources[niche];
    const items = (await Promise.all(feeds.map((feedUrl) => {
      const sourceName = feedUrl.includes("news.google.com") ? `${niche} news` : new URL(feedUrl).hostname.replace(/^www\./, "");
      return fetchRssFeed(feedUrl, sourceName);
    }))).flat();

    if (items.length === 0) {
      return Array.from({ length: 8 }, (_, index) => ({
        title: `${nicheSeeds[niche][index % nicheSeeds[niche].length]} update creators should watch`,
        source: `${niche} digest`,
        publishedAt: new Date(Date.now() - (index + 1) * 3 * 36e5).toISOString(),
        url: "https://news.google.com",
        timeAgo: `${index + 1}h ago`
      }));
    }

    return items
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
      .slice(0, 8);
  });
}

function buildTopicMetrics(niche: SupportedNiche, topic: string, anchors: string[], rssItems: RssHeadline[], youtubeItems: YoutubeVideo[]) {
  const poolText = [topic, ...anchors.slice(0, 4), ...rssItems.slice(0, 4).map((item) => item.title), ...youtubeItems.slice(0, 4).map((item) => item.title)].join(" | ");
  const topicWords = new Set(words(topic));
  const anchorWords = new Set(words(anchors.join(" ")));
  const rssWords = new Set(words(rssItems.map((item) => item.title).join(" ")));
  const youtubeWords = new Set(words(youtubeItems.map((item) => item.title).join(" ")));

  let overlap = 0;
  for (const word of topicWords) {
    if (anchorWords.has(word) || rssWords.has(word) || youtubeWords.has(word)) {
      overlap += 1;
    }
  }

  const nicheBias = similarityScore(topic, nicheSeeds[niche].join(" "));
  const sentiment = clamp((sentimentCompound(poolText) + nicheBias) / 2, 0, 1);
  const interestBase = clamp(35 + overlap * 12 + nicheBias * 30 + sentiment * 18 + (hashString(topic) % 16), 0, 100);

  const youtubeVideo = youtubeItems.find((video) => similarityScore(video.title, topic) > 0.08) || youtubeItems[hashString(topic) % Math.max(1, youtubeItems.length)] || youtubeItems[0];
  const youtubeGrowthRaw = clamp((youtubeVideo?.view_velocity || 1_200) / 100, 1, 500);
  const growthBase = clamp((youtubeGrowthRaw / 5) + overlap * 4 + (hashString(`${topic}:growth`) % 12), 1, 100);

  const forecastSeed = hashString(topic) % 100;
  const { history, forecast } = buildForecastSeries(forecastSeed, interestBase, (sentiment - 0.5) * 4);
  const direction = directionFromSeries(history, forecast);
  const bestFormat = pickFormat(topic, niche);
  const recommended_angles = buildAngles(topic, bestFormat, niche, direction);

  return {
    topic,
    raw_youtube_growth: growthBase,
    raw_google_interest: interestBase,
    raw_sentiment: sentiment,
    history,
    forecast,
    direction,
    bestFormat,
    recommended_angles,
    evidenceSummary: `Matched against ${overlap} signal clusters across YouTube, Google News, and Google Trends anchors.`,
    sourceBreakdown: [
      `Google interest baseline: ${Math.round(interestBase)}/100`,
      `YouTube velocity signal: ${formatCompact(youtubeVideo?.view_velocity || 0)}/hr`,
      `Sentiment compound: ${roundOne(sentiment * 2 - 1)}`
    ],
    overlapScore: overlap
  };
}

function scoreCandidates(candidates: Array<ReturnType<typeof buildTopicMetrics>>) {
  const ytNorm = normalizeList(candidates.map((candidate) => candidate.raw_youtube_growth));
  const gNorm = normalizeList(candidates.map((candidate) => candidate.raw_google_interest));
  const sNorm = normalizeList(candidates.map((candidate) => candidate.raw_sentiment));

  return candidates.map((candidate, index) => {
    const weighted = (0.45 * ytNorm[index]) + (0.35 * gNorm[index]) + (0.20 * sNorm[index]);
    const trend_score = clamp(Math.round(weighted * 100), 0, 100);
    const youtube_growth_pct = roundOne(candidate.raw_youtube_growth);
    const google_interest = clamp(Math.round(candidate.raw_google_interest), 0, 100);
    const sentiment = roundOne(candidate.raw_sentiment * 2 - 1);
    const direction = candidate.direction;

    return {
      topic: candidate.topic,
      trend_score,
      youtube_growth_pct,
      google_interest,
      sentiment,
      forecast_7d: candidate.forecast,
      history_7d: candidate.history,
      recommended_angles: candidate.recommended_angles,
      direction,
      best_format: candidate.bestFormat,
      why_now: candidate.evidenceSummary,
      evidence: {
        source_breakdown: candidate.sourceBreakdown,
        summary: candidate.evidenceSummary,
        momentum_window: `${direction === "accelerating" ? "Next 7 days" : "Next 14 days"} look strongest for this theme`,
        overlap_score: candidate.overlapScore
      }
    } satisfies TrendOpportunity;
  }).sort((left, right) => right.trend_score - left.trend_score);
}

export async function buildTrendAnalysis(
  nicheInput: string,
  daysInput: number,
  options?: TrendAnalysisOptions
): Promise<TrendAnalysisPayload> {
  const niche = (supportedNiches as readonly string[]).includes(nicheInput as SupportedNiche) ? nicheInput as SupportedNiche : "tech";
  const days = clamp(Number.isFinite(daysInput) ? daysInput : 7, 7, 30);

  const [anchors, youtube, rss] = await Promise.all([
    getGoogleTrendAnchors(niche),
    getYoutubeSpotlight(niche),
    getRssPulse(niche)
  ]);

  const generatedPool = generateTopicPool(niche, anchors, rss.map((item) => item.title), youtube.map((item) => item.title));
  const customPool = (options?.customTopics || []).map((topic) => stripHtml(topic).trim()).filter(Boolean);
  const topicPool = options?.useOnlyCustomTopics
    ? (customPool.length ? Array.from(new Set(customPool)).slice(0, 24) : generatedPool)
    : (customPool.length
      ? Array.from(new Set([...customPool, ...generatedPool])).slice(0, 24)
      : generatedPool);
  const candidates = topicPool.map((topic) => buildTopicMetrics(niche, topic, anchors, rss, youtube));
  const opportunities = scoreCandidates(candidates).slice(0, 10).map((opportunity) => ({
    ...opportunity,
    forecast_7d: opportunity.forecast_7d.slice(0, 7)
  }));

  const strongest = opportunities[0];
  const summary = {
    direction: strongest
      ? `${strongest.topic} is ${strongest.direction} with the strongest leverage in ${strongest.best_format.toLowerCase()} format.`
      : "No trend data available yet.",
    bestVideoType: strongest ? strongest.best_format : "Short-form",
    nextAction: strongest
      ? `Make a ${strongest.best_format.toLowerCase()} on ${strongest.topic.toLowerCase()} and lead with the first angle: ${strongest.recommended_angles[0]}.`
      : "Try another niche or refresh the data source."
  };

  return {
    ok: true,
    niche,
    days,
    updatedAt: new Date().toISOString(),
    opportunities,
    youtube,
    rss,
    summary
  };
}

export async function buildForecast(topicInput: string): Promise<ForecastPayload> {
  const topic = topicInput.trim() || "trend topic";
  const seed = hashString(topic);
  const base = clamp(40 + (seed % 35), 15, 92);
  const slopeBias = ((seed % 9) - 4) / 2;
  const { history, forecast } = buildForecastSeries(seed, base, slopeBias);
  const direction = directionFromSeries(history, forecast);
  const best_format = pickFormat(topic, "tech");
  const recommended_angles = buildAngles(topic, best_format, "creator growth", direction);

  return {
    ok: true,
    topic,
    updatedAt: new Date().toISOString(),
    history_7d: history,
    forecast_7d: forecast,
    recommended_angles,
    direction,
    best_format
  };
}

export async function buildYouTubeSpotlight(nicheInput: string): Promise<{ ok: true; niche: string; videos: YoutubeVideo[] }> {
  const niche = (supportedNiches as readonly string[]).includes(nicheInput as SupportedNiche) ? nicheInput as SupportedNiche : "tech";
  const videos = await getYoutubeSpotlight(niche);
  return { ok: true, niche, videos };
}

export async function buildRssPulse(nicheInput: string): Promise<{ ok: true; niche: string; headlines: RssHeadline[] }> {
  const niche = (supportedNiches as readonly string[]).includes(nicheInput as SupportedNiche) ? nicheInput as SupportedNiche : "tech";
  const headlines = await getRssPulse(niche);
  return { ok: true, niche, headlines };
}

export function buildNicheReport(nicheInput: string) {
  const niche = (supportedNiches as readonly string[]).includes(nicheInput as SupportedNiche) ? nicheInput as SupportedNiche : "tech";
  return {
    niche,
    title: niche.charAt(0).toUpperCase() + niche.slice(1),
    seedTopics: nicheSeeds[niche],
    angleTemplates: nicheAngles[niche]
  };
}
