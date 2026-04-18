import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

type NavItem = { href: string; label: string; section: "main" | "tools" | "account"; glyph: string; badge?: string };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", section: "main", glyph: "◻" },
  { href: "/analyze", label: "Profile Analyzer", section: "main", glyph: "○" },
  { href: "/trends", label: "Trend Radar", section: "main", glyph: "~", badge: "3" },
  { href: "/chat", label: "AI Coach Chat", section: "tools", glyph: "◦" },
  { href: "/audit", label: "Post Auditor", section: "tools", glyph: "▣" },
  { href: "/thumbnail", label: "Thumbnail Scorer", section: "tools", glyph: "◇" },
  { href: "/calendar", label: "Content Calendar", section: "tools", glyph: "▤" },
  { href: "/benchmarks", label: "Benchmarks", section: "tools", glyph: "▥" },
  { href: "/settings", label: "Settings", section: "account", glyph: "⚙" }
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

  const groupedNav = {
    main: navItems.filter((item) => item.section === "main"),
    tools: navItems.filter((item) => item.section === "tools"),
    account: navItems.filter((item) => item.section === "account")
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand brand-tight">
          <span className="brand-badge" aria-hidden="true">✦</span>
          <div>
            CreatorGuru
            <small>Analytics</small>
          </div>
        </div>
        <div className="sidebar-group">
          <p className="sidebar-section-title">Main</p>
          <nav className="nav-list" aria-label="Main Navigation">
            {groupedNav.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${item.href === currentPath ? "active" : ""}`}
              >
                <span className="nav-glyph" aria-hidden="true">{item.glyph}</span>
                <span>{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-group">
          <p className="sidebar-section-title">Tools</p>
          <nav className="nav-list" aria-label="Tools Navigation">
            {groupedNav.tools.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${item.href === currentPath ? "active" : ""}`}
              >
                <span className="nav-glyph" aria-hidden="true">{item.glyph}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-group">
          <p className="sidebar-section-title">Account</p>
          <nav className="nav-list" aria-label="Account Navigation">
            {groupedNav.account.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${item.href === currentPath ? "active" : ""}`}
              >
                <span className="nav-glyph" aria-hidden="true">{item.glyph}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-theme-row">
            <span className="sidebar-label">{theme === "night" ? "Night Mode" : "Dark Mode"}</span>
            <button
              type="button"
              className={`toggle-switch ${theme === "night" ? "active" : ""}`}
              onClick={toggleTheme}
              aria-label="Toggle morning and night mode"
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="account-tile">
            <div className="avatar-chip" aria-hidden="true">AK</div>
            <div>
              <p className="account-name">Aiman Khan</p>
              <p className="account-plan">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          <div className="row topbar-actions">
            <span className="sync-pill">Synced Live</span>
            <Link href="/settings" className="icon-btn" aria-label="Theme settings">☼</Link>
            <Link href="/settings" className="icon-btn" aria-label="Notifications">◌</Link>
            <Link href="/settings" className="icon-btn" aria-label="System settings">⚙</Link>
          </div>
        </header>

        <section className="section content-canvas" style={{ paddingTop: 18 }}>
          {children}
        </section>
      </main>
    </div>
  );
}
