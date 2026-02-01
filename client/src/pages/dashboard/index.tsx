import { useDashboardQuery } from "@/hooks/use-dashboard";
import { KpiCards } from "@/components/kpi-cards";
import { ChartBarDefault } from "@/components/chart-bar-default";
import { ChartBarMultiple } from "@/components/chart-bar-multiple";
import { ChartPieLabelList } from "@/components/chart-pie-label-list";
import { ChartLineInteractive } from "@/components/chart-line-interactive";

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardQuery();

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-md border border-destructive/50 p-8 text-destructive">
        {error?.message ?? "Failed to load dashboard"}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <KpiCards data={data} isLoading={isLoading} />
      <div className="grid gap-4 md:grid-cols-3">
        <ChartBarDefault data={data?.monthly_spending} />
        <ChartPieLabelList data={data?.by_category} />
        <ChartBarMultiple data={data?.monthly_by_type} />
      </div>
      <ChartLineInteractive data={data?.daily_trend} />
    </div>
  );
}
