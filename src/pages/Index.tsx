import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { LogStream } from "@/components/dashboard/LogStream";
import { AnomalyPanel } from "@/components/dashboard/AnomalyPanel";
import { LogVolumeChart } from "@/components/dashboard/LogVolumeChart";
import { AnomalyTimeline } from "@/components/dashboard/AnomalyTimeline";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time log intelligence & anomaly detection</p>
        </div>

        <MetricsRow />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LogVolumeChart />
          <AnomalyTimeline />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <LogStream />
          </div>
          <AnomalyPanel />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
