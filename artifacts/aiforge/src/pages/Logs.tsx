import { useState } from "react";
import { CSVLink } from "react-csv";
import { Download, FileSearch, Search } from "lucide-react";
import { useListLogs } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  debug: "text-slate-400",
  info: "text-sky-500",
  warn: "text-amber-500",
  error: "text-red-500",
  fatal: "text-red-600 font-bold",
};

export default function Logs() {
  const [level, setLevel] = useState("all");
  const [service, setService] = useState("");
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");

  const { data, isLoading } = useListLogs({
    level: level as
      | "all"
      | "debug"
      | "info"
      | "warn"
      | "error"
      | "fatal",
    service: service || undefined,
    search: search || undefined,
    limit: 200,
  });

  return (
    <DashboardLayout
      title="Interactive Log Explorer"
      subtitle="Stream search across all sources · 200 most recent matches"
      actions={
        <CSVLink data={data ?? []} filename="logs.csv">
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </CSVLink>
      }
    >
      <Card className="shadcn-card mb-4">
        <CardContent className="p-4">
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(draftSearch);
            }}
          >
            <FileSearch className="size-4 text-primary" />
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                placeholder="Search messages, trace IDs, hosts..."
                className="pl-8 h-9 font-mono text-xs"
              />
            </div>
            <Input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Service filter"
              className="h-9 w-44 font-mono text-xs"
            />
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="h-9 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="fatal">Fatal</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" size="sm" className="h-9">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadcn-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-[600px] w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="font-mono text-[11px] leading-relaxed divide-y divide-border">
                {(data ?? []).map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex gap-3 px-4 py-1.5 hover:bg-muted/40",
                      log.anomalyScore > 0.7 &&
                        "bg-red-500/5 border-l-2 border-l-red-500",
                    )}
                  >
                    <span className="text-muted-foreground shrink-0 w-32">
                      {formatDateTime(log.timestamp)}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 w-12 uppercase",
                        LEVEL_COLOR[log.level],
                      )}
                    >
                      {log.level}
                    </span>
                    <span className="text-primary shrink-0 w-32 truncate">
                      {log.service}
                    </span>
                    <span className="text-muted-foreground shrink-0 w-32 truncate">
                      {log.host}
                    </span>
                    <span className="flex-1 break-words">{log.message}</span>
                    {log.anomalyScore > 0.7 && (
                      <span className="shrink-0 text-red-500 font-semibold">
                        ⚠ {log.anomalyScore.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
                {(data ?? []).length === 0 && (
                  <div className="p-12 text-center text-sm text-muted-foreground">
                    No logs match the current filters.
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
