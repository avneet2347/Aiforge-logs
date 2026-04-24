export function formatNumber(n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", opts).format(n);
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86400)}d ago`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function severityColor(s: string): string {
  switch (s) {
    case "critical":
    case "fatal":
      return "bg-red-600 text-white";
    case "high":
    case "error":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30";
    case "medium":
    case "warn":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
    case "low":
    case "info":
      return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30";
    case "debug":
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function statusColor(s: string): string {
  switch (s) {
    case "healthy":
    case "resolved":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
    case "degraded":
    case "acknowledged":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
    case "down":
    case "active":
    case "open":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}
