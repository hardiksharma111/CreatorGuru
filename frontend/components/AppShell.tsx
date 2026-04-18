import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyze", label: "Profile Analyzer" },
  { href: "/trends", label: "Trend Radar" },
  { href: "/chat", label: "AI Coach Chat" },
  { href: "/audit", label: "Post Auditor" },
  { href: "/thumbnail", label: "Thumbnail Scorer" },
  { href: "/calendar", label: "Content Calendar" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/settings", label: "Settings" }
];

type Props = {
  title: string;
  subtitle?: string;
  currentPath: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, currentPath, children }: Props) {
  const [theme, setTheme] = useState<"morning" | "night">("morning");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("creatorguru-theme") as "morning" | "night" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme ?? (prefersDark ? "night" : "morning");
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme === "night" ? "night" : "morning";
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "night" ? "morning" : "night";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme === "night" ? "night" : "morning";
    window.localStorage.setItem("creatorguru-theme", nextTheme);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          CreatorGuru
          <small>AI Strategy Console</small>
        </div>
        <p className="sidebar-meta">Volume 01 • Creator Ops</p>
        <nav className="nav-list" aria-label="Main Navigation">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${item.href === currentPath ? "active" : ""}`}
            >
              <span className="nav-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-label">Appearance</p>
          <button type="button" className="theme-toggle theme-toggle-sidebar" onClick={toggleTheme} aria-label="Toggle morning and night mode">
            <span className="theme-dot" aria-hidden="true" />
            {theme === "night" ? "Night Mode" : "Morning Mode"}
          </button>
          <p className="sidebar-hint">Morning mode for planning. Night mode for focus.</p>
          <Link href="/settings" className="sidebar-action">
            Configure integrations
          </Link>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          <div className="row topbar-actions">
            <span className="kpi">Live now: Dashboard + Trends</span>
            <Link href="/settings" className="btn btn-secondary">
              Configure
            </Link>
          </div>
        </header>

        <section className="section content-canvas" style={{ paddingTop: 18 }}>
          {children}
        </section>
      </main>
    </div>
  );
}
