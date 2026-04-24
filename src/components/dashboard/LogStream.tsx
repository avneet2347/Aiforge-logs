import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle, Bug, Flame } from "lucide-react";
import { recentLogs, type LogLevel } from "@/lib/mock-data";

const levelConfig: Record<LogLevel, { icon: React.ElementType; color: string }> = {
  INFO: { icon: Info, color: "text-info" },
  WARN: { icon: AlertTriangle, color: "text-warning" },
  ERROR: { icon: XCircle, color: "text-destructive" },
  CRITICAL: { icon: Flame, color: "text-destructive" },
  DEBUG: { icon: Bug, color: "text-muted-foreground" },
};

export function LogStream() {
  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground">Live Log Stream</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
        {recentLogs.map((log, i) => {
          const cfg = levelConfig[log.level];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors ${log.anomaly ? "glow-border bg-primary/5" : ""}`}
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cfg.color}`} />
              <span className="text-muted-foreground shrink-0 w-16">
                {new Date(log.timestamp).toLocaleTimeString("en", { hour12: false })}
              </span>
              <span className="text-accent shrink-0 w-28 truncate">{log.service}</span>
              <span className="text-foreground/80 break-all">{log.message}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
