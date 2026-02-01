import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiCardData } from "@/types/dashboard";

function KpiCard({ title, value, trend, trendLabel, subtitle }: KpiCardData) {
  const isUp = trend >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <Card className="gap-0 py-6">
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-6 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <CardAction className="col-auto row-auto self-start">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
              isUp
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400"
            )}
          >
            <TrendIcon className="size-3.5" />
            {isUp ? "+" : ""}
            {trend}%
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-6 pt-0">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <TrendIcon className="size-3.5 shrink-0" />
          {trendLabel}
        </p>
        <p className="text-xs text-muted-foreground/80">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

function kpisToCards(kpis: {
  total_expenses: { value: number; trend_percent: number; trend_label: string; subtitle: string };
  this_month: { value: number; trend_percent: number; trend_label: string; subtitle: string };
  expense_count: { value: number; trend_percent: number; trend_label: string; subtitle: string };
  avg_per_expense: { value: number; trend_percent: number; trend_label: string; subtitle: string };
}): KpiCardData[] {
  return [
    {
      title: "Total Expenses",
      value: formatCurrency(kpis.total_expenses.value),
      trend: kpis.total_expenses.trend_percent,
      trendLabel: kpis.total_expenses.trend_label,
      subtitle: kpis.total_expenses.subtitle,
    },
    {
      title: "This Month",
      value: formatCurrency(kpis.this_month.value),
      trend: kpis.this_month.trend_percent,
      trendLabel: kpis.this_month.trend_label,
      subtitle: kpis.this_month.subtitle,
    },
    {
      title: "Expense Count",
      value: String(kpis.expense_count.value),
      trend: kpis.expense_count.trend_percent,
      trendLabel: kpis.expense_count.trend_label,
      subtitle: kpis.expense_count.subtitle,
    },
    {
      title: "Avg per Expense",
      value: formatCurrency(kpis.avg_per_expense.value),
      trend: kpis.avg_per_expense.trend_percent,
      trendLabel: kpis.avg_per_expense.trend_label,
      subtitle: kpis.avg_per_expense.subtitle,
    },
  ];
}

export function KpiCards({
  data,
  isLoading,
}: {
  data?: { kpis: Parameters<typeof kpisToCards>[0] };
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="gap-0 py-6">
            <CardHeader className="px-6 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="px-6 pt-0 space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  const cards = data?.kpis ? kpisToCards(data.kpis) : [];
  if (cards.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((item) => (
        <KpiCard key={item.title} {...item} />
      ))}
    </div>
  );
}
