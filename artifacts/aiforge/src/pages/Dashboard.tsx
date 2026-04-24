import {
  Activity,
  AlertOctagon,
  Bell,
  Cpu,
  Database,
  Gauge,
  Server,
  Sparkles,
  Timer,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetDashboardSummary,
  useGetLogVolumeTimeseries,
  useGetAnomalyTrend,
  useGetMttdTrend,
  useGetSeverityDistribution,
  useGetTopServicesByErrors,
  useGetIngestThroughput,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  formatCompact,
  formatNumber,
  formatPct,
  formatTime,
} from "@/lib/format";

const SEV_COLORS: Record<string, string> = {
  debug: "hsl(var(--chart-3))",
  info: "hsl(var(--chart-1))",
  warn: "hsl(var(--chart-2))",
  error: "hsl(var(--chart-4))",
  fatal: "hsl(var(--chart-5))",
};

export default function Dashboard() {
  const summary = useGetDashboardSummary();
  const logVolume = useGetLogVolumeTimeseries({ window: "24h" });
  const anomalyTrend = useGetAnomalyTrend();
  const mttd = useGetMttdTrend();
  const severity = useGetSeverityDistribution();
  const topServices = useGetTopServicesByErrors();
  const throughput = useGetIngestThroughput();

  const s = summary.data;

  return (
    <DashboardLayout
      title="Operational Intelligence Overview"
      subtitle="Real-time observability across distributed services"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Logs ingested · 24h"
          value={s ? formatCompact(s.logsIngested24h) : "—"}
          hint={s ? `${formatNumber(s.logsPerSecond)} events/sec` : undefined}
          icon={Database}
          accent="primary"
        />
        <StatCard
          label="Anomalies · 24h"
          value={s ? formatNumber(s.anomaliesDetected24h) : "—"}
          hint="Isolation Forest scoring"
          icon={Activity}
          accent="violet"
        />
        <StatCard
          label="Active alerts"
          value={s ? formatNumber(s.activeAlerts) : "—"}
          hint={s ? `${s.criticalAlerts} critical` : undefined}
          icon={Bell}
          accent={s && s.criticalAlerts > 0 ? "red" : "amber"}
        />
        <StatCard
          label="Service health"
          value={s ? `${s.servicesHealthy}/${s.servicesMonitored}` : "—"}
          hint={s ? `${s.servicesDegraded} degraded · ${s.servicesDown} down` : undefined}
          icon={Server}
          accent="emerald"
        />
        <StatCard
          label="Mean time to detect"
          value={s ? `${s.mttdMinutes.toFixed(1)} min` : "—"}
          trend={
            s
              ? {
                  value: `${s.mttdReductionPct}% faster vs baseline`,
                  direction: "down",
                  positive: true,
                }
              : undefined
          }
          icon={Timer}
          accent="emerald"
        />
        <StatCard
          label="False positive rate"
          value={s ? formatPct(s.falsePositiveRate) : "—"}
          trend={
            s
              ? {
                  value: `${s.falsePositiveReductionPct}% reduction`,
                  direction: "down",
                  positive: true,
                }
              : undefined
          }
          icon={TrendingDown}
          accent="emerald"
        />
        <StatCard
          label="Patterns discovered"
          value={s ? formatNumber(s.patternsDiscovered) : "—"}
          hint="K-Means + BERT clustering"
          icon={Sparkles}
          accent="primary"
        />
        <StatCard
          label="Eng hours saved · weekly"
          value={s ? `${s.engineerHoursSavedWeekly}h` : "—"}
          hint={s ? `${s.predictiveIssuesIdentified} predicted issues` : undefined}
          icon={Users}
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Log volume by severity · 24h rolling"
            subtitle="Stacked area · ingestion across all sources"
            loading={logVolume.isLoading}
            csvData={logVolume.data ?? []}
            csvFilename="log-volume-24h.csv"
            height={300}
          >
            <ResponsiveContainer>
              <AreaChart data={logVolume.data ?? []}>
                <defs>
                  {(["debug", "info", "warn", "error", "fatal"] as const).map(
                    (k) => (
                      <linearGradient
                        key={k}
                        id={`grad-${k}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={SEV_COLORS[k]}
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="100%"
                          stopColor={SEV_COLORS[k]}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    ),
                  )}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => formatTime(v as string)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(["debug", "info", "warn", "error", "fatal"] as const).map(
                  (k) => (
                    <Area
                      key={k}
                      type="monotone"
                      dataKey={k}
                      stackId="1"
                      stroke={SEV_COLORS[k]}
                      fill={`url(#grad-${k})`}
                      strokeWidth={1.5}
                      isAnimationActive={false}
                    />
                  ),
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard
          title="Severity distribution"
          subtitle="Last 24h · share of total events"
          loading={severity.isLoading}
          csvData={severity.data ?? []}
          csvFilename="severity-distribution.csv"
          height={300}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={severity.data ?? []}
                dataKey="count"
                nameKey="level"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                isAnimationActive={false}
              >
                {(severity.data ?? []).map((entry) => (
                  <Cell
                    key={entry.level}
                    fill={SEV_COLORS[entry.level] ?? "hsl(var(--chart-1))"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(val: number, _n, ctx) => [
                  `${formatNumber(val)} (${(ctx.payload as { percentage: number }).percentage.toFixed(1)}%)`,
                  ctx.payload?.level,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard
          title="Anomaly score · Isolation Forest"
          subtitle="Score above threshold flags anomalies"
          loading={anomalyTrend.isLoading}
          csvData={anomalyTrend.data ?? []}
          csvFilename="anomaly-trend.csv"
          height={260}
        >
          <ResponsiveContainer>
            <AreaChart data={anomalyTrend.data ?? []}>
              <defs>
                <linearGradient id="grad-anom" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelFormatter={(v) => formatTime(v as string)}
              />
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.08}
               isAnimationActive={false} />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill="hsl(var(--background))"
                fillOpacity={1}
               isAnimationActive={false} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#grad-anom)"
               isAnimationActive={false} />
              <ReferenceLine
                y={0.7}
                stroke="hsl(var(--chart-4))"
                strokeDasharray="4 4"
                label={{
                  value: "threshold",
                  fontSize: 10,
                  fill: "hsl(var(--chart-4))",
                  position: "right",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="MTTD · weekly trend"
          subtitle="vs baseline · target ↓"
          loading={mttd.isLoading}
          csvData={mttd.data ?? []}
          csvFilename="mttd-trend.csv"
          height={260}
        >
          <ResponsiveContainer>
            <LineChart data={mttd.data ?? []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="baselineMinutes"
                name="Baseline"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                dot={false}
                strokeWidth={1.5}
               isAnimationActive={false} />
              <Line
                type="monotone"
                dataKey="mttdMinutes"
                name="AIForge MTTD"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "hsl(var(--chart-1))" }}
               isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Ingest throughput · events/sec"
          subtitle="Pipeline back-pressure indicator"
          loading={throughput.isLoading}
          csvData={throughput.data ?? []}
          csvFilename="throughput.csv"
          height={260}
        >
          <ResponsiveContainer>
            <AreaChart data={throughput.data ?? []}>
              <defs>
                <linearGradient id="grad-tp" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.03}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickFormatter={formatCompact}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelFormatter={(v) => formatTime(v as string)}
              />
              <Area
                type="monotone"
                dataKey="eventsPerSecond"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#grad-tp)"
               isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Top services by errors · 24h"
        subtitle="Ranked by error volume with delta vs prior period"
        loading={topServices.isLoading}
        csvData={topServices.data ?? []}
        csvFilename="top-services.csv"
        height={320}
      >
        <ResponsiveContainer>
          <BarChart
            data={topServices.data ?? []}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickFormatter={formatCompact}
            />
            <YAxis
              type="category"
              dataKey="service"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar
              dataKey="errors"
              name="Errors"
              fill="hsl(var(--chart-4))"
              radius={[0, 4, 4, 0]}
             isAnimationActive={false} />
            <Bar
              dataKey="warnings"
              name="Warnings"
              fill="hsl(var(--chart-2))"
              radius={[0, 4, 4, 0]}
             isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </DashboardLayout>
  );
}
