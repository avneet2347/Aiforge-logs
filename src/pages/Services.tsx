import { useState } from "react";
import { useListServices } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SplitRefreshButton, DarkModeToggle, ExportPdfButton, LastRefreshed, CHART_COLORS } from "@/components/common/Controls";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, Activity, AlertTriangle, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ServicesPage() {
  const listQuery = useListServices();
  const services = listQuery.data || [];
  const loading = listQuery.isLoading || listQuery.isFetching;
  
  const [search, setSearch] = useState("");

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.environment.toLowerCase().includes(search.toLowerCase()));

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    if (status === 'degraded') return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  };

  const getStatusIconColor = (status: string) => {
    if (status === 'healthy') return "bg-green-500";
    if (status === 'degraded') return "bg-yellow-500";
    return "bg-red-500 animate-pulse";
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="pt-2">
              <h1 className="font-bold text-[32px]">Service Health</h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">Global topology and real-time operational metrics</p>
              <LastRefreshed updatedAt={listQuery.dataUpdatedAt} />
            </div>
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <SplitRefreshButton loading={loading} />
              <ExportPdfButton loading={loading} />
              <DarkModeToggle />
            </div>
          </div>

          <div className="mb-6 max-w-sm relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Filter services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              [...Array(8)].map((_, i) => <Skeleton key={i} className="h-[220px] w-full rounded-xl" />)
            ) : filtered.map(svc => (
              <Card key={svc.id} className={`overflow-hidden border-t-4`} style={{ borderTopColor: svc.status === 'down' ? CHART_COLORS.red : svc.status === 'degraded' ? '#f59e0b' : CHART_COLORS.green }}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg leading-none mb-1 flex items-center gap-2">
                        {svc.name}
                      </h3>
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">{svc.environment}</Badge>
                    </div>
                    <div className={`px-2 py-1 rounded-md border flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest ${getStatusColor(svc.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusIconColor(svc.status)}`} />
                      {svc.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6">
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider flex items-center gap-1 mb-1">
                        <Cpu className="w-3 h-3" /> Instances
                      </div>
                      <div className="font-mono text-base">{svc.instances}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider flex items-center gap-1 mb-1">
                        <Activity className="w-3 h-3" /> Error Rate
                      </div>
                      <div className={`font-mono text-base ${svc.errorRate > 5 ? 'text-red-500 font-bold' : ''}`}>
                        {svc.errorRate.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider flex items-center gap-1 mb-1">
                        <Activity className="w-3 h-3" /> p95 Latency
                      </div>
                      <div className="font-mono text-base">{svc.p95LatencyMs}ms</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3" /> Open Alerts
                      </div>
                      <div className={`font-mono text-base ${svc.openAlerts > 0 ? 'text-orange-500 font-bold' : ''}`}>
                        {svc.openAlerts}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!loading && filtered.length === 0 && (
              <div className="col-span-full py-12 text-center font-mono text-muted-foreground">No services matched query.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}