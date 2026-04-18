import Link from "next/link";
import { ReactNode } from "react";

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
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          CreatorGuru
          <small>AI Strategy Console</small>
        </div>
        <nav className="nav-list" aria-label="Main Navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${item.href === currentPath ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          <div className="row">
            <span className="kpi">Live data mode: Mock</span>
            <Link href="/settings" className="btn btn-secondary">
              Configure
            </Link>
          </div>
        </header>

        <section className="section" style={{ paddingTop: 18 }}>
          {children}
        </section>
      </main>
    </div>
  );
}
