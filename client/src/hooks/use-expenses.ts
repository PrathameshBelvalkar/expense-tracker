import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { expenseKeys, dashboardKeys } from "@/api/query-keys";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type ExpenseCreatePayload,
  type ExpenseUpdatePayload,
  type ExpenseListParams,
} from "@/api/expenses";

export function useExpensesQuery(params?: ExpenseListParams) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => fetchExpenses(params),
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpenseCreatePayload) => createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Expense added");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ExpenseUpdatePayload }) =>
      updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Expense updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("Expense deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
