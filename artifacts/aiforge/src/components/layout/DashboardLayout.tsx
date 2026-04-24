import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  FileSearch,
  GitBranch,
  Layers,
  Moon,
  Printer,
  RefreshCw,
  Server,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Overview", icon: BarChart3 },
  { path: "/anomalies", label: "Anomalies", icon: Activity },
  { path: "/patterns", label: "Patterns", icon: Layers },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/predictions", label: "Predictions", icon: TrendingUp },
  { path: "/services", label: "Services", icon: Server },
  { path: "/logs", label: "Log Explorer", icon: FileSearch },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("aiforge-theme");
    if (stored) return stored === "dark";
    return true;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aiforge-theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark] as const;
}

function useAutoRefresh(enabled: boolean) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      qc.invalidateQueries();
    }, 15000);
    return () => clearInterval(id);
  }, [enabled, qc]);
}

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function DashboardLayout({ title, subtitle, children, actions }: Props) {
  const [location] = useLocation();
  const [dark, setDark] = useDarkMode();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const qc = useQueryClient();
  useAutoRefresh(autoRefresh);

  const refresh = () => qc.invalidateQueries();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border print:hidden">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <div className="size-8 rounded-md bg-sidebar-primary flex items-center justify-center">
            <Zap className="size-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-wide">
              AIForge
            </div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Technical Suite
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.path === "/"
                ? location === "/"
                : location.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-white font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Stream live</span>
          </div>
          <div className="text-[10px] text-sidebar-foreground/50">
            v0.1.0 · region us-east-1
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border print:static print:border-0">
          <div className="flex items-center justify-between gap-4 px-6 h-16">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight truncate">
                  {title}
                </h1>
                <Badge variant="outline" className="font-mono text-[10px]">
                  LIVE
                </Badge>
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 print:hidden">
              {actions}
              <Button
                size="sm"
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh((v) => !v)}
                className="gap-2"
              >
                <RefreshCw
                  className={cn("size-3.5", autoRefresh && "animate-spin")}
                  style={autoRefresh ? { animationDuration: "3s" } : {}}
                />
                <span className="hidden sm:inline">
                  {autoRefresh ? "Auto" : "Paused"}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={refresh}
                title="Refresh now"
              >
                <RefreshCw className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                title="Print / Export PDF"
              >
                <Printer className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDark((v) => !v)}
                title="Toggle theme"
              >
                {dark ? (
                  <Sun className="size-3.5" />
                ) : (
                  <Moon className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 px-6 pb-3 text-[11px] text-muted-foreground overflow-x-auto print:hidden">
            <span className="flex items-center gap-1">
              <GitBranch className="size-3" />
              Sources:
            </span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              fluentd
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              kafka://logs
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              cloudwatch
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              k8s-events
            </Badge>
            <span className="ml-auto flex items-center gap-1.5 text-emerald-500">
              <AlertTriangle className="size-3" />
              IsoForest · K-Means · Prophet · BERT online
            </span>
          </div>
        </header>
        <main className="flex-1 px-6 py-6 print:px-2 print:py-2">
          {children}
        </main>
      </div>
    </div>
  );
}
