import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { TrendCard } from "../components/TrendCard";
import { TrendForecastModal } from "../components/TrendForecastModal";
import {
  supportedNiches,
  TrendAnalysisPayload,
  TrendOpportunity,
  SupportedNiche
} from "../lib/trendInsights";

type DaysWindow = 7 | 14 | 30;

const dayOptions: DaysWindow[] = [7, 14, 30];

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "Updating now";
  }

  const date = new Date(value);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatViews(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

function TrendSkeleton() {
  return (
    <div className="trend-card stack skeleton-card">
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line medium" />
      <div className="skeleton skeleton-line wide" />
    </div>
  );
}

export default function TrendsPage() {
  const [niche, setNiche] = useState<SupportedNiche>("tech");
  const [days, setDays] = useState<DaysWindow>(7);
  const [reloadToken, setReloadToken] = useState(0);
  const [report, setReport] = useState<TrendAnalysisPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrend, setSelectedTrend] = useState<TrendOpportunity | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/trends?niche=${encodeURIComponent(niche)}&days=${days}`);
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error || "Failed to load trend report.");
        }
        const payload = (await response.json()) as TrendAnalysisPayload;
        if (!cancelled) {
          setReport(payload);
          setSelectedTrend((current) => current || payload.opportunities[0] || null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load trend report.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [niche, days, reloadToken]);

  const opportunities = report?.opportunities ?? [];
  const youtubeVideos = report?.youtube ?? [];
  const rssHeadlines = report?.rss ?? [];
  const summary = report?.summary;

  const lastUpdated = useMemo(() => formatTimestamp(report?.updatedAt), [report?.updatedAt]);

  return (
    <AppShell
      title="Trend Radar"
      subtitle="Find trend opportunities mapped to your niche and content gaps"
      currentPath="/trends"
    >
      <Script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" strategy="afterInteractive" />
      <TrendForecastModal open={Boolean(selectedTrend)} trend={selectedTrend} onClose={() => setSelectedTrend(null)} />

      <div className="trend-page stack">
        <section className="trend-hero card stack">
          <div className="trend-hero-grid">
            <div className="stack">
              <p className="eyebrow">Trend analysis</p>
              <div className="title-row">
                <h1>Where the niche is going next</h1>
                <span className="tag">{lastUpdated}</span>
              </div>
              <p className="muted trend-hero-copy">
                The report combines live YouTube velocity, Google Trends anchors, and recent news signals to tell you which ideas are rising, which format to use, and what angle to publish next.
              </p>
              <div className="trend-hero-actions">
                {supportedNiches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`pill ${item === niche ? "active" : ""}`}
                    onClick={() => setNiche(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="trend-hero-panel card stack">
              <div className="split-row">
                <div>
                  <p className="kpi">Forecast window</p>
                  <strong>{days} days</strong>
                </div>
                <div>
                  <p className="kpi">Top signal</p>
                  <strong>{summary?.bestVideoType || "Short-form"}</strong>
                </div>
              </div>
              <div className="segment-row">
                {dayOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`segment ${option === days ? "active" : ""}`}
                    onClick={() => setDays(option)}
                  >
                    {option}d
                  </button>
                ))}
              </div>
              <p className="muted">{summary?.direction || "Loading strategist view..."}</p>
              <p className="hero-action">{summary?.nextAction || "Refresh for an updated recommendation."}</p>
            </div>
          </div>
        </section>

        {error ? (
          <section className="alert-card card stack">
            <p className="kpi">Trend fetch issue</p>
            <p>{error}</p>
            <button type="button" className="btn primary" onClick={() => setReloadToken((current) => current + 1)}>
              Retry
            </button>
          </section>
        ) : null}

        <section className="stack">
          <div className="section-head">
            <div>
              <p className="eyebrow">Trend leaderboard</p>
              <h2>Best opportunities right now</h2>
            </div>
            <span className="tag">Top {opportunities.length || 0}</span>
          </div>

          <div className="trend-grid">
            {loading
              ? Array.from({ length: 8 }, (_, index) => <TrendSkeleton key={index} />)
              : opportunities.map((trend) => (
                  <TrendCard key={trend.topic} trend={trend} onClick={() => setSelectedTrend(trend)} />
                ))}
          </div>
        </section>

        <section className="mini-grid">
          <div className="card stack spotlight-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">YouTube spotlight</p>
                <h2>Fastest moving videos</h2>
              </div>
              <span className="tag">Top 5</span>
            </div>
            <div className="youtube-list">
              {loading
                ? Array.from({ length: 5 }, (_, index) => <TrendSkeleton key={index} />)
                : youtubeVideos.map((video) => (
                    <a key={video.url} className="youtube-item" href={video.url} target="_blank" rel="noreferrer">
                      <img src={video.thumbnail} alt={video.title} />
                      <div>
                        <strong>{video.title}</strong>
                        <p className="muted">{video.channel}</p>
                        <span>{formatViews(video.views)} views · {video.view_velocity.toFixed(0)} views/hr</span>
                      </div>
                    </a>
                  ))}
            </div>
          </div>

          <div className="card stack spotlight-card">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">RSS pulse</p>
                <h2>Recent signal headlines</h2>
              </div>
              <span className="tag">Top 8</span>
            </div>
            <div className="rss-list">
              {loading
                ? Array.from({ length: 8 }, (_, index) => <TrendSkeleton key={index} />)
                : rssHeadlines.map((item) => (
                    <a key={`${item.source}-${item.title}`} className="rss-item" href={item.url} target="_blank" rel="noreferrer">
                      <div>
                        <strong>{item.title}</strong>
                        <p className="muted">{item.source}</p>
                      </div>
                      <span>{item.timeAgo}</span>
                    </a>
                  ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
