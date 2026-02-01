export type KpiItem = {
  value: number;
  prev_value: number;
  trend_percent: number;
  trend_label: string;
  subtitle: string;
};

export type DashboardKpis = {
  total_expenses: KpiItem;
  this_month: KpiItem;
  expense_count: KpiItem;
  avg_per_expense: KpiItem;
};

export type MonthlySpendingItem = {
  month: string;
  amount: number;
};

export type MonthlyByTypeItem = {
  month: string;
  essential: number;
  other: number;
};

export type ByCategoryItem = {
  category: string;
  amount: number;
  fill: string;
};

export type DailyTrendItem = {
  date: string;
  spent: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  monthly_spending: MonthlySpendingItem[];
  monthly_by_type: MonthlyByTypeItem[];
  by_category: ByCategoryItem[];
  daily_trend: DailyTrendItem[];
};

export type KpiCardData = {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  subtitle: string;
};
