import { api } from "./client";
import type { DashboardData } from "@/types/dashboard";

export async function fetchDashboard(): Promise<DashboardData> {
  const result = await api.get<DashboardData>("/dashboard");
  if (!result.ok) throw new Error(result.error);
  return result.data ?? { kpis: {} as DashboardData["kpis"], monthly_spending: [], monthly_by_type: [], by_category: [], daily_trend: [] };
}
