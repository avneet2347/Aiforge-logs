import { useState } from "react";
import { useListAlerts, useGetAlert } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SplitRefreshButton, DarkModeToggle, ExportPdfButton, LastRefreshed } from "@/components/common/Controls";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Search, GitMerge, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AlertsPage() {
  const listQuery = useListAlerts();
  const alerts = listQuery.data || [];
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const detailQuery = useGetAlert(selectedId!, { query: { enabled: !!selectedId } });

  const loading = listQuery.isLoading || listQuery.isFetching;

  const filteredAlerts = alerts.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="pt-2">
              <h1 className="font-bold text-[32px]">Intelligent Alerts</h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">Correlated incidents with automated root-cause analysis</p>
              <LastRefreshed updatedAt={listQuery.dataUpdatedAt} />
            </div>
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <SplitRefreshButton loading={loading} />
              <ExportPdfButton loading={loading} />
              <DarkModeToggle />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)
            ) : filteredAlerts.map(alert => (
              <Card key={alert.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedId(alert.id)}>
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="font-mono text-[10px]">{alert.service}</Badge>
                    <Badge className={`uppercase text-[10px] ${alert.severity === 'critical' ? 'bg-red-500 hover:bg-red-600' : alert.severity === 'high' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3 leading-tight">{alert.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground font-mono mb-4">
                    <span>{new Date(alert.triggeredAt).toLocaleTimeString()}</span>
                    <span>{alert.status}</span>
                  </div>
                  <div className="text-sm bg-muted/30 p-2 rounded border font-sans text-foreground/80">
                    <span className="font-semibold block mb-1">AI Suggestion:</span>
                    {alert.suggestedAction}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-mono">No alerts found.</div>
          )}

        </div>
      </div>

      <Drawer open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DrawerContent className="max-h-[95vh]">
          <div className="mx-auto w-full max-w-6xl overflow-hidden flex flex-col h-[90vh]">
            <DrawerHeader className="border-b shrink-0 flex items-start justify-between pb-4">
              <div>
                <DrawerTitle className="text-xl flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" /> Incident Analysis
                </DrawerTitle>
                <DrawerDescription className="mt-1 font-mono text-xs">
                  {detailQuery.data?.alert.title}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="p-6 overflow-y-auto flex-1 bg-muted/10">
              {detailQuery.isLoading || detailQuery.isFetching ? (
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : detailQuery.data ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <GitMerge className="w-4 h-4" /> Root Cause Analysis Chain
                    </h3>
                    <div className="space-y-3">
                      {detailQuery.data.rootCause.map((hop, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                            {i !== detailQuery.data.rootCause.length - 1 && <div className="w-px h-16 bg-border" />}
                          </div>
                          <Card className="flex-1">
                            <CardContent className="p-4 flex gap-4 items-center">
                              <div className="w-[120px] shrink-0 font-mono text-xs text-muted-foreground">
                                {new Date(hop.timestamp).toLocaleTimeString()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-[10px] bg-background">{hop.service}</Badge>
                                  <span className="font-mono text-xs text-muted-foreground">:: {hop.component}</span>
                                </div>
                                <div className="font-mono text-sm">{hop.evidence}</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Related Telemetry Events</h3>
                    <div className="rounded-md border bg-card overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead className="w-[100px]">Level</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailQuery.data.relatedLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-mono text-[11px] py-2">{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                              <TableCell className="py-2">
                                <Badge variant="outline" className={`text-[10px] uppercase ${log.level === 'error' || log.level === 'fatal' ? 'border-destructive text-destructive' : ''}`}>{log.level}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-[11px] py-2 break-all">{log.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
}