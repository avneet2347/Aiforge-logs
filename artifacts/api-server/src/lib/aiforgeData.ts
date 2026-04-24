import { createHash } from "node:crypto";

const SERVICES = [
  "auth-service",
  "checkout-api",
  "payments-gateway",
  "search-indexer",
  "recommendation-engine",
  "notification-worker",
  "user-profile",
  "media-pipeline",
  "billing-service",
  "fraud-detector",
  "edge-cdn",
  "session-store",
];

const HOSTS = [
  "ip-10-0-12-44.us-east-1",
  "ip-10-0-9-118.us-east-1",
  "ip-10-0-31-204.us-west-2",
  "ip-10-0-14-77.eu-west-1",
  "ip-10-0-22-3.us-east-1",
  "ip-10-0-7-91.ap-south-1",
  "k8s-prod-node-12",
  "k8s-prod-node-7",
];

const ENVIRONMENTS = ["production", "production", "production", "staging"];

const LEVELS = ["debug", "info", "warn", "error", "fatal"] as const;
type Level = (typeof LEVELS)[number];

const INFO_TEMPLATES = [
  "Request {METHOD} {PATH} completed in {N}ms status={STATUS}",
  "Cache hit for key user:{N}:profile (ttl={N}s)",
  "Started job processor pid={N} workers={N}",
  "Health check passed for service={SVC}",
  "User {USER} authenticated via {PROVIDER}",
  "Scheduled task tick interval={N}s",
  "Connection pool size={N} idle={N} active={N}",
  "Published event order.created order_id={UUID}",
  "Background sync completed records={N} duration={N}ms",
  "Loaded {N} feature flags from store",
];

const WARN_TEMPLATES = [
  "Retrying request to upstream service={SVC} attempt={N}/3",
  "Slow query detected duration={N}ms table=orders",
  "Rate limit approaching for tenant={N} usage={N}%",
  "Deprecated API path /v1/{PATH} called by client={SVC}",
  "Connection pool nearing capacity active={N}/64",
  "Stale cache entry returned key=session:{UUID}",
  "Memory pressure on host {HOST} rss={N}MB",
  "Task queue depth growing depth={N}",
];

const ERROR_TEMPLATES = [
  "Database connection refused host=db-primary.internal port=5432",
  "Upstream timeout after {N}ms service={SVC} traceId={UUID}",
  "Failed to acquire distributed lock key=order:{UUID} after {N}ms",
  "JWT signature validation failed user_id={N} ip=10.0.{N}.{N}",
  "Payment gateway returned 502 transaction_id={UUID}",
  "Schema validation failed field=email value=null",
  "Webhook delivery failed url=https://hooks.{SVC}.com/incoming status=500",
  "OOM killer terminated process pid={N} on host={HOST}",
  "Circuit breaker tripped for upstream={SVC} window={N}s",
  "Index corruption detected on shard={N} cluster=search-prod",
];

const FATAL_TEMPLATES = [
  "Replica failover triggered cluster=db-primary lost_quorum=true",
  "Out of disk space on volume=/var/log usage=99.7%",
  "Kernel panic reported on host={HOST} reboot pending",
  "Service mesh sidecar crashed pod={SVC}-{UUID}",
];

const DEBUG_TEMPLATES = [
  "Trace span opened op={SVC}.handle parent={UUID}",
  "Cache lookup miss key=user:{N}:settings",
  "Loading config layer={N}",
  "Serializing payload bytes={N}",
];

const ANOMALY_SIGNATURES = [
  "Burst of 5xx responses on /v1/checkout/submit (3.4σ above baseline)",
  "Latency p99 spike from 180ms to 2.1s on payments-gateway",
  "Unusual login pattern: 412 failed JWT validations from new ASN",
  "Disk write IOPS exceeding 4× baseline on db-primary replica",
  "Connection pool exhaustion pattern in checkout-api (Isolation Forest score 0.92)",
  "Anomalous error template clustering: 'Schema validation failed' rising 18×",
  "Memory leak suspected in media-pipeline (RSS climbing 2.3%/hr for 6h)",
  "Search-indexer queue depth diverging from forecast (Prophet residual 4.1σ)",
  "Cross-AZ traffic asymmetry detected on edge-cdn",
  "Rare BERT-clustered error pattern emerged: 'Stripe webhook idempotency mismatch'",
  "Sustained 95% CPU on notification-worker for 14 minutes",
  "Anomalous drop in successful-login rate (-37% vs hourly forecast)",
];

const PATTERN_TEMPLATES = [
  "Database connection refused host=<*> port=<*>",
  "Upstream timeout after <*>ms service=<*> traceId=<*>",
  "Cache miss for key=<*>:<*>:<*>",
  "JWT signature validation failed user_id=<*>",
  "Payment gateway returned <*> transaction_id=<*>",
  "Slow query detected duration=<*>ms table=<*>",
  "Webhook delivery failed url=<*> status=<*>",
  "Circuit breaker tripped for upstream=<*> window=<*>s",
  "Memory pressure on host <*> rss=<*>MB",
  "Connection pool nearing capacity active=<*>/<*>",
  "Schema validation failed field=<*> value=<*>",
  "Rate limit approaching for tenant=<*> usage=<*>%",
];

const CLUSTER_NAMES = [
  "infra.connectivity",
  "auth.token",
  "payments.upstream",
  "perf.latency",
  "perf.memory",
  "data.validation",
  "ratelimit.tenant",
  "queue.backpressure",
];

const ALERT_TITLES = [
  "Elevated 5xx rate on checkout-api",
  "Latency SLO breach: payments-gateway p99 > 1.5s",
  "Auth-service: surge in failed JWT validations",
  "Predicted disk exhaustion on db-primary in 47 minutes",
  "Anomalous error cluster forming in fraud-detector",
  "Recommendation-engine: queue depth diverging from forecast",
  "Edge-CDN cache hit ratio dropped 22% in 10 minutes",
  "Notification-worker CPU saturation on k8s-prod-node-7",
  "Search-indexer replication lag > 30s",
  "Billing-service: idempotency conflict spike",
];

const ROOT_CAUSE_COMPONENTS = [
  "ingress-nginx",
  "envoy-sidecar",
  "rds-primary",
  "redis-cluster",
  "kafka-broker",
  "node-runtime",
  "auth-token-issuer",
  "payment-processor-adapter",
  "feature-flag-cache",
];

const PREDICTION_SIGNALS = [
  "Disk write IOPS trajectory crosses red-zone in forecast horizon",
  "Memory RSS slope predicts OOM within 2 forecast windows",
  "Queue depth growth rate exceeds drain rate (Prophet)",
  "Connection pool saturation forecast within next hour",
  "Error rate trending toward SLO breach",
  "Replication lag widening: secondary will fall behind quorum threshold",
];

const RECOMMENDED_ACTIONS = [
  "Scale read replicas +2 and rebalance shards",
  "Restart pods on k8s-prod-node-7 to reclaim memory",
  "Increase connection pool max_size to 128 and roll out canary",
  "Drain queue with burst worker autoscaling profile",
  "Enable circuit breaker for upstream and shed load to backup region",
  "Promote standby replica and rotate primary",
];

// Deterministic PRNG so the data feels alive but is reproducible per request.
function hashSeed(...parts: Array<string | number>): number {
  const h = createHash("sha256")
    .update(parts.map(String).join("|"))
    .digest();
  return h.readUInt32BE(0);
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(rand: () => number, min: number, max: number): number {
  return rand() * (max - min) + min;
}

function uuid(rand: () => number): string {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) s += "-";
    s += hex[Math.floor(rand() * 16)];
  }
  return s;
}

function fillTemplate(rand: () => number, tpl: string): string {
  return tpl
    .replace(/\{METHOD\}/g, () => pick(rand, ["GET", "POST", "PUT", "DELETE", "PATCH"]))
    .replace(/\{PATH\}/g, () =>
      pick(rand, [
        "users",
        "orders",
        "checkout/submit",
        "search",
        "auth/refresh",
        "media/upload",
        "billing/invoices",
        "recommendations",
      ]),
    )
    .replace(/\{STATUS\}/g, () => String(pick(rand, [200, 200, 200, 201, 204, 400, 401, 404, 500, 502])))
    .replace(/\{SVC\}/g, () => pick(rand, SERVICES))
    .replace(/\{HOST\}/g, () => pick(rand, HOSTS))
    .replace(/\{USER\}/g, () => `u_${randInt(rand, 100000, 999999)}`)
    .replace(/\{PROVIDER\}/g, () => pick(rand, ["google", "github", "saml", "magic-link"]))
    .replace(/\{UUID\}/g, () => uuid(rand))
    .replace(/\{N\}/g, () => String(randInt(rand, 2, 9999)));
}

function templatesForLevel(level: Level): readonly string[] {
  switch (level) {
    case "debug":
      return DEBUG_TEMPLATES;
    case "info":
      return INFO_TEMPLATES;
    case "warn":
      return WARN_TEMPLATES;
    case "error":
      return ERROR_TEMPLATES;
    case "fatal":
      return FATAL_TEMPLATES;
  }
}

// Diurnal-style intensity so charts have a clear shape over the day.
function diurnal(hour: number): number {
  // Roughly bell-shaped around 14:00 UTC, low overnight.
  const x = (hour - 14) / 6;
  return 0.45 + 0.55 * Math.exp(-x * x);
}

function nowFloorMinute(): Date {
  const d = new Date();
  d.setSeconds(0, 0);
  return d;
}

export interface DashboardSummary {
  logsIngested24h: number;
  logsPerSecond: number;
  anomaliesDetected24h: number;
  activeAlerts: number;
  criticalAlerts: number;
  servicesMonitored: number;
  servicesHealthy: number;
  servicesDegraded: number;
  servicesDown: number;
  mttdMinutes: number;
  mttdReductionPct: number;
  falsePositiveRate: number;
  falsePositiveReductionPct: number;
  engineerHoursSavedWeekly: number;
  patternsDiscovered: number;
  predictiveIssuesIdentified: number;
}

export function buildSummary(): DashboardSummary {
  const services = listServices();
  const alerts = listAlerts();
  return {
    logsIngested24h: 18_412_873,
    logsPerSecond: 213.4,
    anomaliesDetected24h: 38,
    activeAlerts: alerts.filter((a) => a.status === "active").length,
    criticalAlerts: alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length,
    servicesMonitored: services.length,
    servicesHealthy: services.filter((s) => s.status === "healthy").length,
    servicesDegraded: services.filter((s) => s.status === "degraded").length,
    servicesDown: services.filter((s) => s.status === "down").length,
    mttdMinutes: 4.2,
    mttdReductionPct: 80,
    falsePositiveRate: 6.8,
    falsePositiveReductionPct: 70,
    engineerHoursSavedWeekly: 10.3,
    patternsDiscovered: 247,
    predictiveIssuesIdentified: 12,
  };
}

export interface LogVolumePoint {
  timestamp: string;
  debug: number;
  info: number;
  warn: number;
  error: number;
  fatal: number;
}

export function buildLogVolume(window: "1h" | "6h" | "24h" | "7d"): LogVolumePoint[] {
  const now = nowFloorMinute();
  let buckets: number;
  let stepMs: number;
  switch (window) {
    case "1h":
      buckets = 60;
      stepMs = 60 * 1000;
      break;
    case "6h":
      buckets = 72;
      stepMs = 5 * 60 * 1000;
      break;
    case "24h":
      buckets = 96;
      stepMs = 15 * 60 * 1000;
      break;
    case "7d":
      buckets = 84;
      stepMs = 2 * 60 * 60 * 1000;
      break;
  }

  const out: LogVolumePoint[] = [];
  for (let i = buckets - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * stepMs);
    const seed = hashSeed("logvol", window, t.toISOString());
    const rand = mulberry32(seed);
    const intensity = diurnal(t.getUTCHours());
    const base = stepMs / 1000; // seconds in bucket
    const lps = 200 + 80 * intensity + (rand() - 0.5) * 30;
    const total = lps * base;
    // Severity mix
    const debug = Math.round(total * (0.18 + (rand() - 0.5) * 0.04));
    const info = Math.round(total * (0.62 + (rand() - 0.5) * 0.04));
    const warn = Math.round(total * (0.13 + (rand() - 0.5) * 0.03));
    const error = Math.round(total * (0.06 + (rand() - 0.5) * 0.02));
    const fatal = Math.max(0, Math.round(total * (0.001 + rand() * 0.0015)));
    out.push({
      timestamp: t.toISOString(),
      debug,
      info,
      warn,
      error,
      fatal,
    });
  }
  return out;
}

export interface AnomalyTrendPoint {
  timestamp: string;
  score: number;
  upperBound: number;
  lowerBound: number;
  threshold: number;
}

export function buildAnomalyTrend(): AnomalyTrendPoint[] {
  const now = nowFloorMinute();
  const out: AnomalyTrendPoint[] = [];
  for (let i = 47; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 30 * 60 * 1000);
    const seed = hashSeed("anomtrend", t.toISOString());
    const rand = mulberry32(seed);
    const baseline = 0.18 + 0.05 * Math.sin((i / 48) * Math.PI * 2);
    let score = baseline + randFloat(rand, -0.04, 0.06);
    // Inject two clear spikes for narrative
    if (i === 6) score = 0.78;
    if (i === 17) score = 0.62;
    if (i === 31) score = 0.55;
    out.push({
      timestamp: t.toISOString(),
      score: Number(score.toFixed(3)),
      upperBound: Number((baseline + 0.18).toFixed(3)),
      lowerBound: Number(Math.max(0, baseline - 0.12).toFixed(3)),
      threshold: 0.5,
    });
  }
  return out;
}

export interface MttdPoint {
  week: string;
  mttdMinutes: number;
  baselineMinutes: number;
}

export function buildMttdTrend(): MttdPoint[] {
  const out: MttdPoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const wk = `W${String(getWeekNumber(d)).padStart(2, "0")}`;
    const seed = hashSeed("mttd", wk);
    const rand = mulberry32(seed);
    // Baseline ~22 min, AIForge mttd glides from 18 -> 4.2
    const mttd = 18 - (i === 11 ? 0 : (11 - i) * 1.25) + randFloat(rand, -0.4, 0.4);
    out.push({
      week: wk,
      mttdMinutes: Number(Math.max(3.5, mttd).toFixed(2)),
      baselineMinutes: 22,
    });
  }
  return out;
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export interface SeveritySlice {
  level: string;
  count: number;
  percentage: number;
}

export function buildSeverityDistribution(): SeveritySlice[] {
  const totals = {
    debug: 3_314_317,
    info: 11_416_181,
    warn: 2_393_673,
    error: 1_104_772,
    fatal: 18_412,
  };
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  return (Object.keys(totals) as Array<keyof typeof totals>).map((k) => ({
    level: k,
    count: totals[k],
    percentage: Number(((totals[k] / total) * 100).toFixed(2)),
  }));
}

export interface ServiceErrorRank {
  service: string;
  errors: number;
  warnings: number;
  deltaPct: number;
}

export function buildTopServices(): ServiceErrorRank[] {
  const seed = hashSeed("topsvc", new Date().toISOString().slice(0, 13));
  const rand = mulberry32(seed);
  const entries = SERVICES.map((s) => {
    const errors = randInt(rand, 80, 4200);
    const warnings = randInt(rand, errors, errors * 5);
    const deltaPct = Number(randFloat(rand, -25, 65).toFixed(1));
    return { service: s, errors, warnings, deltaPct };
  });
  entries.sort((a, b) => b.errors - a.errors);
  return entries.slice(0, 8);
}

export interface ThroughputPoint {
  timestamp: string;
  eventsPerSecond: number;
}

export function buildIngestThroughput(): ThroughputPoint[] {
  const now = nowFloorMinute();
  const out: ThroughputPoint[] = [];
  for (let i = 59; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 1000);
    const seed = hashSeed("throughput", t.toISOString());
    const rand = mulberry32(seed);
    const intensity = diurnal(t.getUTCHours());
    const eps = 180 + 90 * intensity + (rand() - 0.5) * 28;
    out.push({
      timestamp: t.toISOString(),
      eventsPerSecond: Number(eps.toFixed(1)),
    });
  }
  return out;
}

export interface LogEvent {
  id: string;
  timestamp: string;
  level: Level;
  service: string;
  host: string;
  traceId: string;
  message: string;
  anomalyScore: number;
}

export function buildLogs(filters: {
  level?: string;
  service?: string;
  search?: string;
  limit?: number;
}): LogEvent[] {
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);
  const now = nowFloorMinute();
  const out: LogEvent[] = [];
  // Walk back per-second style: produce ~limit*3 events then filter
  const target = limit * 3;
  for (let i = 0; i < target; i++) {
    const t = new Date(now.getTime() - i * 1000 - Math.floor(Math.random() * 950));
    const seed = hashSeed("log", t.toISOString(), i);
    const rand = mulberry32(seed);
    const r = rand();
    const level: Level =
      r < 0.18
        ? "debug"
        : r < 0.78
          ? "info"
          : r < 0.92
            ? "warn"
            : r < 0.995
              ? "error"
              : "fatal";
    const service = pick(rand, SERVICES);
    const host = pick(rand, HOSTS);
    const tpls = templatesForLevel(level);
    const message = fillTemplate(rand, pick(rand, tpls));
    const anomalyScore =
      level === "fatal"
        ? randFloat(rand, 0.7, 0.98)
        : level === "error"
          ? randFloat(rand, 0.35, 0.85)
          : level === "warn"
            ? randFloat(rand, 0.15, 0.5)
            : randFloat(rand, 0.0, 0.25);

    const evt: LogEvent = {
      id: `log_${seed.toString(16)}_${i}`,
      timestamp: t.toISOString(),
      level,
      service,
      host,
      traceId: uuid(rand),
      message,
      anomalyScore: Number(anomalyScore.toFixed(3)),
    };

    // Apply filters
    if (filters.level && filters.level !== "all" && evt.level !== filters.level) continue;
    if (filters.service && evt.service !== filters.service) continue;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${evt.message} ${evt.service} ${evt.host} ${evt.traceId}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    out.push(evt);
    if (out.length >= limit) break;
  }
  return out;
}

export interface Anomaly {
  id: string;
  detectedAt: string;
  service: string;
  signature: string;
  severity: "low" | "medium" | "high" | "critical";
  anomalyScore: number;
  affectedRequests: number;
  status: "open" | "acknowledged" | "resolved";
  algorithm: string;
}

const ANOMALY_ALGOS = ["Isolation Forest", "BERT semantic delta", "Prophet residual", "K-Means cluster shift"];

export function listAnomalies(): Anomaly[] {
  const now = nowFloorMinute();
  return ANOMALY_SIGNATURES.map((sig, i) => {
    const seed = hashSeed("anomaly", sig, i);
    const rand = mulberry32(seed);
    const detectedAt = new Date(now.getTime() - randInt(rand, 5, 22 * 60) * 60 * 1000);
    const score = Number(randFloat(rand, 0.55, 0.97).toFixed(3));
    const severity: Anomaly["severity"] =
      score > 0.9 ? "critical" : score > 0.78 ? "high" : score > 0.65 ? "medium" : "low";
    const status: Anomaly["status"] =
      i % 5 === 0 ? "resolved" : i % 4 === 0 ? "acknowledged" : "open";
    return {
      id: `anom_${seed.toString(16)}`,
      detectedAt: detectedAt.toISOString(),
      service: pick(rand, SERVICES),
      signature: sig,
      severity,
      anomalyScore: score,
      affectedRequests: randInt(rand, 18, 28000),
      status,
      algorithm: pick(rand, ANOMALY_ALGOS),
    };
  });
}

export function getAnomalyById(id: string): Anomaly | undefined {
  return listAnomalies().find((a) => a.id === id);
}

export function buildAnomalyDetail(id: string):
  | {
      anomaly: Anomaly;
      sampleLogs: LogEvent[];
      timeline: AnomalyTrendPoint[];
    }
  | null {
  const anomaly = getAnomalyById(id);
  if (!anomaly) return null;
  const seed = hashSeed("anomaly-detail", id);
  const rand = mulberry32(seed);
  const sampleLogs: LogEvent[] = [];
  const baseTime = new Date(anomaly.detectedAt);
  const errorTpls = ERROR_TEMPLATES;
  const warnTpls = WARN_TEMPLATES;
  for (let i = 0; i < 8; i++) {
    const t = new Date(baseTime.getTime() - i * randInt(rand, 10_000, 90_000));
    const useError = i < 5;
    const tpl = pick(rand, useError ? errorTpls : warnTpls);
    const evt: LogEvent = {
      id: `log_anom_${id}_${i}`,
      timestamp: t.toISOString(),
      level: useError ? "error" : "warn",
      service: anomaly.service,
      host: pick(rand, HOSTS),
      traceId: uuid(rand),
      message: fillTemplate(rand, tpl),
      anomalyScore: Number(randFloat(rand, 0.5, 0.95).toFixed(3)),
    };
    sampleLogs.push(evt);
  }

  // Local 30-min-step timeline around the anomaly with a clear spike
  const timeline: AnomalyTrendPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const t = new Date(baseTime.getTime() - i * 15 * 60 * 1000);
    const localRand = mulberry32(hashSeed("anom-timeline", id, i));
    const baseline = 0.2 + 0.04 * Math.sin(i / 4);
    let score = baseline + randFloat(localRand, -0.04, 0.05);
    if (i <= 4) score = anomaly.anomalyScore - i * 0.06;
    timeline.push({
      timestamp: t.toISOString(),
      score: Number(Math.max(0.05, score).toFixed(3)),
      upperBound: Number((baseline + 0.18).toFixed(3)),
      lowerBound: Number(Math.max(0, baseline - 0.12).toFixed(3)),
      threshold: 0.5,
    });
  }

  return { anomaly, sampleLogs, timeline };
}

export interface LogPattern {
  id: string;
  template: string;
  cluster: string;
  occurrences: number;
  services: string[];
  firstSeen: string;
  lastSeen: string;
  trendPct: number;
  confidence: number;
}

export function listPatterns(): LogPattern[] {
  const now = nowFloorMinute();
  return PATTERN_TEMPLATES.map((tpl, i) => {
    const seed = hashSeed("pattern", tpl);
    const rand = mulberry32(seed);
    const services: string[] = [];
    const n = randInt(rand, 1, 4);
    const pool = [...SERVICES];
    for (let k = 0; k < n; k++) {
      const idx = Math.floor(rand() * pool.length);
      services.push(pool.splice(idx, 1)[0]!);
    }
    return {
      id: `pat_${seed.toString(16)}`,
      template: tpl,
      cluster: CLUSTER_NAMES[i % CLUSTER_NAMES.length]!,
      occurrences: randInt(rand, 240, 184_000),
      services,
      firstSeen: new Date(now.getTime() - randInt(rand, 12, 90) * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(now.getTime() - randInt(rand, 1, 30) * 60 * 1000).toISOString(),
      trendPct: Number(randFloat(rand, -45, 220).toFixed(1)),
      confidence: Number(randFloat(rand, 0.71, 0.99).toFixed(3)),
    };
  });
}

export interface Alert {
  id: string;
  triggeredAt: string;
  title: string;
  service: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  affectedUsers: number;
  suggestedAction: string;
  confidence: number;
}

export function listAlerts(): Alert[] {
  const now = nowFloorMinute();
  return ALERT_TITLES.map((title, i) => {
    const seed = hashSeed("alert", title);
    const rand = mulberry32(seed);
    const sev: Alert["severity"] =
      i === 0 || i === 3 ? "critical" : i % 3 === 0 ? "high" : i % 2 === 0 ? "medium" : "low";
    const status: Alert["status"] =
      i % 7 === 0 ? "resolved" : i % 4 === 1 ? "acknowledged" : "active";
    return {
      id: `alr_${seed.toString(16)}`,
      triggeredAt: new Date(now.getTime() - randInt(rand, 2, 18 * 60) * 60 * 1000).toISOString(),
      title,
      service: pick(rand, SERVICES),
      severity: sev,
      status,
      affectedUsers: randInt(rand, 12, 24_000),
      suggestedAction: pick(rand, RECOMMENDED_ACTIONS),
      confidence: Number(randFloat(rand, 0.68, 0.97).toFixed(3)),
    };
  });
}

export function getAlertById(id: string): Alert | undefined {
  return listAlerts().find((a) => a.id === id);
}

export interface RootCauseHop {
  service: string;
  component: string;
  evidence: string;
  timestamp: string;
}

export function buildAlertDetail(id: string):
  | {
      alert: Alert;
      rootCause: RootCauseHop[];
      relatedLogs: LogEvent[];
    }
  | null {
  const alert = getAlertById(id);
  if (!alert) return null;
  const seed = hashSeed("alert-detail", id);
  const rand = mulberry32(seed);
  const triggered = new Date(alert.triggeredAt);
  const hops = randInt(rand, 3, 5);
  const rootCause: RootCauseHop[] = [];
  let prevSvc = alert.service;
  for (let i = 0; i < hops; i++) {
    const t = new Date(triggered.getTime() - (hops - i) * randInt(rand, 30_000, 120_000));
    const svc = i === 0 ? prevSvc : pick(rand, SERVICES);
    prevSvc = svc;
    rootCause.push({
      service: svc,
      component: pick(rand, ROOT_CAUSE_COMPONENTS),
      evidence: pick(rand, [
        "Latency p95 jumped 4.1× over baseline window",
        "Error rate exceeded 2.5σ confidence band",
        "Pattern cluster matches known incident INC-2034 (BERT cosine 0.91)",
        "Correlation 0.87 with downstream service degradation",
        "Connection pool active reached 96% of max",
        "Garbage collection pause time tripled",
      ]),
      timestamp: t.toISOString(),
    });
  }

  const relatedLogs: LogEvent[] = [];
  for (let i = 0; i < 6; i++) {
    const t = new Date(triggered.getTime() - i * randInt(rand, 8_000, 60_000));
    const tpl = pick(rand, ERROR_TEMPLATES);
    relatedLogs.push({
      id: `log_alert_${id}_${i}`,
      timestamp: t.toISOString(),
      level: i === 0 ? "fatal" : "error",
      service: alert.service,
      host: pick(rand, HOSTS),
      traceId: uuid(rand),
      message: fillTemplate(rand, tpl),
      anomalyScore: Number(randFloat(rand, 0.6, 0.95).toFixed(3)),
    });
  }

  return { alert, rootCause, relatedLogs };
}

export interface ForecastPoint {
  timestamp: string;
  actual: number | null;
  forecast: number;
  upperBound: number;
  lowerBound: number;
}

export interface Prediction {
  id: string;
  service: string;
  component: string;
  predictedFailureAt: string;
  leadTimeMinutes: number;
  confidence: number;
  signal: string;
  recommendedAction: string;
  forecast: ForecastPoint[];
}

export function listPredictions(): Prediction[] {
  const now = nowFloorMinute();
  return PREDICTION_SIGNALS.map((signal, i) => {
    const seed = hashSeed("prediction", signal);
    const rand = mulberry32(seed);
    const lead = randInt(rand, 15, 180);
    const failureAt = new Date(now.getTime() + lead * 60 * 1000);
    const service = pick(rand, SERVICES);
    const component = pick(rand, ROOT_CAUSE_COMPONENTS);

    // Forecast: 24 historical + 12 future points (5min step)
    const forecast: ForecastPoint[] = [];
    const stepMs = 5 * 60 * 1000;
    const start = new Date(now.getTime() - 24 * stepMs);
    let actualVal = randFloat(rand, 30, 50);
    for (let k = 0; k < 36; k++) {
      const t = new Date(start.getTime() + k * stepMs);
      const slope = 0.9 + i * 0.15;
      const trend = actualVal + (k - 24) * slope;
      const noise = randFloat(rand, -2, 2);
      const isHistorical = k <= 24;
      const f = trend + noise;
      const up = f + 4 + Math.abs(k - 24) * 0.6;
      const low = f - 4 - Math.abs(k - 24) * 0.6;
      forecast.push({
        timestamp: t.toISOString(),
        actual: isHistorical
          ? Number((actualVal + (rand() - 0.5) * 3 + k * 0.4).toFixed(2))
          : null,
        forecast: Number(f.toFixed(2)),
        upperBound: Number(up.toFixed(2)),
        lowerBound: Number(low.toFixed(2)),
      });
      if (isHistorical) actualVal += randFloat(rand, -0.3, 0.7);
    }

    return {
      id: `pred_${seed.toString(16)}`,
      service,
      component,
      predictedFailureAt: failureAt.toISOString(),
      leadTimeMinutes: lead,
      confidence: Number(randFloat(rand, 0.74, 0.96).toFixed(3)),
      signal,
      recommendedAction: pick(rand, RECOMMENDED_ACTIONS),
      forecast,
    };
  });
}

export interface Service {
  id: string;
  name: string;
  environment: string;
  status: "healthy" | "degraded" | "down";
  instances: number;
  errorRate: number;
  p95LatencyMs: number;
  logsPerMinute: number;
  openAlerts: number;
}

export function listServices(): Service[] {
  return SERVICES.map((name, i) => {
    const seed = hashSeed("service", name);
    const rand = mulberry32(seed);
    const status: Service["status"] =
      i === 2 ? "down" : i === 1 || i === 7 ? "degraded" : "healthy";
    return {
      id: `svc_${seed.toString(16)}`,
      name,
      environment: pick(rand, ENVIRONMENTS),
      status,
      instances: randInt(rand, 3, 24),
      errorRate: Number(
        (status === "down"
          ? randFloat(rand, 12, 28)
          : status === "degraded"
            ? randFloat(rand, 2.5, 8)
            : randFloat(rand, 0.05, 1.4)
        ).toFixed(2),
      ),
      p95LatencyMs: Number(
        (status === "down"
          ? randFloat(rand, 1500, 3800)
          : status === "degraded"
            ? randFloat(rand, 600, 1400)
            : randFloat(rand, 80, 380)
        ).toFixed(0),
      ),
      logsPerMinute: randInt(rand, 1200, 24_000),
      openAlerts:
        status === "down" ? randInt(rand, 3, 6) : status === "degraded" ? randInt(rand, 1, 3) : randInt(rand, 0, 1),
    };
  });
}
