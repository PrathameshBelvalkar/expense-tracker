import { useState, useCallback } from "react";
import {
  useExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "@/hooks/use-expenses";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ExpenseFormDialog, emptyForm, type ExpenseFormState } from "./expense-form-dialog";
import { SaveReceiptExpenseDialog } from "./save-receipt-expense-dialog";
import { ExpenseTable } from "./expense-table";
import { ExpenseToolbar } from "./expense-toolbar";
import { UploadReceiptDialog } from "./upload-receipt-dialog";
import type { Expense } from "@/types/expense";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const SORTABLE_COLUMNS = ["title", "amount", "category", "expense_date"] as const;

export function ExpensesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string>("expense_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadReceiptOpen, setUploadReceiptOpen] = useState(false);
  const [receiptToSave, setReceiptToSave] = useState<{ amount: number } | null>(null);
  const [form, setForm] = useState<ExpenseFormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const listParams = {
    search: debouncedSearch.trim() || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    page_size: pageSize,
  };
  const { data, isLoading, isError, error } = useExpensesQuery(listParams);
  const expenses = data?.items ?? [];
  const total = data?.total ?? 0;

  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();

  const isDeletingId: string | null =
    deleteMutation.isPending && deleteMutation.variables != null
      ? deleteMutation.variables
      : null;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((columnId: string) => {
    const next = SORTABLE_COLUMNS.includes(columnId as (typeof SORTABLE_COLUMNS)[number])
      ? columnId
      : "expense_date";
    setSortBy(next);
    setSortOrder((prev) => (sortBy === next ? (prev === "asc" ? "desc" : "asc") : "desc"));
    setPage(1);
  }, [sortBy, sortOrder]);

  const handlePageChange = useCallback((newPage: number) => setPage(newPage), []);
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleAddClick = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditId(expense.id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      expense_date: expense.expense_date,
      description: expense.description ?? "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    deleteMutation.mutate(expense.id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title.trim() || Number.isNaN(amount) || amount < 0 || !form.expense_date) return;

    if (editId) {
      updateMutation.mutate(
        {
          id: editId,
          payload: {
            title: form.title.trim(),
            amount,
            category: form.category,
            expense_date: form.expense_date,
            description: form.description.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            setForm(emptyForm);
            setEditId(null);
            setDialogOpen(false);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          title: form.title.trim(),
          amount,
          category: form.category,
          expense_date: form.expense_date,
          description: form.description.trim() || undefined,
        },
        {
          onSuccess: () => {
            setForm(emptyForm);
            setDialogOpen(false);
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ExpenseToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        onUploadReceiptClick={() => setUploadReceiptOpen(true)}
      />
      <UploadReceiptDialog
        open={uploadReceiptOpen}
        onOpenChange={setUploadReceiptOpen}
        onOcrSuccess={(data) => {
          setReceiptToSave(data);
          setUploadReceiptOpen(false);
        }}
      />
      <SaveReceiptExpenseDialog
        open={receiptToSave != null}
        onOpenChange={(open) => {
          if (!open) setReceiptToSave(null);
        }}
        initialAmount={receiptToSave?.amount}
        onSaved={() => setReceiptToSave(null)}
      />
      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        mode={editId ? "edit" : "add"}
      />
      {isError ? (
        <div className="rounded-md border border-destructive/50 p-8 text-center text-destructive">
          {error?.message ?? "Failed to load expenses"}
        </div>
      ) : (
        <ExpenseTable
          data={expenses}
          total={total}
          page={page}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeletingId={isDeletingId}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
