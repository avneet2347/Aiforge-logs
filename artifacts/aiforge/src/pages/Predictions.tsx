import { CSVLink } from "react-csv";
import { Download, Sparkles, TrendingUp, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useListPredictions } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime, formatDateTime } from "@/lib/format";

export default function Predictions() {
  const { data, isLoading } = useListPredictions();

  return (
    <DashboardLayout
      title="Predictive Failure Detection"
      subtitle="Prophet time-series forecasting · early-warning signals"
      actions={
        <CSVLink
          data={(data ?? []).map((p) => ({
            id: p.id,
            service: p.service,
            component: p.component,
            predictedFailureAt: p.predictedFailureAt,
            leadTimeMinutes: p.leadTimeMinutes,
            confidence: p.confidence,
            signal: p.signal,
          }))}
          filename="predictions.csv"
        >
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </CSVLink>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(data ?? []).map((p) => (
            <Card key={p.id} className="shadcn-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-amber-500" />
                      <h3 className="text-sm font-semibold">
                        <span className="font-mono">{p.service}</span>
                        <span className="text-muted-foreground"> · </span>
                        {p.component}
                      </h3>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {p.signal}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    <Sparkles className="size-3 mr-1" />
                    {(p.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Predicted failure
                    </div>
                    <div className="text-sm font-semibold mt-0.5">
                      {formatDateTime(p.predictedFailureAt)}
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Lead time
                    </div>
                    <div className="text-sm font-semibold mt-0.5 flex items-center gap-1">
                      <TrendingUp className="size-3.5 text-emerald-500" />
                      {p.leadTimeMinutes} min advance
                    </div>
                  </div>
                </div>

                <div style={{ height: 160 }}>
                  <ResponsiveContainer>
                    <AreaChart data={p.forecast}>
                      <defs>
                        <linearGradient
                          id={`grad-fc-${p.id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--chart-2))"
                            stopOpacity={0.3}
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
                        fill={`url(#grad-fc-${p.id})`}
                       isAnimationActive={false} />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                       isAnimationActive={false} />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                       isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-xs bg-muted/40 border border-border rounded p-2.5 mt-3">
                  <span className="font-medium text-primary">Recommended:</span>{" "}
                  {p.recommendedAction}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
