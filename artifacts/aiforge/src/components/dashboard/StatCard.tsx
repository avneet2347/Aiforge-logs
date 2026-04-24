import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; direction: "up" | "down"; positive?: boolean };
  icon?: LucideIcon;
  accent?: "primary" | "emerald" | "amber" | "red" | "violet";
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  primary: "text-primary bg-primary/10",
  emerald: "text-emerald-500 bg-emerald-500/10",
  amber: "text-amber-500 bg-amber-500/10",
  red: "text-red-500 bg-red-500/10",
  violet: "text-violet-500 bg-violet-500/10",
};

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accent = "primary",
}: Props) {
  return (
    <Card className="shadcn-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
              {value}
            </div>
            {hint && (
              <div className="text-xs text-muted-foreground mt-1">{hint}</div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "size-9 rounded-md flex items-center justify-center shrink-0",
                ACCENT[accent],
              )}
            >
              <Icon className="size-4" />
            </div>
          )}
        </div>
        {trend && (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-emerald-500" : "text-red-500",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
