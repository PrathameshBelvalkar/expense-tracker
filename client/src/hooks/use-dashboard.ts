import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "@/api/query-keys";
import { fetchDashboard } from "@/api/dashboard";

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: fetchDashboard,
  });
}
