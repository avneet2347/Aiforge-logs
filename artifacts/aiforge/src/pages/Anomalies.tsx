import { useState } from "react";
import { CSVLink } from "react-csv";
import { Activity, Download } from "lucide-react";
import { useListAnomalies } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber, formatRelative, severityColor, statusColor } from "@/lib/format";

export default function Anomalies() {
  const { data, isLoading } = useListAnomalies();
  const [sevFilter, setSevFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (data ?? []).filter((a) => {
    if (sevFilter !== "all" && a.severity !== sevFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <DashboardLayout
      title="Detected Anomalies"
      subtitle="Isolation Forest + density-based scoring across all services"
      actions={
        <CSVLink data={filtered} filename="anomalies.csv">
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </CSVLink>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          {
            label: "Total open",
            count: (data ?? []).filter((a) => a.status === "open").length,
            tone: "red" as const,
          },
          {
            label: "Critical",
            count: (data ?? []).filter((a) => a.severity === "critical").length,
            tone: "red" as const,
          },
          {
            label: "Acknowledged",
            count: (data ?? []).filter((a) => a.status === "acknowledged")
              .length,
            tone: "amber" as const,
          },
          {
            label: "Resolved · 24h",
            count: (data ?? []).filter((a) => a.status === "resolved").length,
            tone: "emerald" as const,
          },
        ].map((s) => (
          <Card key={s.label} className="shadcn-card">
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {s.count}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadcn-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Activity className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Anomaly stream</h3>
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {data?.length ?? 0}
            </span>
            <div className="ml-auto flex gap-2">
              <Select value={sevFilter} onValueChange={setSevFilter}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Detected</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Affected</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id} className="hover-elevate">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelative(a.detectedAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {a.service}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm truncate">{a.signature}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {a.algorithm}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-mono text-xs">
                        {a.anomalyScore.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs">
                        {formatNumber(a.affectedRequests)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${severityColor(a.severity)}`}
                        >
                          {a.severity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${statusColor(a.status)}`}
                        >
                          {a.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
