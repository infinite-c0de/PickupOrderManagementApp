import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FilePlus2, Users, ClipboardList, RefreshCw, Settings, Snowflake } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new-pickup", label: "New Pickup", icon: FilePlus2 },
  { to: "/pickups", label: "Pickup Log", icon: ClipboardList },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/sync", label: "Sync Status", icon: RefreshCw },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="no-print sticky top-0 z-30 border-b border-border bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-foreground/10 ring-1 ring-brand-foreground/20">
            <Snowflake className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg leading-tight truncate">Pickup Order App</div>
            <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">Without A Trace</div>
          </div>
          <div className="hidden text-xs opacity-80 sm:block">Sarah K. · Clerk</div>
        </div>
      </header>

      {/* Desktop sidebar + content */}
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-5 lg:py-8">
        <aside className="no-print hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1 rounded-2xl bg-brand p-2 text-brand-foreground">
            {navItems.map((it) => {
              const active = pathname === it.to;
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active ? "bg-brand-foreground/15 ring-1 ring-brand-foreground/20" : "hover:bg-brand-foreground/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-28 lg:pb-0">
          <div className="mb-5">
            <h1 className="font-display text-2xl text-brand sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="no-print fixed inset-x-0 bottom-3 z-30 mx-3 rounded-2xl bg-brand p-1.5 shadow-2xl shadow-brand/30 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.filter((n) => n.to !== "/settings").concat(navItems.filter((n) => n.to === "/settings")).slice(0, 5).map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors ${
                  active ? "bg-brand-foreground/15 text-brand-foreground ring-1 ring-brand-foreground/20" : "text-brand-foreground/80 hover:bg-brand-foreground/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
