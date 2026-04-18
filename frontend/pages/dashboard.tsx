import { KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";

type HealthScore = {
  label: string;
  value: number;
  helper?: string;
  delta?: string;
};

type ProfilePayload = {
  pulse: string;
  thisWeekPlannedPosts: number;
  summary: string;
  priorityMove: string;
  priorityProgress: number;
  healthScores: HealthScore[];
};

type PeriodKey = "7d" | "30d" | "90d";

type CoachMessage = {
  role: "bot" | "usr";
  html: string;
};

const chartData: Record<PeriodKey, { labels: string[]; v1: number[]; v2: number[] }> = {
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    v1: [120, 180, 150, 220, 280, 340, 310],
    v2: [4.2, 5.1, 4.8, 6.3, 7.1, 8.2, 7.5]
  },
  "30d": {
    labels: ["W1", "W2", "W3", "W4"],
    v1: [580, 720, 890, 1140],
    v2: [4.5, 5.2, 6.1, 7.3]
  },
  "90d": {
    labels: ["Jan", "Feb", "Mar"],
    v1: [2100, 3400, 5200],
    v2: [3.8, 5.1, 7.0]
  }
};

const coachReplies = [
  "Based on your analytics, <b>short-form vertical video</b> is driving 3.5x more reach than carousels. Double down!",
  "Your audience peaks between <b>6-9 PM IST</b>. Schedule 2-3 posts in that window this week.",
  "Shorter captions (under 100 chars) get <b>28% more engagement</b> on your profile. Worth testing!",
  "Your follower growth is <b>above average</b> for your niche. You are on track for 10K in about 6 weeks.",
  "Carousel posts with a <b>bold first slide</b> outperform by 2.1x. Use a question or hot take to open."
];

function scoreByLabel(scores: HealthScore[], label: string, fallback = 70) {
  return scores.find((score) => score.label.toLowerCase() === label.toLowerCase())?.value ?? fallback;
}

function deltaByLabel(scores: HealthScore[], label: string, fallback = "+6%") {
  return scores.find((score) => score.label.toLowerCase() === label.toLowerCase())?.delta ?? fallback;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [coInput, setCoInput] = useState("");
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: "bot",
      html: "<b>Hey Aiman</b>. Your engagement rate jumped this week. Reels with <b>text overlays</b> are getting 2.4x more saves."
    },
    {
      role: "usr",
      html: "Yes, and what time should I post for maximum reach?"
    },
    {
      role: "bot",
      html: "Best windows are <b>Tue/Thu at 7:30 PM</b> and <b>Sat at 11 AM</b>. Want me to draft the calendar?"
    }
  ]);
  const [replyIndex, setReplyIndex] = useState(0);
  const [barsReady, setBarsReady] = useState(false);

  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const coMsgsRef = useRef<HTMLDivElement | null>(null);

  const scores = profile?.healthScores ?? [];
  const growthScore = scoreByLabel(scores, "growth velocity", 84);
  const engagementScore = scoreByLabel(scores, "engagement", 91);
  const reachScore = scoreByLabel(scores, "reach", 67);

  const growthDelta = deltaByLabel(scores, "growth velocity", "+12%");
  const engagementDelta = deltaByLabel(scores, "engagement", "+8%");
  const reachDelta = deltaByLabel(scores, "reach", "-3%");

  const heroStats = useMemo(
    () => ({
      engagement: Number((engagementScore / 7.3).toFixed(1)),
      followers: 847,
      posts: profile?.thisWeekPlannedPosts ?? 23
    }),
    [engagementScore, profile?.thisWeekPlannedPosts]
  );

  useEffect(() => {
    let mounted = true;

    async function loadSliceData() {
      try {
        setLoading(true);
        setError(null);

        const profileRes = await fetch("/api/analyze/profile");

        if (!profileRes.ok) {
          throw new Error("Unable to load live dashboard data right now.");
        }

        const profileJson = await profileRes.json();

        if (!mounted) {
          return;
        }

        setProfile(profileJson.profile as ProfilePayload);
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : "Unexpected error while loading dashboard data.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSliceData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setBarsReady(true), 300);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [growthScore, engagementScore, reachScore]);

  useEffect(() => {
    if (!coMsgsRef.current) {
      return;
    }
    coMsgsRef.current.scrollTop = coMsgsRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!heroCanvasRef.current || !mainCanvasRef.current) {
      return;
    }

    function isNightMode() {
      return document.documentElement.dataset.theme === "night";
    }

    function drawHeroChart() {
      const c = heroCanvasRef.current;
      if (!c) {
        return;
      }
      const ctx = c.getContext("2d");
      if (!ctx || !c.parentElement) {
        return;
      }

      const parentRect = c.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(parentRect.width, 260);
      const height = 150;

      c.width = width * dpr;
      c.height = height * dpr;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const data = [34, 28, 36, 30, 22, 18, 26, 14, 10, 7];
      const pad = 10;
      const chartWidth = width - pad * 2;
      const chartHeight = height - pad * 2;
      const max = Math.max(...data) * 1.12;

      const points = data.map((value, index) => ({
        x: pad + (chartWidth / (data.length - 1)) * index,
        y: pad + chartHeight - (value / max) * chartHeight
      }));

      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, pad, 0, height);
      grad.addColorStop(0, isNightMode() ? "rgba(59,130,246,0.28)" : "rgba(59,130,246,0.14)");
      grad.addColorStop(1, "rgba(59,130,246,0)");

      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      ctx.lineTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        const cp = (points[i - 1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cp, points[i - 1].y, cp, points[i].y, points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        const cp = (points[i - 1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cp, points[i - 1].y, cp, points[i].y, points[i].x, points[i].y);
      }
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();

      points.forEach((point, index) => {
        const isLast = index === points.length - 1;
        ctx.beginPath();
        ctx.arc(point.x, point.y, isLast ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = "#3B82F6";
        ctx.fill();

        if (isLast) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 9, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(59,130,246,0.15)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = isNightMode() ? "#0c0e14" : "#f0f2f8";
          ctx.fill();
        }
      });
    }

    function drawMainChart() {
      const c = mainCanvasRef.current;
      if (!c) {
        return;
      }
      const ctx = c.getContext("2d");
      if (!ctx || !c.parentElement) {
        return;
      }

      const parentRect = c.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(parentRect.width, 300);
      const height = Math.max(parentRect.height, 210);

      c.width = width * dpr;
      c.height = height * dpr;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const series = chartData[period];
      const txtColor = isNightMode() ? "#5c6478" : "#94a3b8";
      const gridColor = isNightMode() ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.04)";

      const pl = 50;
      const pr = 16;
      const pt = 22;
      const pb = 34;
      const chartWidth = width - pl - pr;
      const chartHeight = height - pt - pb;
      const maxV = Math.max(...series.v1) * 1.15;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i <= 4; i += 1) {
        const y = pt + (chartHeight / 4) * i;
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pl, y);
        ctx.lineTo(width - pr, y);
        ctx.stroke();

        ctx.fillStyle = txtColor;
        ctx.font = "11px Sora, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(String(Math.round(maxV - (maxV / 4) * i)), pl - 8, y + 4);
      }

      series.labels.forEach((label, index) => {
        const x = pl + (chartWidth / (series.labels.length - 1)) * index;
        ctx.fillStyle = txtColor;
        ctx.font = "11px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x, height - 8);
      });

      const points = series.v1.map((value, index) => ({
        x: pl + (chartWidth / (series.v1.length - 1)) * index,
        y: pt + chartHeight - (value / maxV) * chartHeight
      }));

      const areaGrad = ctx.createLinearGradient(0, pt, 0, pt + chartHeight);
      areaGrad.addColorStop(0, isNightMode() ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.1)");
      areaGrad.addColorStop(1, "rgba(59,130,246,0)");

      ctx.beginPath();
      ctx.moveTo(points[0].x, pt + chartHeight);
      ctx.lineTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        const cp = (points[i - 1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cp, points[i - 1].y, cp, points[i].y, points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, pt + chartHeight);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        const cp = (points[i - 1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cp, points[i - 1].y, cp, points[i].y, points[i].x, points[i].y);
      }
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();

      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#3B82F6";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = isNightMode() ? "#181c28" : "#ffffff";
        ctx.fill();
      });

      const maxE = Math.max(...series.v2) * 1.3;
      const ePoints = series.v2.map((value, index) => ({
        x: pl + (chartWidth / (series.v2.length - 1)) * index,
        y: pt + chartHeight - (value / maxE) * chartHeight
      }));

      ctx.beginPath();
      ctx.moveTo(ePoints[0].x, ePoints[0].y);
      for (let i = 1; i < ePoints.length; i += 1) {
        const cp = (ePoints[i - 1].x + ePoints[i].x) / 2;
        ctx.bezierCurveTo(cp, ePoints[i - 1].y, cp, ePoints[i].y, ePoints[i].x, ePoints[i].y);
      }
      ctx.strokeStyle = "#14B8A6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ePoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#14B8A6";
        ctx.fill();
      });

      const legendY = pt - 5;
      ctx.font = "11px Sora, sans-serif";
      ctx.textAlign = "left";
      ([
        [width - pr - 180, "#3B82F6", "Followers"],
        [width - pr - 85, "#14B8A6", "Engagement"]
      ] as const).forEach(([x, color, text]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, legendY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = txtColor;
        ctx.fillText(text, x + 8, legendY + 4);
      });
    }

    const redraw = () => {
      drawHeroChart();
      drawMainChart();
    };

    redraw();

    const onResize = () => redraw();
    const onTheme = () => redraw();

    window.addEventListener("resize", onResize);
    window.addEventListener("creatorguru-theme-change", onTheme);
    window.addEventListener("storage", onTheme);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("creatorguru-theme-change", onTheme);
      window.removeEventListener("storage", onTheme);
    };
  }, [period]);

  function countUp(el: HTMLElement, target: number, suffix: string) {
    const duration = 1300;
    const hasDecimal = String(target).includes(".");
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = hasDecimal ? `${value.toFixed(1)}${suffix}` : `${Math.floor(value).toLocaleString()}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = hasDecimal ? `${target.toFixed(1)}${suffix}` : `${target.toLocaleString()}${suffix}`;
      }
    };

    requestAnimationFrame(tick);
  }

  useEffect(() => {
    const metricEls = document.querySelectorAll<HTMLElement>(".m-val[data-t]");
    metricEls.forEach((el) => {
      const target = Number(el.dataset.t || 0);
      countUp(el, target, "");
    });

    const heroEls = document.querySelectorAll<HTMLElement>(".h-stat .v[data-c]");
    heroEls.forEach((el) => {
      const raw = el.dataset.c || "0";
      const target = Number(raw);
      countUp(el, target, raw.includes(".") ? "%" : "");
    });
  }, [growthScore, engagementScore, reachScore, heroStats.engagement, heroStats.followers, heroStats.posts]);

  useEffect(() => {
    const tiltEls = document.querySelectorAll<HTMLElement>(".hero, .m-card.primary");
    const cleanups: Array<() => void> = [];

    tiltEls.forEach((el) => {
      const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-3px)`;
      };

      const onLeave = () => {
        el.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
        window.setTimeout(() => {
          el.style.transition = "";
        }, 500);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.getElementById("co-inp") as HTMLInputElement | null;
        input?.focus();
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        const current = document.documentElement.dataset.theme === "night" ? "night" : "morning";
        const next = current === "night" ? "morning" : "night";
        document.documentElement.dataset.theme = next;
        window.localStorage.setItem("creatorguru-theme", next);
        window.dispatchEvent(new CustomEvent("creatorguru-theme-change"));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function sendCoachMessage() {
    const value = coInput.trim();
    if (!value) {
      return;
    }

    setMessages((prev) => [...prev, { role: "usr", html: value }]);
    setCoInput("");

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", html: coachReplies[replyIndex % coachReplies.length] }]);
      setReplyIndex((prev) => prev + 1);
    }, 650);
  }

  function onCoachInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      sendCoachMessage();
    }
  }

  return (
    <AppShell title="Dashboard" subtitle="Your creator command center" currentPath="/dashboard">
      {error ? (
        <article className="g-card" style={{ padding: "14px 16px", marginBottom: 14 }}>
          <p style={{ color: "var(--red)" }}>{error}</p>
        </article>
      ) : null}

      <div className="dash">
        <section className="g-card hero" id="hero">
          <div className="hero-glow hg1" aria-hidden="true" />
          <div className="hero-glow hg2" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-badges">
                <span className="badge bl">Creator Pulse - Active</span>
                <span className="badge gr">+24% this week</span>
              </div>
              <h2>
                Your content is <span className="c-bl">growing</span>.<br />
                Let&apos;s push it <span className="c-tl">further</span>.
              </h2>
              <p className="body">
                {loading
                  ? "Loading live performance insight..."
                  : profile?.summary || "Your cadence and hooks are improving. Keep consistent publishing windows this week."}
              </p>
              <div className="hero-stats">
                <div className="h-stat"><span className="v" data-c={heroStats.engagement}>0</span><span className="l">Avg. Engagement %</span></div>
                <div className="h-stat"><span className="v" data-c={heroStats.followers}>0</span><span className="l">New Followers (7d)</span></div>
                <div className="h-stat"><span className="v" data-c={heroStats.posts}>0</span><span className="l">Posts This Month</span></div>
              </div>
            </div>

            <div className="hero-chart">
              <div className="glow-ring" aria-hidden="true" />
              <canvas ref={heroCanvasRef} id="hero-canvas" />
              <span className="chart-lbl">Engagement - 7 Day Trend</span>
            </div>
          </div>
        </section>

        <section className="metrics">
          <article className="g-card m-card primary">
            <div className="inner-glow" aria-hidden="true" />
            <div className="m-top">
              <div className="m-ico bl">↗</div>
              <span className={`m-trend ${String(growthDelta).startsWith("-") ? "dn" : "up"}`}>{growthDelta}</span>
            </div>
            <div className="m-body">
              <div className="m-lbl">Growth Score</div>
              <div className="m-val-row">
                <span className="m-val" data-t={growthScore}>0</span>
                <span className="m-max">/100</span>
              </div>
              <div className="m-bar"><div className="m-fill bl" data-w={growthScore} style={{ width: barsReady ? `${growthScore}%` : "0%" }} /></div>
              <div className="m-sub">vs last month: <b>{growthDelta}</b></div>
            </div>
          </article>

          <article className="g-card m-card">
            <div className="m-top">
              <div className="m-ico tl">♡</div>
              <span className={`m-trend ${String(engagementDelta).startsWith("-") ? "dn" : "up"}`}>{engagementDelta}</span>
            </div>
            <div className="m-body">
              <div className="m-lbl">Engagement</div>
              <div className="m-val-row">
                <span className="m-val" data-t={engagementScore}>0</span>
                <span className="m-max">/100</span>
              </div>
              <div className="m-bar"><div className="m-fill tl" data-w={engagementScore} style={{ width: barsReady ? `${engagementScore}%` : "0%" }} /></div>
            </div>
          </article>

          <article className="g-card m-card">
            <div className="m-top">
              <div className="m-ico am">◉</div>
              <span className={`m-trend ${String(reachDelta).startsWith("-") ? "dn" : "up"}`}>{reachDelta}</span>
            </div>
            <div className="m-body">
              <div className="m-lbl">Reach</div>
              <div className="m-val-row">
                <span className="m-val" data-t={reachScore}>0</span>
                <span className="m-max">/100</span>
              </div>
              <div className="m-bar"><div className="m-fill am" data-w={reachScore} style={{ width: barsReady ? `${reachScore}%` : "0%" }} /></div>
            </div>
          </article>
        </section>

        <section className="actions">
          <article className="g-card a-card">
            <div className="a-ico bl">⌕</div>
            <div className="a-txt"><span className="a-title">Analyze Profile</span><span className="a-desc">Deep-dive into your metrics</span></div>
            <span className="a-arr">→</span>
          </article>
          <article className="g-card a-card">
            <div className="a-ico tl">◌</div>
            <div className="a-txt"><span className="a-title">Open Coach Chat</span><span className="a-desc">Get personalized strategy tips</span></div>
            <span className="a-arr">→</span>
          </article>
          <article className="g-card a-card">
            <div className="a-ico am">▤</div>
            <div className="a-txt"><span className="a-title">Generate Calendar</span><span className="a-desc">AI-powered content schedule</span></div>
            <span className="a-arr">→</span>
          </article>
        </section>

        <section className="g-card chart-sec">
          <div className="sec-top">
            <h3 className="sec-t">Growth Overview</h3>
            <div className="tabs">
              <button className={`tab ${period === "7d" ? "on" : ""}`} type="button" onClick={() => setPeriod("7d")}>7D</button>
              <button className={`tab ${period === "30d" ? "on" : ""}`} type="button" onClick={() => setPeriod("30d")}>30D</button>
              <button className={`tab ${period === "90d" ? "on" : ""}`} type="button" onClick={() => setPeriod("90d")}>90D</button>
            </div>
          </div>
          <div className="chart-wrap"><canvas ref={mainCanvasRef} id="main-chart" /></div>
        </section>

        <div className="btm">
          <section className="g-card an-panel">
            <div className="sec-top">
              <h3 className="sec-t">Recent Analysis</h3>
              <span className="sec-lnk">See all -&gt;</span>
            </div>
            <div className="an-list">
              <div className="an-item"><div className="an-ico ig">IG</div><div className="an-txt"><div className="an-t">Instagram Reel - Hook Performance</div><div className="an-m">2 hours ago</div></div><span className="an-s hi">92</span></div>
              <div className="an-item"><div className="an-ico yt">YT</div><div className="an-txt"><div className="an-t">YouTube Thumbnail - CTR Audit</div><div className="an-m">Yesterday</div></div><span className="an-s md">74</span></div>
              <div className="an-item"><div className="an-ico tk">TK</div><div className="an-txt"><div className="an-t">TikTok Profile - Growth Analysis</div><div className="an-m">3 days ago</div></div><span className="an-s hi">88</span></div>
              <div className="an-item"><div className="an-ico ig">IG</div><div className="an-txt"><div className="an-t">Instagram Carousel - Content Scoring</div><div className="an-m">5 days ago</div></div><span className="an-s lo">58</span></div>
            </div>
          </section>

          <section className="g-card co-panel">
            <div className="sec-top">
              <h3 className="sec-t">AI Coach</h3>
              <span className="sec-lnk">Full chat -&gt;</span>
            </div>
            <div className="co-msgs" id="co-msgs" ref={coMsgsRef}>
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`co-msg ${message.role}`} dangerouslySetInnerHTML={{ __html: message.html }} />
              ))}
            </div>
            <div className="co-inp-row">
              <input
                className="co-inp"
                id="co-inp"
                type="text"
                placeholder="Ask your AI coach anything..."
                value={coInput}
                onChange={(event) => setCoInput(event.target.value)}
                onKeyDown={onCoachInputKeyDown}
              />
              <button className="co-send" id="co-send" type="button" onClick={sendCoachMessage}>↗</button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
