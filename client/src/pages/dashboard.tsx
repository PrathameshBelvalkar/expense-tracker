import { ChartBarDefault } from "@/components/chart-bar-default";
import { ChartBarMultiple } from "@/components/chart-bar-multiple";
import { ChartLineInteractive } from "@/components/chart-line-interactive";
import { ChartPieLabelList } from "@/components/chart-pie-label-list";
import { KpiCards } from "@/components/kpi-cards";

export function DashboardPage() {
  return (
    <>
      <KpiCards />
      <div className="grid gap-4 md:grid-cols-3">
        <ChartBarDefault />
        <ChartPieLabelList />
        <ChartBarMultiple />
      </div>
      <ChartLineInteractive />
    </>
  );
}
