import type { TrendOpportunity } from "../lib/trendInsights";

type Props = {
  trend: TrendOpportunity;
  onClick?: () => void;
};

function getScoreTone(score: number) {
  if (score > 75) {
    return "hot";
  }

  if (score >= 50) {
    return "warm";
  }

  return "cool";
}

export function TrendCard({ trend, onClick }: Props) {
  const tone = getScoreTone(trend.trend_score);
  const gaugeStyle = {
    background: `conic-gradient(var(--accent) ${trend.trend_score}%, rgba(255,255,255,0.08) 0)`
  } as const;

  return (
    <button type="button" className="trend-card card stack trend-card-button" onClick={onClick}>
      <div className="trend-card-top">
        <div>
          <p className="trend-kicker">{trend.direction}</p>
          <h4>{trend.topic}</h4>
        </div>
        <div className={`trend-score-ring ${tone}`} style={gaugeStyle}>
          <span>{trend.trend_score}</span>
        </div>
      </div>

      <div className="trend-badges">
        <span className={`trend-badge ${tone}`}>{tone === "hot" ? "Hot" : tone === "warm" ? "Rising" : "Steady"}</span>
        <span className="trend-badge muted">{trend.best_format}</span>
      </div>

      <p className="muted trend-copy">{trend.why_now}</p>

      <div className="trend-metric">
        <span>YT growth</span>
        <strong>{trend.youtube_growth_pct > 0 ? "+" : ""}{trend.youtube_growth_pct.toFixed(1)}%</strong>
      </div>
      <div className="progress trend-progress"><span style={{ width: `${trend.google_interest}%` }} /></div>
      <div className="trend-metric trend-metric-sm">
        <span>Google interest</span>
        <strong>{trend.google_interest}/100</strong>
      </div>

      <div className="trend-tags">
        {trend.recommended_angles.slice(0, 1).map((angle) => (
          <span key={angle} className="tag trend-tag">{angle}</span>
        ))}
      </div>
    </button>
  );
}