import { api } from "./client";
import type { Expense, ExpenseCategory } from "@/types/expense";

export type ExpenseCreatePayload = {
  title: string;
  amount: number;
  category?: ExpenseCategory;
  expense_date: string;
  description?: string;
};

export type ExpenseUpdatePayload = Partial<ExpenseCreatePayload>;

export type ExpenseListParams = {
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
};

export type ExpenseListResponse = {
  items: Expense[];
  total: number;
};

function buildQueryString(params: ExpenseListParams): string {
  const sp = new URLSearchParams();
  if (params.search != null && params.search !== "") sp.set("search", params.search);
  if (params.sort_by != null) sp.set("sort_by", params.sort_by);
  if (params.sort_order != null) sp.set("sort_order", params.sort_order);
  if (params.page != null) sp.set("page", String(params.page));
  if (params.page_size != null) sp.set("page_size", String(params.page_size));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchExpenses(params?: ExpenseListParams): Promise<ExpenseListResponse> {
  const path = `/expenses${buildQueryString(params ?? {})}`;
  const result = await api.get<ExpenseListResponse>(path);
  if (!result.ok) throw new Error(result.error);
  return result.data ?? { items: [], total: 0 };
}

export async function fetchExpense(id: string): Promise<Expense | null> {
  const result = await api.get<Expense>(`/expenses/${id}`);
  if (!result.ok) throw new Error(result.error);
  return result.data ?? null;
}

export async function createExpense(payload: ExpenseCreatePayload): Promise<Expense> {
  const result = await api.post<Expense>("/expenses", {
    ...payload,
    category: payload.category ?? "OTHER",
    description: payload.description ?? "",
  });
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function updateExpense(
  id: string,
  payload: ExpenseUpdatePayload
): Promise<Expense> {
  const result = await api.put<Expense>(`/expenses/${id}`, payload);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function deleteExpense(id: string): Promise<void> {
  const result = await api.delete(`/expenses/${id}`);
  if (!result.ok) throw new Error(result.error);
}
