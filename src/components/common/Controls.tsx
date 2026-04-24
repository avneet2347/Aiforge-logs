import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ChevronDown, Check, Sun, Moon, Printer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const DATA_SOURCES: string[] = ["AIForge Engine", "Log Ingest API"];

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMatchMedia?.("(prefers-color-scheme: dark)").matches) ||
      document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((d) => !d)}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
        color: isDark ? "#c8c9cc" : "#4b5563",
      }}
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}

export function ExportPdfButton({ loading }: { loading?: boolean }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <button
      onClick={() => window.print()}
      disabled={loading}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors disabled:opacity-50"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
        color: isDark ? "#c8c9cc" : "#4b5563",
      }}
      aria-label="Export as PDF"
    >
      <Printer className="w-3.5 h-3.5" />
    </button>
  );
}

export function SimpleRefreshButton({ loading, onRefresh }: { loading?: boolean; onRefresh: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (loading) {
      setIsSpinning(true);
    } else {
      const t = setTimeout(() => setIsSpinning(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className="flex items-center gap-1 px-2 h-[26px] rounded-[6px] text-[12px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
        color: isDark ? "#c8c9cc" : "#4b5563",
      }}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );
}

export function SplitRefreshButton({ loading }: { loading?: boolean }) {
  const queryClient = useQueryClient();
  const [isSpinning, setIsSpinning] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [selectedIntervalMs, setSelectedIntervalMs] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (loading) {
      setIsSpinning(true);
    } else {
      const t = setTimeout(() => setIsSpinning(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedIntervalMs === null) return;
    const t = setInterval(() => {
      queryClient.invalidateQueries();
    }, selectedIntervalMs);
    return () => clearInterval(t);
  }, [selectedIntervalMs, queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const INTERVAL_OPTIONS = [
    { label: "Off", ms: null },
    { label: "Every 15s", ms: 15 * 1000 },
    { label: "Every 30s", ms: 30 * 1000 },
    { label: "Every 60s", ms: 60 * 1000 },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center rounded-[6px] overflow-hidden h-[26px] text-[12px]"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
          color: isDark ? "#c8c9cc" : "#4b5563",
        }}
      >
        <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1 px-2 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <div className="w-px h-4 shrink-0" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
        <button onClick={() => setDropdownOpen((o) => !o)} className="flex items-center justify-center px-1.5 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-popover border border-border rounded-md shadow-md z-50 overflow-hidden text-sm text-popover-foreground">
          <div className="p-2 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">Auto-refresh</div>
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setSelectedIntervalMs(opt.ms);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-muted rounded-sm transition-colors"
              >
                <span>{opt.label}</span>
                {selectedIntervalMs === opt.ms && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LastRefreshed({ updatedAt }: { updatedAt?: number }) {
  if (!updatedAt) return null;
  const d = new Date(updatedAt);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const str = `${time} on ${date}`;

  return (
    <p className="text-[12px] text-muted-foreground mt-3">Last refresh: {str}</p>
  );
}

export function DataSourcesBadges() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (!DATA_SOURCES.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span className="text-[12px] text-muted-foreground shrink-0">
        Data Sources:
      </span>
      {DATA_SOURCES.map((source) => (
        <span
          key={source}
          className="text-[12px] font-bold rounded px-2 py-0.5 truncate print:!bg-[rgb(229,231,235)] print:!text-[rgb(75,85,99)]"
          title={source}
          style={{
            maxWidth: "20ch",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgb(229, 231, 235)",
            color: isDark ? "#c8c9cc" : "rgb(75, 85, 99)",
          }}
        >
          {source}
        </span>
      ))}
    </div>
  );
}

export const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  pink: "#ec4899",
};

export const CHART_COLOR_LIST = [
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.green,
  CHART_COLORS.red,
  CHART_COLORS.pink,
];
