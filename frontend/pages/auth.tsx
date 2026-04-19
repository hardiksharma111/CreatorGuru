import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

export default function Page() {
  const router = useRouter();
  const { signInDemo, signOut } = useAuth();

  function continueWithLogin() {
    signInDemo();
    void router.push("/dashboard");
  }

  function continueAsGuest() {
    signOut();
    void router.push("/dashboard");
  }

  return (
    <main className="hero">
      <div className="page-wrap hero-grid">
        <section className="hero-panel stack">
          <span className="eyebrow">CreatorGuru Access</span>
          <h1 className="hero-title" style={{ fontSize: "2.4rem" }}>
            Sign in to unlock your AI strategy console.
          </h1>
          <p className="hero-copy">
            Connect your creator profile, run performance analysis, and build your next month of content with confidence.
          </p>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={continueWithLogin}>Continue with Google</button>
            <button className="btn btn-secondary" type="button" onClick={continueWithLogin}>Continue with Email</button>
            <button className="btn btn-secondary" type="button" onClick={continueAsGuest}>Continue as Guest Demo</button>
          </div>
          <p className="muted">By continuing, you agree to CreatorGuru terms and privacy policy.</p>
        </section>

        <section className="hero-panel stack">
          <h2>What you get instantly</h2>
          <div className="feature-card">
            <h3>Profile Health Scan</h3>
            <p>Reach, engagement, consistency, and growth velocity in one structured report.</p>
          </div>
          <div className="feature-card">
            <h3>Weekly Opportunity Radar</h3>
            <p>Trend opportunities ranked with estimated uplift and suggested angles.</p>
          </div>
          <div className="feature-card">
            <h3>Always-on Coach</h3>
            <p>Context-aware chat that remembers your analysis and content goals.</p>
          </div>
          <Link href="/dashboard" className="btn btn-secondary">Skip to Demo Dashboard</Link>
        </section>
      </div>
    </main>
  );
}
