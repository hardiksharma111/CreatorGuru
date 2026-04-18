import Link from "next/link";

const featureItems = [
  {
    title: "Profile Analyzer",
    copy: "Get a health score for Reach, Engagement, Consistency, and Growth Velocity with specific recommendations."
  },
  {
    title: "Trend Radar",
    copy: "Discover ranked trend opportunities in your niche with suggested content angles and estimated uplift."
  },
  {
    title: "AI Coach Chat",
    copy: "Ask natural questions and get context-aware strategic advice tied to your creator data."
  },
  {
    title: "Content Calendar",
    copy: "Generate a personalized 30-day posting plan with platform, format, topic, and key talking points."
  },
  {
    title: "Thumbnail & Caption Scorer",
    copy: "Score creative assets and get actionable improvements for hook, clarity, and conversion."
  },
  {
    title: "Competitor Benchmarking",
    copy: "Compare performance and identify the highest-leverage move to close your biggest content gap."
  }
];

export default function Page() {
  return (
    <main>
      <section className="hero">
        <div className="page-wrap hero-grid">
          <article className="hero-panel">
            <span className="eyebrow">Creator Growth System</span>
            <h1 className="hero-title">Your personal AI content strategist for YouTube and Instagram.</h1>
            <p className="hero-copy">
              CreatorGuru turns platform metrics into clear weekly moves. Analyze your profile, identify trend opportunities,
              audit content, and get an always-on AI coach built for solo creators.
            </p>
            <div className="actions">
              <Link href="/auth" className="btn btn-primary">Get Started</Link>
              <Link href="/dashboard" className="btn btn-secondary">See Demo</Link>
            </div>
            <div className="stats-row">
              <div className="stat-pill"><p>Average Lift</p><p>+18%</p></div>
              <div className="stat-pill"><p>Analysis Time</p><p>Under 2 min</p></div>
              <div className="stat-pill"><p>MVP Cost</p><p>Near $0</p></div>
            </div>
          </article>

          <article className="hero-panel stack">
            <h2>Product Preview</h2>
            <p className="muted">A command center built for daily creator decisions.</p>
            <div className="grid-2" style={{ marginTop: 2 }}>
              <div className="card stack">
                <h3>Health Score</h3>
                <p style={{ fontSize: "1.6rem", fontWeight: 900 }}>71/100</p>
                <p className="muted">Engagement is improving; consistency still lags weekends.</p>
              </div>
              <div className="card stack">
                <h3>Top Trend</h3>
                <p style={{ fontWeight: 700 }}>Behind-the-Scenes Build Logs</p>
                <p className="kpi">Estimated uplift +22%</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="page-wrap">
          <h2 className="section-title">Everything you need to grow like you have a strategist on call.</h2>
          <p className="section-subtitle">Built for solo creators who need specific moves, not generic analytics dashboards.</p>
          <div className="grid-3">
            {featureItems.map((item) => (
              <article className="feature-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-wrap grid-3" style={{ marginTop: 0 }}>
          <article className="feature-card">
            <h3>1. Connect Profile</h3>
            <p>Paste your YouTube channel URL or Instagram handle and pull real platform-level data.</p>
          </article>
          <article className="feature-card">
            <h3>2. Analyze + Coach</h3>
            <p>Receive structured insights and ask follow-up questions in an ongoing AI coach chat.</p>
          </article>
          <article className="feature-card">
            <h3>3. Execute Weekly</h3>
            <p>Ship content from trend opportunities and your 30-day calendar with clear weekly priorities.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="page-wrap grid-2" style={{ marginTop: 0 }}>
          <article className="feature-card">
            <h3>Creator-first value</h3>
            <p>Designed for individuals, not agencies. You get actionable recommendations at minimal cost.</p>
            <div className="actions"><button className="btn btn-primary" type="button">Start Free</button></div>
          </article>
          <article className="feature-card">
            <h3>Trust & Reliability</h3>
            <p>Uses real platform data, structured AI prompts, and persistent context for repeat sessions.</p>
            <div className="row" style={{ marginTop: 12 }}>
              <span className="tag">YouTube Data API</span>
              <span className="tag">Instagram API</span>
              <span className="tag">Supabase</span>
              <span className="tag">Gemini / Groq</span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

