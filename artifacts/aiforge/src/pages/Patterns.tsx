import { CSVLink } from "react-csv";
import { Download, Layers, TrendingDown, TrendingUp } from "lucide-react";
import { useListPatterns } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatCompact, formatRelative } from "@/lib/format";

export default function Patterns() {
  const { data, isLoading } = useListPatterns();

  return (
    <DashboardLayout
      title="Discovered Log Patterns"
      subtitle="K-Means clustering + BERT embeddings · automatic template extraction"
      actions={
        <CSVLink data={data ?? []} filename="patterns.csv">
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </CSVLink>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data ?? []).map((p) => (
            <Card key={p.id} className="shadcn-card hover-elevate">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px]"
                    >
                      {p.cluster}
                    </Badge>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-medium ${p.trendPct >= 0 ? "text-red-500" : "text-emerald-500"}`}
                  >
                    {p.trendPct >= 0 ? (
                      <TrendingUp className="size-3.5" />
                    ) : (
                      <TrendingDown className="size-3.5" />
                    )}
                    {Math.abs(p.trendPct).toFixed(1)}%
                  </div>
                </div>

                <div className="font-mono text-xs leading-relaxed bg-muted/50 border border-border rounded p-3 break-words">
                  {p.template}
                </div>

                <div className="flex flex-wrap gap-1">
                  {p.services.slice(0, 5).map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="font-mono text-[10px]"
                    >
                      {s}
                    </Badge>
                  ))}
                  {p.services.length > 5 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{p.services.length - 5}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Occurrences
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatCompact(p.occurrences)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      First seen
                    </div>
                    <div className="text-sm font-semibold">
                      {formatRelative(p.firstSeen)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Last seen
                    </div>
                    <div className="text-sm font-semibold">
                      {formatRelative(p.lastSeen)}
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Cluster confidence</span>
                    <span className="tabular-nums">
                      {(p.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={p.confidence * 100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
