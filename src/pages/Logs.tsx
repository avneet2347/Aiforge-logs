import { useState, useEffect } from "react";
import { useListLogs, useListServices } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SplitRefreshButton, DarkModeToggle, ExportPdfButton, LastRefreshed } from "@/components/common/Controls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TerminalSquare } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { ListLogsLevel } from "@workspace/api-client-react/src/generated/api.schemas";

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  
  const [level, setLevel] = useState<ListLogsLevel | "all">("all");
  const [service, setService] = useState<string>("all");

  const servicesQuery = useListServices();
  const services = servicesQuery.data || [];

  const logsQuery = useListLogs({
    search: debouncedSearch || undefined,
    level: level === "all" ? undefined : level,
    service: service === "all" ? undefined : service,
    limit: 100
  });

  const logs = logsQuery.data || [];
  const loading = logsQuery.isLoading || logsQuery.isFetching;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px] flex flex-col h-screen overflow-hidden">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full">
          
          <div className="shrink-0 mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="pt-2">
              <h1 className="font-bold text-[32px] flex items-center gap-3">
                <TerminalSquare className="w-7 h-7 text-primary" /> Live Log Tail
              </h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">Unified log stream with AI anomaly scoring</p>
              <LastRefreshed updatedAt={logsQuery.dataUpdatedAt} />
            </div>
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <SplitRefreshButton loading={loading} />
              <ExportPdfButton loading={loading} />
              <DarkModeToggle />
            </div>
          </div>

          <div className="shrink-0 mb-4 p-4 bg-card border rounded-lg flex flex-wrap items-end gap-4 shadow-sm">
            <div className="flex-1 min-w-[250px]">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Search Message / Trace ID</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="e.g. timeout, db_conn, or req-..."
                  className="pl-9 font-mono text-sm bg-background"
                />
              </div>
            </div>
            
            <div className="w-[180px]">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Severity Level</label>
              <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                <SelectTrigger className="font-mono text-sm bg-background">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL LEVELS</SelectItem>
                  <SelectItem value="fatal">FATAL</SelectItem>
                  <SelectItem value="error">ERROR</SelectItem>
                  <SelectItem value="warn">WARN</SelectItem>
                  <SelectItem value="info">INFO</SelectItem>
                  <SelectItem value="debug">DEBUG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[200px]">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Service</label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="font-mono text-sm bg-background">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL SERVICES</SelectItem>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 bg-card border rounded-lg overflow-hidden flex flex-col shadow-sm">
            <div className="flex-1 overflow-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[160px] text-xs font-mono">TIMESTAMP</TableHead>
                    <TableHead className="w-[80px] text-xs font-mono">LEVEL</TableHead>
                    <TableHead className="w-[120px] text-xs font-mono">SERVICE</TableHead>
                    <TableHead className="text-xs font-mono">MESSAGE</TableHead>
                    <TableHead className="w-[100px] text-xs font-mono text-right">AI SCORE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <div className="space-y-1 p-2">
                          {[...Array(15)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-sm opacity-50" />)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-mono text-sm">
                        No logs matched your criteria.
                      </TableCell>
                    </TableRow>
                  ) : logs.map(log => {
                    const isHighAnomaly = log.anomalyScore > 0.8;
                    const isError = log.level === 'error' || log.level === 'fatal';
                    return (
                      <TableRow key={log.id} className={`border-b hover:bg-muted/50 ${isHighAnomaly ? 'bg-primary/5 hover:bg-primary/10' : ''}`}>
                        <TableCell className="font-mono text-[11px] py-2 align-top text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 23)}
                        </TableCell>
                        <TableCell className="py-2 align-top">
                          <span className={`font-mono text-[10px] uppercase font-bold ${
                            log.level === 'fatal' ? 'text-purple-500' :
                            log.level === 'error' ? 'text-red-500' :
                            log.level === 'warn' ? 'text-yellow-500' :
                            log.level === 'info' ? 'text-green-500' :
                            'text-gray-500'
                          }`}>
                            {log.level}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] py-2 align-top truncate max-w-[120px]">
                          {log.service}
                        </TableCell>
                        <TableCell className="font-mono text-[12px] py-2 align-top break-all">
                          <div className={isError ? 'text-red-500/90 dark:text-red-400' : 'text-foreground/90'}>
                            {log.message}
                          </div>
                          {log.traceId && (
                            <div className="mt-1 text-[9px] text-muted-foreground">Trace: {log.traceId} | Host: {log.host}</div>
                          )}
                        </TableCell>
                        <TableCell className="py-2 align-top text-right">
                          <Badge variant="outline" className={`font-mono text-[10px] ${isHighAnomaly ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border/50'}`}>
                            {log.anomalyScore.toFixed(2)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="shrink-0 p-2 bg-muted/30 border-t flex justify-between items-center text-xs font-mono text-muted-foreground">
              <span>Showing {logs.length} latest events</span>
              {loading && <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary animate-pulse"/> Tail active</span>}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}