import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListPatterns } from "@workspace/api-client-react";
import {
  flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable, type ColumnDef, type SortingState
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SplitRefreshButton, DarkModeToggle, ExportPdfButton, LastRefreshed, CHART_COLORS } from "@/components/common/Controls";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import type { LogPattern } from "@workspace/api-client-react/src/generated/api.schemas";

export default function PatternsPage() {
  const queryClient = useQueryClient();
  const listQuery = useListPatterns();
  const patterns = listQuery.data || [];
  
  const [sorting, setSorting] = useState<SortingState>([{ id: "occurrences", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<LogPattern>[] = [
    {
      accessorKey: "template",
      header: "Log Template",
      cell: ({ row }) => (
        <div className="font-mono text-[12px] bg-muted/40 p-2 rounded-md max-w-[500px] break-words">
          {row.original.template}
        </div>
      ),
    },
    {
      accessorKey: "occurrences",
      header: "Occurrences",
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.occurrences.toLocaleString()}</span>,
    },
    {
      accessorKey: "trendPct",
      header: "Trend",
      cell: ({ row }) => {
        const val = row.original.trendPct;
        const isUp = val > 0;
        const color = isUp ? "text-red-500" : "text-green-500"; // Assuming up trend in errors is bad
        return (
          <div className={`flex items-center gap-1 text-[12px] font-mono ${val !== 0 ? color : "text-muted-foreground"}`}>
            {val > 0 ? <ArrowUp className="w-3 h-3" /> : val < 0 ? <ArrowDown className="w-3 h-3" /> : null}
            {Math.abs(val)}%
          </div>
        );
      },
    },
    {
      accessorKey: "confidence",
      header: "AI Confidence",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${row.original.confidence * 100}%` }} />
          </div>
          <span className="font-mono text-[11px]">{(row.original.confidence * 100).toFixed(0)}%</span>
        </div>
      ),
    },
    {
      accessorKey: "services",
      header: "Services",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.services.map(s => (
            <Badge key={s} variant="outline" className="text-[10px] bg-background">{s}</Badge>
          ))}
        </div>
      ),
    }
  ];

  const table = useReactTable({
    data: patterns,
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
              <h1 className="font-bold text-[32px]">Discovered Patterns</h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">K-Means clustered log templates and occurrence trends</p>
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
                  placeholder="Search templates..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 font-mono text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4 align-top">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center font-mono text-sm">
                        {loading ? "Loading patterns..." : "No patterns found."}
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
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}