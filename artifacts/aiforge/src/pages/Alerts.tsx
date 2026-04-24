import { useState } from "react";
import { CSVLink } from "react-csv";
import {
  AlertOctagon,
  ArrowRight,
  Bell,
  CheckCircle2,
  Download,
  Sparkles,
} from "lucide-react";
import { useListAlerts, useGetAlert } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatNumber,
  formatRelative,
  formatDateTime,
  severityColor,
  statusColor,
} from "@/lib/format";

export default function Alerts() {
  const { data, isLoading } = useListAlerts();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <DashboardLayout
      title="Intelligent Alerts"
      subtitle="Severity-ranked · root cause + suggested mitigation"
      actions={
        <CSVLink data={data ?? []} filename="alerts.csv">
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </CSVLink>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((a) => (
            <Card
              key={a.id}
              className="shadcn-card hover-elevate cursor-pointer"
              onClick={() => setOpenId(a.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`size-10 rounded-md flex items-center justify-center shrink-0 ${
                      a.severity === "critical"
                        ? "bg-red-500/15 text-red-500"
                        : a.severity === "high"
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-sky-500/15 text-sky-500"
                    }`}
                  >
                    {a.severity === "critical" ? (
                      <AlertOctagon className="size-5" />
                    ) : (
                      <Bell className="size-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${severityColor(a.severity)}`}
                      >
                        {a.severity}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${statusColor(a.status)}`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-mono">{a.service}</span>
                      <span>{formatRelative(a.triggeredAt)}</span>
                      <span>
                        {formatNumber(a.affectedUsers)} users impacted
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3" />
                        {(a.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="mt-2 text-xs flex items-start gap-2 bg-muted/40 rounded px-2 py-1.5 border border-border">
                      <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      <span>
                        <span className="font-medium">Suggested:</span>{" "}
                        {a.suggestedAction}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDetail id={openId} onClose={() => setOpenId(null)} />
    </DashboardLayout>
  );
}

function AlertDetail({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useGetAlert(id ?? "");

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading || !data ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${severityColor(data.alert.severity)}`}
                >
                  {data.alert.severity}
                </span>
                {data.alert.title}
              </SheetTitle>
              <SheetDescription>
                {data.alert.service} · {formatDateTime(data.alert.triggeredAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-6 space-y-5">
              <section>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Suggested action
                </h4>
                <div className="text-sm bg-emerald-500/5 border border-emerald-500/20 rounded p-3">
                  {data.alert.suggestedAction}
                </div>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Root cause analysis
                </h4>
                <ol className="space-y-2">
                  {data.rootCause.map((hop, i) => (
                    <li
                      key={i}
                      className="flex gap-3 bg-card border border-border rounded p-3"
                    >
                      <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-mono shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          <span className="font-mono">{hop.service}</span>
                          <span className="text-muted-foreground"> · </span>
                          <span>{hop.component}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {hop.evidence}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-1">
                          {formatDateTime(hop.timestamp)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Related logs
                </h4>
                <div className="space-y-1 font-mono text-[11px]">
                  {data.relatedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-2 px-2 py-1 rounded bg-muted/40"
                    >
                      <span className="text-muted-foreground shrink-0">
                        {new Date(log.timestamp).toISOString().slice(11, 19)}
                      </span>
                      <span
                        className={`shrink-0 uppercase ${
                          log.level === "error" || log.level === "fatal"
                            ? "text-red-500"
                            : log.level === "warn"
                              ? "text-amber-500"
                              : "text-sky-500"
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        [{log.service}]
                      </span>
                      <span className="break-words">{log.message}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
