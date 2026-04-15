import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { anomalies, type Anomaly } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const severityStyles: Record<Anomaly["severity"], string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  medium: "bg-accent/20 text-accent border-accent/30",
  low: "bg-muted text-muted-foreground border-border",
};

const statusIcons: Record<Anomaly["status"], React.ElementType> = {
  active: ShieldAlert,
  investigating: ShieldQuestion,
  resolved: ShieldCheck,
};

export function AnomalyPanel() {
  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground">Anomalies</h3>
        <Badge variant="outline" className="text-primary border-primary/30">
          {anomalies.filter(a => a.status !== "resolved").length} active
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {anomalies.map((a, i) => {
          const StatusIcon = statusIcons[a.status];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-3 rounded-lg border ${severityStyles[a.severity]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <StatusIcon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.title}</p>
                    <p className="text-xs opacity-70 mt-0.5">{a.service} · {a.detectedAt}</p>
                  </div>
                </div>
                <span className="text-xs font-mono shrink-0">{a.confidence}%</span>
              </div>
              <p className="text-xs opacity-60 mt-2 line-clamp-2">{a.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
