export type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL" | "DEBUG";
export type AnomalyStatus = "active" | "investigating" | "resolved";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  anomaly?: boolean;
}

export interface Anomaly {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: AnomalyStatus;
  detectedAt: string;
  service: string;
  confidence: number;
  description: string;
}

export interface MetricCard {
  label: string;
  value: string;
  change: number;
  unit?: string;
}

export const metrics: MetricCard[] = [
  { label: "Logs Ingested", value: "2.4M", change: 12.3, unit: "/hr" },
  { label: "Anomalies Detected", value: "23", change: -18.5 },
  { label: "MTTD", value: "1.2", change: -80, unit: "min" },
  { label: "False Positive Rate", value: "3.1", change: -70, unit: "%" },
];

export const recentLogs: LogEntry[] = [
  { id: "1", timestamp: "2026-04-15T14:32:01Z", level: "ERROR", service: "auth-service", message: "JWT validation failed: token expired for user_8a3f2", anomaly: true },
  { id: "2", timestamp: "2026-04-15T14:31:58Z", level: "WARN", service: "api-gateway", message: "Rate limit threshold at 85% for endpoint /api/v2/users" },
  { id: "3", timestamp: "2026-04-15T14:31:55Z", level: "INFO", service: "payment-svc", message: "Transaction TXN-44829 processed successfully" },
  { id: "4", timestamp: "2026-04-15T14:31:52Z", level: "CRITICAL", service: "db-primary", message: "Connection pool exhausted: 0/100 available connections", anomaly: true },
  { id: "5", timestamp: "2026-04-15T14:31:49Z", level: "ERROR", service: "notification-svc", message: "SMTP relay timeout after 30s — retry 3/5" },
  { id: "6", timestamp: "2026-04-15T14:31:45Z", level: "DEBUG", service: "cache-layer", message: "Cache miss ratio elevated: 34% (baseline 12%)", anomaly: true },
  { id: "7", timestamp: "2026-04-15T14:31:42Z", level: "INFO", service: "search-engine", message: "Index rebuild completed in 4.2s" },
  { id: "8", timestamp: "2026-04-15T14:31:38Z", level: "WARN", service: "auth-service", message: "Unusual login pattern detected from IP 192.168.1.42", anomaly: true },
  { id: "9", timestamp: "2026-04-15T14:31:35Z", level: "INFO", service: "api-gateway", message: "Health check passed — all upstream services healthy" },
  { id: "10", timestamp: "2026-04-15T14:31:30Z", level: "ERROR", service: "file-storage", message: "S3 upload failed: bucket quota exceeded for org_7291" },
];

export const anomalies: Anomaly[] = [
  { id: "a1", title: "Database Connection Pool Exhaustion", severity: "critical", status: "active", detectedAt: "2 min ago", service: "db-primary", confidence: 97, description: "Connection pool depleted. Predicted cascade failure in 8 min." },
  { id: "a2", title: "Unusual Auth Pattern Cluster", severity: "high", status: "investigating", detectedAt: "12 min ago", service: "auth-service", confidence: 89, description: "LSTM detected 4x spike in failed auth attempts from 3 IP ranges." },
  { id: "a3", title: "Cache Hit Ratio Degradation", severity: "medium", status: "active", detectedAt: "25 min ago", service: "cache-layer", confidence: 76, description: "Cache miss ratio trending 3x above baseline. Potential memory pressure." },
  { id: "a4", title: "API Latency Drift", severity: "low", status: "resolved", detectedAt: "1 hr ago", service: "api-gateway", confidence: 65, description: "P99 latency increased 40ms. Auto-resolved after scaling event." },
];

export const logVolumeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  info: Math.floor(Math.random() * 5000 + 8000),
  warn: Math.floor(Math.random() * 800 + 200),
  error: Math.floor(Math.random() * 300 + 50),
  critical: Math.floor(Math.random() * 20 + (i > 18 ? 40 : 2)),
}));

export const anomalyTimelineData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  anomalies: Math.floor(Math.random() * 5 + (i > 18 ? 8 : 1)),
  predicted: Math.floor(Math.random() * 3 + (i > 20 ? 5 : 0)),
}));
