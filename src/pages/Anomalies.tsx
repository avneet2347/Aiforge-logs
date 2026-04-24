import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListAnomalies, useGetAnomaly } from "@workspace/api-client-react";
import {
  flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable, type ColumnDef, type SortingState
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SplitRefreshButton, DarkModeToggle, ExportPdfButton, LastRefreshed } from "@/components/common/Controls";
import { X, Search } from "lucide-react";
import type { Anomaly } from "@workspace/api-client-react/src/generated/api.schemas";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export default function AnomaliesPage() {
  const queryClient = useQueryClient();
  const listQuery = useListAnomalies();
  const anomalies = listQuery.data || [];
  
  const [sorting, setSorting] = useState<SortingState>([{ id: "detectedAt", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);

  const detailQuery = useGetAnomaly(selectedAnomalyId!, { query: { enabled: !!selectedAnomalyId } });

  const columns: ColumnDef<Anomaly>[] = [
    {
      accessorKey: "detectedAt",
      header: "Detected",
      cell: ({ row }) => <span className="font-mono text-[13px]">{new Date(row.original.detectedAt).toLocaleString()}</span>,
    },
    {
      accessorKey: "service",
      header: "Service",
      cell: ({ row }) => <span className="font-medium">{row.original.service}</span>,
    },
    {
      accessorKey: "signature",
      header: "Signature",
      cell: ({ row }) => <span className="font-mono text-[13px] truncate max-w-[300px] inline-block">{row.original.signature}</span>,
    },
    {
      accessorKey: "anomalyScore",
      header: "Score",
      cell: ({ row }) => <span className="font-mono">{row.original.anomalyScore.toFixed(3)}</span>,
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const sev = row.original.severity;
        const colorMap: Record<string, string> = {
          low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return <Badge className={`${colorMap[sev] || ""} font-mono uppercase tracking-wider text-[10px]`}>{sev}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return <Badge variant={st === "open" ? "default" : "secondary"} className="uppercase tracking-wider text-[10px]">{st}</Badge>;
      },
    }
  ];

  const table = useReactTable({
    data: anomalies,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const loading = listQuery.isLoading || listQuery.isFetching;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="pt-2">
              <h1 className="font-bold text-[32px]">Isolation Forest Anomalies</h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">Unsupervised log sequence anomalies detected in real-time</p>
              <LastRefreshed updatedAt={listQuery.dataUpdatedAt} />
            </div>
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <SplitRefreshButton loading={loading} />
              <ExportPdfButton loading={loading} />
              <DarkModeToggle />
            </div>
          </div>

          <Card>
            <CardHeader className="px-4 pt-4 pb-2 border-b">
              <div className="flex items-center gap-2 max-w-md relative">
                <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
                <Input
                  placeholder="Filter signature, service, severity..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 font-mono text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full" />
                  {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader className="bg-muted/50">
                      {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                          {hg.headers.map((h) => (
                            <TableHead key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer select-none">
                              <div className="flex items-center gap-2">
                                {flexRender(h.column.columnDef.header, h.getContext())}
                                {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? null}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow 
                            key={row.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedAnomalyId(row.original.id)}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="py-3">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="h-24 text-center font-mono text-sm">
                            No anomalies found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-xs text-muted-foreground font-mono">
                      Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                      {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{" "}
                      of {table.getFilteredRowModel().rows.length} rows
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</Button>
                      <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer open={!!selectedAnomalyId} onOpenChange={(open) => !open && setSelectedAnomalyId(null)}>
        <DrawerContent className="max-h-[90vh]">
          <div className="mx-auto w-full max-w-6xl overflow-hidden flex flex-col h-[85vh]">
            <DrawerHeader className="border-b shrink-0 flex items-start justify-between pb-4">
              <div>
                <DrawerTitle className="text-xl flex items-center gap-3">
                  Anomaly Investigation
                  {detailQuery.data?.anomaly && (
                    <Badge variant={detailQuery.data.anomaly.status === "open" ? "default" : "secondary"}>
                      {detailQuery.data.anomaly.status}
                    </Badge>
                  )}
                </DrawerTitle>
                <DrawerDescription className="mt-1 font-mono text-xs">
                  ID: {selectedAnomalyId} | Algorithm: {detailQuery.data?.anomaly?.algorithm}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {detailQuery.isLoading || detailQuery.isFetching ? (
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : detailQuery.data ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Service</span>
                        <span className="font-mono font-bold text-lg">{detailQuery.data.anomaly.service}</span>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</span>
                        <span className="font-mono font-bold text-lg text-primary">{detailQuery.data.anomaly.anomalyScore.toFixed(4)}</span>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Severity</span>
                        <span className="font-mono font-bold text-lg uppercase">{detailQuery.data.anomaly.severity}</span>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Affected Req</span>
                        <span className="font-mono font-bold text-lg">{detailQuery.data.anomaly.affectedRequests}</span>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="py-3 px-4 border-b bg-muted/30">
                      <CardTitle className="text-sm font-medium">Anomaly Score Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%" debounce={0}>
                          <LineChart data={detailQuery.data.timeline}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} tick={{fontSize: 10}} />
                            <YAxis tick={{fontSize: 10}} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                            <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="threshold" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sample Logs in Window</h3>
                    <div className="rounded-md border bg-card">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead className="w-[100px]">Level</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailQuery.data.sampleLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-mono text-[11px] py-2">{new Date(log.timestamp).toISOString()}</TableCell>
                              <TableCell className="py-2">
                                <Badge variant="outline" className={`text-[10px] uppercase ${log.level === 'error' ? 'border-destructive text-destructive' : ''}`}>{log.level}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-[11px] py-2 break-all">{log.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
}
