import { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import {
  AlertOctagon,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  Download,
  FileText,
  GitBranch,
  MessageSquare,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
} from "lucide-react";
import {
  useListAlerts,
  useGetAlert,
  useGetAlertRunbook,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      subtitle="Severity-ranked · root cause + guided runbooks"
      actions={
        <CSVLink data={data ?? []} filename="alerts.csv">
          <Button size="sm" variant="outline" className="gap-2" data-testid="button-export-alerts">
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
              data-testid={`card-alert-${a.id}`}
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
                      <Badge variant="outline" className="gap-1 text-[10px] font-normal">
                        <PlayCircle className="size-3" />
                        Runbook ready
                      </Badge>
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
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
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

            <Tabs defaultValue="runbook" className="px-4 pb-6">
              <TabsList className="grid grid-cols-3 w-full mb-4" data-testid="tabs-alert-detail">
                <TabsTrigger value="runbook" className="gap-1.5" data-testid="tab-runbook">
                  <PlayCircle className="size-3.5" /> Runbook
                </TabsTrigger>
                <TabsTrigger value="rca" className="gap-1.5" data-testid="tab-rca">
                  <GitBranch className="size-3.5" /> Root cause
                </TabsTrigger>
                <TabsTrigger value="logs" className="gap-1.5" data-testid="tab-logs">
                  <Search className="size-3.5" /> Related logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="runbook" className="space-y-5">
                <RunbookPanel alertId={data.alert.id} />
              </TabsContent>

              <TabsContent value="rca" className="space-y-5">
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
                    Causal chain
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
              </TabsContent>

              <TabsContent value="logs">
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
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

const STEP_KIND_META: Record<
  string,
  { icon: typeof Check; label: string; tone: string }
> = {
  check: { icon: Search, label: "Check", tone: "text-sky-500 bg-sky-500/10" },
  command: { icon: Terminal, label: "Command", tone: "text-violet-500 bg-violet-500/10" },
  decision: { icon: GitBranch, label: "Decision", tone: "text-amber-500 bg-amber-500/10" },
  fix: { icon: Wrench, label: "Fix", tone: "text-red-500 bg-red-500/10" },
  verify: { icon: ShieldCheck, label: "Verify", tone: "text-emerald-500 bg-emerald-500/10" },
  communicate: { icon: MessageSquare, label: "Communicate", tone: "text-cyan-500 bg-cyan-500/10" },
};

function RunbookPanel({ alertId }: { alertId: string }) {
  const { data, isLoading } = useGetAlertRunbook(alertId);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const [postmortemCopied, setPostmortemCopied] = useState(false);
  const [postmortemOpen, setPostmortemOpen] = useState(false);

  useEffect(() => {
    setCompleted({});
    setCopiedStepId(null);
    setPostmortemCopied(false);
    setPostmortemOpen(false);
  }, [alertId]);

  const totals = useMemo(() => {
    if (!data) return { done: 0, total: 0, pct: 0, doneMinutes: 0 };
    const total = data.steps.length;
    const doneSteps = data.steps.filter((s) => completed[s.id]);
    const done = doneSteps.length;
    const doneMinutes = doneSteps.reduce((acc, s) => acc + s.estimatedMinutes, 0);
    return { done, total, pct: total ? (done / total) * 100 : 0, doneMinutes };
  }, [data, completed]);

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const handleCopy = async (text: string, stepId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStepId(stepId);
      setTimeout(() => setCopiedStepId((c) => (c === stepId ? null : c)), 1500);
    } catch {
      // ignore
    }
  };

  const handleCopyPostmortem = async () => {
    try {
      await navigator.clipboard.writeText(data.postmortem);
      setPostmortemCopied(true);
      setTimeout(() => setPostmortemCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded border border-border bg-card p-4 space-y-3" data-testid="runbook-summary">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Guided remediation
            </div>
            <div className="text-sm font-semibold mt-0.5">{data.title}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <Badge variant="outline" className="gap-1 font-mono">
              <Clock className="size-3" />
              ~{data.estimatedMinutes} min
            </Badge>
            <Badge variant="outline" className="gap-1 font-mono">
              <Sparkles className="size-3" />
              {(data.confidence * 100).toFixed(0)}% match
            </Badge>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span data-testid="runbook-progress-text">
              {totals.done}/{totals.total} steps · {totals.doneMinutes}/{data.estimatedMinutes} min
            </span>
            <span>{totals.pct.toFixed(0)}%</span>
          </div>
          <Progress value={totals.pct} className="h-1.5" />
        </div>
      </div>

      <ol className="space-y-3" data-testid="runbook-steps">
        {data.steps.map((step) => {
          const meta = STEP_KIND_META[step.kind] ?? STEP_KIND_META.check;
          const Icon = meta.icon;
          const isDone = !!completed[step.id];
          return (
            <li
              key={step.id}
              className={`rounded border p-3 transition-colors ${
                isDone
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-card"
              }`}
              data-testid={`runbook-step-${step.order}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isDone}
                  onCheckedChange={(v) =>
                    setCompleted((prev) => ({ ...prev, [step.id]: !!v }))
                  }
                  className="mt-1"
                  data-testid={`checkbox-step-${step.order}`}
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {String(step.order).padStart(2, "0")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${meta.tone}`}
                    >
                      <Icon className="size-3" />
                      {meta.label}
                    </span>
                    <h5
                      className={`text-sm font-semibold ${isDone ? "line-through text-muted-foreground" : ""}`}
                    >
                      {step.title}
                    </h5>
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto flex items-center gap-1">
                      <Clock className="size-3" />~{step.estimatedMinutes}m
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                  {step.command ? (
                    <div className="rounded border border-border bg-background overflow-hidden">
                      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-muted/40">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          shell
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 gap-1 text-[10px]"
                          onClick={() => handleCopy(step.command!, step.id)}
                          data-testid={`button-copy-step-${step.order}`}
                        >
                          {copiedStepId === step.id ? (
                            <>
                              <Check className="size-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="px-3 py-2 text-[11px] font-mono whitespace-pre-wrap break-all">
                        {step.command}
                      </pre>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-2 text-[11px] bg-muted/40 rounded px-2 py-1.5 border border-border">
                    <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-500 shrink-0" />
                    <span>
                      <span className="font-medium">Expected:</span>{" "}
                      {step.expectedOutcome}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <Separator />

      <section className="rounded border border-border bg-card" data-testid="postmortem-section">
        <button
          type="button"
          onClick={() => setPostmortemOpen((o) => !o)}
          className="w-full flex items-center justify-between p-3 hover-elevate"
          data-testid="button-toggle-postmortem"
        >
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-violet-500" />
            <div className="text-left">
              <div className="text-sm font-semibold">
                Auto-generated postmortem draft
              </div>
              <div className="text-[11px] text-muted-foreground">
                Pre-filled timeline, root cause, action items — ready to refine.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totals.done === totals.total && totals.total > 0 ? (
              <Badge className="gap-1 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <ClipboardCheck className="size-3" /> Ready to file
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                Draft
              </Badge>
            )}
            <ArrowRight
              className={`size-4 text-muted-foreground transition-transform ${postmortemOpen ? "rotate-90" : ""}`}
            />
          </div>
        </button>

        {postmortemOpen ? (
          <div className="border-t border-border">
            <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-border bg-muted/40">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-[11px]"
                onClick={handleCopyPostmortem}
                data-testid="button-copy-postmortem"
              >
                {postmortemCopied ? (
                  <>
                    <Check className="size-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy markdown
                  </>
                )}
              </Button>
            </div>
            <pre className="p-4 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {data.postmortem}
            </pre>
          </div>
        ) : null}
      </section>
    </div>
  );
}
