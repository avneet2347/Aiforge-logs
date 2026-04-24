import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { metrics } from "@/lib/mock-data";

export function MetricsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-panel p-5"
        >
          <p className="text-muted-foreground text-sm font-medium">{m.label}</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-heading font-bold text-foreground">
              {m.value}
              {m.unit && <span className="text-base text-muted-foreground ml-0.5">{m.unit}</span>}
            </span>
            <span className={`flex items-center gap-1 text-sm font-medium ${m.change < 0 ? "text-primary" : "text-warning"}`}>
              {m.change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {Math.abs(m.change)}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
