import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { CSVLink } from "react-csv";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loading?: boolean;
  height?: number;
  csvData?: object[];
  csvFilename?: string;
  toolbar?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  loading,
  height = 280,
  csvData,
  csvFilename,
  toolbar,
}: Props) {
  return (
    <Card className="shadcn-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {toolbar}
            {csvData && csvFilename && (
              <CSVLink data={csvData} filename={csvFilename}>
                <Button size="sm" variant="ghost" className="h-7 px-2">
                  <Download className="size-3.5" />
                </Button>
              </CSVLink>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton style={{ height }} className="w-full" />
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
