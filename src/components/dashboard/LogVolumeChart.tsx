import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { logVolumeData } from "@/lib/mock-data";

export function LogVolumeChart() {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Log Volume (24h)</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={logVolumeData}>
            <defs>
              <linearGradient id="gInfo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(210 100% 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(210 100% 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gError" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: "hsl(224 33% 17%)", border: "1px solid hsl(224 20% 24%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(210 40% 96%)" }}
            />
            <Area type="monotone" dataKey="info" stroke="hsl(210 100% 60%)" fill="url(#gInfo)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="error" stroke="hsl(0 84% 60%)" fill="url(#gError)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="critical" stroke="hsl(0 84% 60%)" fill="none" strokeWidth={2} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
