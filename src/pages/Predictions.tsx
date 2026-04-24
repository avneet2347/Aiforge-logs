import { useListPredictions } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SplitRefreshButton, DarkModeToggle, ExportPdfButton, LastRefreshed, CHART_COLORS } from "@/components/common/Controls";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, ComposedChart } from "recharts";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";

export default function PredictionsPage() {
  const listQuery = useListPredictions();
  const predictions = listQuery.data || [];
  const loading = listQuery.isLoading || listQuery.isFetching;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="bg-popover border border-border rounded-md shadow-md p-3 text-xs font-mono text-popover-foreground">
        <div className="mb-2 font-bold">{new Date(label).toLocaleString()}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-bold">{entry.value?.toFixed(2) ?? 'N/A'}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="pt-2">
              <h1 className="font-bold text-[32px]">Predictive Failures</h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">Prophet time-series forecasting for proactive issue mitigation</p>
              <LastRefreshed updatedAt={listQuery.dataUpdatedAt} />
            </div>
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <SplitRefreshButton loading={loading} />
              <ExportPdfButton loading={loading} />
              <DarkModeToggle />
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-xl" />)
            ) : predictions.map(pred => {
              
              // Prepare data for recharts area bounds
              const chartData = pred.forecast.map(p => ({
                ...p,
                bounds: [p.lowerBound, p.upperBound]
              }));

              return (
                <Card key={pred.id} className="overflow-hidden border-t-4" style={{ borderTopColor: pred.confidence > 0.8 ? CHART_COLORS.red : CHART_COLORS.purple }}>
                  <CardHeader className="bg-muted/10 pb-4 flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-[11px]">{pred.service}</Badge>
                        <span className="text-muted-foreground font-mono text-xs">:: {pred.component}</span>
                      </div>
                      <CardTitle className="text-xl mb-1">{pred.signal}</CardTitle>
                      <CardDescription className="text-foreground/80 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Predicted failure in {pred.leadTimeMinutes} minutes (at {new Date(pred.predictedFailureAt).toLocaleTimeString()})
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none font-mono">
                        {(pred.confidence * 100).toFixed(0)}% CONFIDENCE
                      </Badge>
                      <CSVLink data={chartData} filename={`forecast-${pred.service}.csv`} className="print:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Export CSV">
                        <Download className="w-4 h-4" />
                      </CSVLink>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-3 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" debounce={0}>
                          <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} tick={{fontSize: 11}} opacity={0.5} />
                            <YAxis tick={{fontSize: 11}} opacity={0.5} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ stroke: 'currentColor', strokeDasharray: '3 3', opacity: 0.2 }} />
                            
                            <Area type="monotone" dataKey="bounds" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="none" isAnimationActive={false} />
                            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                            <Line type="stepAfter" dataKey="actual" name="Actual" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} isAnimationActive={false} />
                            
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-lg border flex flex-col justify-center">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Action Required
                        </h4>
                        <p className="text-sm font-medium leading-relaxed">{pred.recommendedAction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {!loading && predictions.length === 0 && (
              <div className="text-center py-20 text-muted-foreground font-mono">No predictive signals currently active. System nominal.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}