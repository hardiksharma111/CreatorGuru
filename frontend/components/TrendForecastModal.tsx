import { useEffect, useRef, useState } from "react";
import type { TrendOpportunity } from "../lib/trendInsights";

declare global {
  interface Window {
    Chart?: any;
  }
}

type Props = {
  open: boolean;
  trend: TrendOpportunity | null;
  onClose: () => void;
};

function buildChartLabels(history: number[], forecast: number[]) {
  const labels = history.map((_, index) => `D-${history.length - index}`);
  const forecastLabels = forecast.map((_, index) => `D+${index + 1}`);
  return [...labels, ...forecastLabels];
}

export function TrendForecastModal({ open, trend, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setChartReady(false);
      return;
    }

    if (typeof window !== "undefined" && window.Chart) {
      setChartReady(true);
      return;
    }

    const interval = window.setInterval(() => {
      if (window.Chart) {
        setChartReady(true);
        window.clearInterval(interval);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (!open || !trend || !canvasRef.current || !chartReady || !window.Chart) {
      return;
    }

    const labels = buildChartLabels(trend.history_7d, trend.forecast_7d);
    const actualData = [...trend.history_7d, ...Array(trend.forecast_7d.length).fill(null)];
    const forecastData = [
      ...Array(Math.max(0, trend.history_7d.length - 1)).fill(null),
      trend.history_7d[trend.history_7d.length - 1],
      ...trend.forecast_7d
    ];

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new window.Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Actual interest",
            data: actualData,
            borderColor: "#7c6df0",
            backgroundColor: "rgba(124, 109, 240, 0.18)",
            tension: 0.34,
            pointRadius: 3,
            borderWidth: 2,
            fill: true
          },
          {
            label: "Forecast",
            data: forecastData,
            borderColor: "#34d1c5",
            backgroundColor: "rgba(52, 209, 197, 0.08)",
            borderDash: [8, 6],
            tension: 0.34,
            pointRadius: 3,
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: {
              color: "#dce2f2"
            }
          },
          tooltip: {
            backgroundColor: "rgba(10, 12, 19, 0.94)",
            titleColor: "#ffffff",
            bodyColor: "#dce2f2",
            borderColor: "rgba(124, 109, 240, 0.35)",
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: { color: "#97a3c1" },
            grid: { color: "rgba(255,255,255,0.05)" }
          },
          y: {
            min: 0,
            max: 100,
            ticks: { color: "#97a3c1" },
            grid: { color: "rgba(255,255,255,0.05)" }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [open, trend, chartReady]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !trend) {
    return null;
  }

  return (
    <div className="trend-modal" role="dialog" aria-modal="true" aria-labelledby="trend-modal-title" onMouseDown={onClose}>
      <article className="trend-modal-panel" onMouseDown={(event) => event.stopPropagation()}>
        <div className="trend-modal-header">
          <div>
            <p className="trend-modal-eyebrow">Forecast view</p>
            <h3 id="trend-modal-title">{trend.topic}</h3>
            <p className="muted">{trend.why_now}</p>
          </div>
          <button type="button" className="icon-pill" onClick={onClose} aria-label="Close forecast modal">
            ×
          </button>
        </div>

        <div className="trend-modal-meta">
          <span className="tag">{trend.direction}</span>
          <span className="tag">{trend.best_format}</span>
          <span className="tag">Score {trend.trend_score}/100</span>
        </div>

        <div className="trend-chart-shell">{chartReady ? <canvas ref={canvasRef} height={280} /> : <div className="skeleton chart-skeleton" />}</div>

        <div className="trend-angle-row">
          {trend.recommended_angles.map((angle) => (
            <button key={angle} type="button" className="chip" onClick={() => navigator.clipboard?.writeText(angle)}>
              {angle}
            </button>
          ))}
        </div>

        <div className="trend-evidence-box">
          <p className="kpi">Evidence</p>
          <p className="muted">{trend.evidence.summary}</p>
          <ul>
            {trend.evidence.source_breakdown.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}
