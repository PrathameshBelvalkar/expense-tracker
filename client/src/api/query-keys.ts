export const expenseKeys = {
  all: ["expenses"] as const,
  list: (params?: Record<string, unknown>) => [...expenseKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...expenseKeys.all, "detail", id] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
};
