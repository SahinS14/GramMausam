import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CloudRainWind,
  FlaskConical,
  Info,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/layout/site-footer";

const links = [
  { to: "/", label: "Home", icon: BarChart3 },
  { to: "/predictions", label: "5-Day Forecast", icon: CloudRainWind },
  { to: "/alerts", label: "Farm Advice", icon: AlertTriangle },
  { to: "/methodology", label: "How it works", icon: BookOpen },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const hash = useRouterState({ select: (state) => state.location.hash });
  const active = (link: (typeof links)[number]) =>
    path === link.to && (link.hash ? hash === link.hash : !hash);
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-card/80 text-foreground shadow-sm shadow-primary/5 backdrop-blur-xl">
        <div className="flex h-[68px] items-center justify-between gap-4 px-4 lg:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="GramMausam Dhanbad home"
          >
            <img
              src="/logo.png"
              alt="GramMausam logo"
              className="size-10 shrink-0 rounded-xl object-cover shadow-md"
            />
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight">
                GramMausam
              </span>
              <span className="block truncate text-[9px] font-bold uppercase text-muted-foreground">
                Dhanbad Panchayat weather
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center rounded-full border border-[#c9d7e8] bg-[#e7eef7] p-1 shadow-md shadow-[#234a74]/10 lg:flex"
            aria-label="Primary navigation"
          >
            {links.map((link) => (
              <Link
                to={link.to}
                hash={link.hash}
                key={`${link.to}-${link.hash ?? "home"}`}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-bold text-[#29445f] transition-colors hover:bg-white/70",
                  active(link) && "!bg-[#092b58] !text-white shadow-sm",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live forecast
              </span>
              <span className="flex items-center gap-2 border-l border-border pl-3 text-[10px] font-semibold uppercase text-muted-foreground">
                <FlaskConical className="size-3.5" />
                SIH 2026
              </span>
            </div>
            <button
              className="rounded-md p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
              aria-label="Toggle navigation"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="grid border-t border-border bg-card p-2 lg:hidden">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  to={link.to}
                  hash={link.hash}
                  onClick={() => setOpen(false)}
                  key={`${link.to}-${link.hash ?? "home"}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground",
                    active(link) && "bg-muted text-primary",
                  )}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
      <div className="border-b border-secondary/30 bg-secondary/20 px-4 py-3 lg:px-6" role="status">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-secondary-foreground">
          <span className="flex items-center gap-2 font-extrabold">
            <Info className="size-4 shrink-0" />
            Model works only for Dhanbad District, Jharkhand.
          </span>
          <span className="hidden text-secondary-foreground/50 sm:inline">|</span>
          <span>
            <strong>To test:</strong> Jharkhand → Dhanbad → choose a Block → choose a Panchayat
          </span>
          <span className="hidden text-secondary-foreground/50 md:inline">|</span>
          <span>
            <strong>Example:</strong> Baghmara → BAGDAHA
          </span>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
      <SiteFooter />
    </div>
  );
}
