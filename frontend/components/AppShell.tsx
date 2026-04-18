import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

type NavItem = { href: string; label: string; section: "main" | "tools" | "account"; glyph: string; badge?: boolean };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", section: "main", glyph: "▦" },
  { href: "/analyze", label: "Profile Analyzer", section: "main", glyph: "◎" },
  { href: "/trends", label: "Trend Radar", section: "main", glyph: "⌁", badge: true },
  { href: "/chat", label: "AI Coach Chat", section: "tools", glyph: "◌" },
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

    function onExternalThemeChange() {
      const nextTheme = (window.localStorage.getItem("creatorguru-theme") as "morning" | "night" | null) ?? "morning";
      setTheme(nextTheme);
    }

    window.addEventListener("creatorguru-theme-change", onExternalThemeChange);
    return () => {
      window.removeEventListener("creatorguru-theme-change", onExternalThemeChange);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "night" ? "morning" : "night";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme === "night" ? "night" : "morning";
    window.localStorage.setItem("creatorguru-theme", nextTheme);
    window.dispatchEvent(new CustomEvent("creatorguru-theme-change"));
  }

  const groupedNav = {
    main: navItems.filter((item) => item.section === "main"),
    tools: navItems.filter((item) => item.section === "tools"),
    account: navItems.filter((item) => item.section === "account")
  };

  return (
    <div className="cg-layout">
      <aside className="cg-sidebar">
        <div className="cg-logo" aria-hidden="true">⚡</div>

        <nav className="cg-nav" aria-label="Main Navigation">
          {groupedNav.main.map((item) => (
            <Link key={item.href} href={item.href} className={`cg-nav-item ${item.href === currentPath ? "active" : ""}`} title={item.label}>
              <span aria-hidden="true">{item.glyph}</span>
              {item.badge ? <span className="cg-nav-dot" /> : null}
            </Link>
          ))}

          <span className="cg-nav-sep" aria-hidden="true" />

          {groupedNav.tools.map((item) => (
            <Link key={item.href} href={item.href} className={`cg-nav-item ${item.href === currentPath ? "active" : ""}`} title={item.label}>
              <span aria-hidden="true">{item.glyph}</span>
            </Link>
          ))}

          <span className="cg-nav-sep" aria-hidden="true" />

          {groupedNav.account.map((item) => (
            <Link key={item.href} href={item.href} className={`cg-nav-item ${item.href === currentPath ? "active" : ""}`} title={item.label}>
              <span aria-hidden="true">{item.glyph}</span>
            </Link>
          ))}
        </nav>

        <div className="cg-sidebar-foot">
          <button type="button" className="cg-theme-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            {theme === "night" ? "☾" : "☼"}
          </button>
          <div className="cg-avatar" aria-hidden="true">AK</div>
        </div>
      </aside>

      <main className="cg-main">
        <header className="cg-top-bar">
          <div>
            <h1>{title}</h1>
            {subtitle ? <p className="cg-subtitle">{subtitle}</p> : null}
          </div>
          <div className="cg-top-bar-r">
            <span className="cg-live-pill">Synced Live</span>
            <button type="button" className="cg-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">{theme === "night" ? "☾" : "☼"}</button>
            <Link href="/settings" className="cg-icon-btn" aria-label="Notifications">◌</Link>
            <Link href="/settings" className="cg-icon-btn" aria-label="System settings">⚙</Link>
          </div>
        </header>

        <section className="cg-content">
          {children}
        </section>
      </main>
    </div>
  );
}
