import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { anomalyTimelineData } from "@/lib/mock-data";

export function AnomalyTimeline() {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Anomaly Timeline (24h)</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={anomalyTimelineData}>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: "hsl(224 33% 17%)", border: "1px solid hsl(224 20% 24%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(210 40% 96%)" }}
            />
            <Bar dataKey="anomalies" fill="hsl(142 69% 58%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="predicted" fill="hsl(263 62% 71% / 0.6)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
