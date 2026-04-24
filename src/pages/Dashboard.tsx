import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetDashboardSummary, useGetLogVolumeTimeseries, useGetAnomalyTrend, useGetSeverityDistribution, useGetTopServicesByErrors, useGetIngestThroughput, useListAlerts } from "@workspace/api-client-react";
import { CSVLink } from "react-csv";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Download, Activity, AlertTriangle, Zap, Server } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SplitRefreshButton, DarkModeToggle, ExportPdfButton, LastRefreshed, DataSourcesBadges, CHART_COLORS, CHART_COLOR_LIST } from "@/components/common/Controls";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  
  const summaryQuery = useGetDashboardSummary();
  const logVolumeQuery = useGetLogVolumeTimeseries({ window: "24h" });
  const anomalyTrendQuery = useGetAnomalyTrend();
  const severityDistQuery = useGetSeverityDistribution();
  const topServicesQuery = useGetTopServicesByErrors();
  const ingestThroughputQuery = useGetIngestThroughput();
  const alertsQuery = useListAlerts();

  const loading = summaryQuery.isLoading || summaryQuery.isFetching || 
    logVolumeQuery.isLoading || logVolumeQuery.isFetching ||
    anomalyTrendQuery.isLoading || anomalyTrendQuery.isFetching ||
    severityDistQuery.isLoading || severityDistQuery.isFetching ||
    topServicesQuery.isLoading || topServicesQuery.isFetching ||
    ingestThroughputQuery.isLoading || ingestThroughputQuery.isFetching ||
    alertsQuery.isLoading || alertsQuery.isFetching;

  const summary = summaryQuery.data;
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "10px 14px", border: "1px solid #e0e0e0", color: "#1a1a1a", fontSize: "13px" }}>
        <div style={{ marginBottom: "6px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
            {entry.color && entry.color !== "#ffffff" && (
              <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
            )}
            <span style={{ color: "#444" }}>{entry.name}</span>
            <span style={{ marginLeft: "auto", fontWeight: 600 }}>
              {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", fontSize: "13px" }}>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="pt-2">
              <h1 className="font-bold text-[32px]">Overview Dashboard</h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">System health, anomaly detection, and active alerts</p>
              <DataSourcesBadges />
              <LastRefreshed updatedAt={summaryQuery.dataUpdatedAt} />
            </div>
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <SplitRefreshButton loading={loading} />
              <ExportPdfButton loading={loading} />
              <DarkModeToggle />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-6">
                {loading || !summary ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Zap className="w-4 h-4" /> Logs Ingested 24h</p>
                    <p className="text-2xl font-bold mt-1 font-mono" style={{ color: CHART_COLORS.blue }}>{new Intl.NumberFormat("en-US", { notation: "compact" }).format(summary.logsIngested24h)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{summary.logsPerSecond.toLocaleString()} events/sec</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                {loading || !summary ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Anomalies 24h</p>
                    <p className="text-2xl font-bold mt-1 font-mono" style={{ color: CHART_COLORS.blue }}>{summary.anomaliesDetected24h}</p>
                    <p className="text-sm text-muted-foreground mt-1">{summary.patternsDiscovered} patterns discovered</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                {loading || !summary ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Active Alerts</p>
                    <p className="text-2xl font-bold mt-1 font-mono flex items-center gap-2" style={{ color: summary.activeAlerts > 0 ? CHART_COLORS.red : CHART_COLORS.green }}>
                      {summary.activeAlerts}
                      {summary.criticalAlerts > 0 && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{summary.criticalAlerts} critical</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                {loading || !summary ? (
                  <><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Server className="w-4 h-4" /> Services Status</p>
                    <p className="text-2xl font-bold mt-1 font-mono" style={{ color: summary.servicesDegraded > 0 || summary.servicesDown > 0 ? CHART_COLORS.red : CHART_COLORS.green }}>
                      {summary.servicesHealthy} / {summary.servicesMonitored}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{summary.servicesDegraded} degraded, {summary.servicesDown} down</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Log Volume (24h)</CardTitle>
                {!loading && logVolumeQuery.data && logVolumeQuery.data.length > 0 && (
                  <CSVLink data={logVolumeQuery.data} filename="log-volume.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                    <Download className="w-3.5 h-3.5" />
                  </CSVLink>
                )}
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="w-full h-[300px]" /> : (
                  <ResponsiveContainer width="100%" height={300} debounce={0}>
                    <AreaChart data={logVolumeQuery.data}>
                      <defs>
                        <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.red} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.red} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                      <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                      <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                      <Legend content={<CustomLegend />} />
                      <Area type="monotone" dataKey="error" stackId="1" stroke={CHART_COLORS.red} fill="url(#colorError)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="warn" stackId="1" stroke="#f59e0b" fill="url(#colorWarn)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="info" stackId="1" stroke={CHART_COLORS.blue} fill="url(#colorInfo)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Anomaly Score Trend</CardTitle>
                {!loading && anomalyTrendQuery.data && anomalyTrendQuery.data.length > 0 && (
                  <CSVLink data={anomalyTrendQuery.data} filename="anomaly-trend.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                    <Download className="w-3.5 h-3.5" />
                  </CSVLink>
                )}
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="w-full h-[300px]" /> : (
                  <ResponsiveContainer width="100%" height={300} debounce={0}>
                    <LineChart data={anomalyTrendQuery.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                      <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} domain={['auto', 'auto']} />
                      <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ stroke: tickColor, strokeDasharray: '3 3' }} />
                      <Legend content={<CustomLegend />} />
                      <Line type="monotone" dataKey="score" name="Score" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
                      <Line type="monotone" dataKey="threshold" name="Threshold" stroke={CHART_COLORS.red} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Severity Distribution</CardTitle>
                {!loading && severityDistQuery.data && severityDistQuery.data.length > 0 && (
                  <CSVLink data={severityDistQuery.data} filename="severity.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                    <Download className="w-3.5 h-3.5" />
                  </CSVLink>
                )}
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="w-full h-[250px]" /> : (
                  <ResponsiveContainer width="100%" height={250} debounce={0}>
                    <PieChart>
                      <Pie data={severityDistQuery.data} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} cornerRadius={2} isAnimationActive={false} stroke="none">
                        {severityDistQuery.data?.map((entry, index) => {
                          let color = CHART_COLORS.blue;
                          if (entry.level === 'error' || entry.level === 'fatal') color = CHART_COLORS.red;
                          if (entry.level === 'warn') color = "#f59e0b";
                          if (entry.level === 'info') color = CHART_COLORS.green;
                          if (entry.level === 'debug') color = CHART_COLORS.purple;
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Ingest Throughput (events/sec)</CardTitle>
                {!loading && ingestThroughputQuery.data && ingestThroughputQuery.data.length > 0 && (
                  <CSVLink data={ingestThroughputQuery.data} filename="throughput.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                    <Download className="w-3.5 h-3.5" />
                  </CSVLink>
                )}
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="w-full h-[250px]" /> : (
                  <ResponsiveContainer width="100%" height={250} debounce={0}>
                    <AreaChart data={ingestThroughputQuery.data}>
                      <defs>
                        <linearGradient id="gradientTp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.5} />
                          <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString([], { minute: '2-digit', second: '2-digit'})} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                      <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                      <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                      <Area type="monotone" dataKey="eventsPerSecond" name="Throughput" fill="url(#gradientTp)" stroke={CHART_COLORS.green} fillOpacity={1} strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
