import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  subtitle: string;
}

function KpiCard({ title, value, trend, trendLabel, subtitle }: KpiCardProps) {
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

const kpiData: KpiCardProps[] = [
  {
    title: "Total Expenses",
    value: "₹1,25,000",
    trend: 12.5,
    trendLabel: "Up from last period",
    subtitle: "Total spent in the last 6 months",
  },
  {
    title: "This Month",
    value: "₹24,500",
    trend: -8,
    trendLabel: "Down from last month",
    subtitle: "Current month spending",
  },
  {
    title: "Expense Count",
    value: "127",
    trend: 5,
    trendLabel: "More transactions",
    subtitle: "Number of expense entries",
  },
  {
    title: "Avg per Expense",
    value: "₹984",
    trend: 3,
    trendLabel: "Slightly higher average",
    subtitle: "Average transaction size",
  },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((item) => (
        <KpiCard key={item.title} {...item} />
      ))}
    </div>
  );
}
