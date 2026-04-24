import { CSVLink } from "react-csv";
import { Download, Server } from "lucide-react";
import { useListServices } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPct, statusColor } from "@/lib/format";

export default function Services() {
  const { data, isLoading } = useListServices();

  return (
    <DashboardLayout
      title="Service Health Map"
      subtitle="All monitored services across environments"
      actions={
        <CSVLink data={data ?? []} filename="services.csv">
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </CSVLink>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((s) => (
            <Card key={s.id} className="shadcn-card hover-elevate">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Server className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold font-mono">
                        {s.name}
                      </h3>
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {s.environment} · {s.instances} instances
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${statusColor(s.status)}`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Metric
                    label="Error rate"
                    value={formatPct(s.errorRate, 2)}
                    danger={s.errorRate > 2}
                  />
                  <Metric
                    label="P95 latency"
                    value={`${s.p95LatencyMs}ms`}
                    danger={s.p95LatencyMs > 800}
                  />
                  <Metric
                    label="Logs/min"
                    value={formatNumber(s.logsPerMinute)}
                  />
                  <Metric
                    label="Open alerts"
                    value={String(s.openAlerts)}
                    danger={s.openAlerts > 0}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    id: {s.id}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function Metric({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-sm font-semibold tabular-nums mt-0.5 ${danger ? "text-red-500" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
