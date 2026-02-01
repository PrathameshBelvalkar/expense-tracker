import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  ChevronDownIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { generateFakeExpenses } from "@/data/fake-expenses";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { useMemo, useState } from "react";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "RENT",
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTH",
  "SHOPPING",
  "EDUCATION",
  "INSURANCE",
  "OTHER",
];

const emptyForm = {
  title: "",
  amount: "",
  category: "OTHER" as ExpenseCategory,
  expense_date: "",
  description: "",
};

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(row.original.amount),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "expense_date",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.expense_date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block" title={row.original.description}>
        {row.original.description}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row: _row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {}}>
            <PencilIcon className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {}} variant="destructive">
            <Trash2Icon className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Expense[]>(() => generateFakeExpenses(100));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title.trim() || Number.isNaN(amount) || amount < 0 || !form.expense_date) return;
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: form.title.trim(),
      amount,
      category: form.category,
      expense_date: form.expense_date,
      description: form.description.trim() || `${form.title.trim()} - ${form.expense_date}`,
    };
    setData((prev) => [newExpense, ...prev]);
    setForm(emptyForm);
    setDialogOpen(false);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: (updater) => {
      const v = updater instanceof Function ? updater(search) : updater;
      setSearch(v ?? "");
    },
    state: {
      globalFilter: search,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase();
      if (!q) return true;
      const r = row.original;
      const haystack = [
        r.title,
        r.category,
        r.description,
        String(r.amount),
        r.expense_date,
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  const paginationPages = useMemo(() => {
    const total = pageCount;
    const current = pageIndex + 1;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (current - 2 > 1) pages.push("ellipsis");
    for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
      if (i !== 1 && i !== total) pages.push(i);
    }
    if (current + 2 < total) pages.push("ellipsis");
    if (total > 1) pages.push(total);
    return pages;
  }, [pageIndex, pageCount]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* <h1 className="text-2xl font-semibold">My Expenses</h1>
      <p className="text-muted-foreground">Expense tracking and reports.</p> */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by title, category, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                {pageSize} per page
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={String(pageSize)}
                onValueChange={(v) => {
                  table.setPageSize(Number(v));
                  table.setPageIndex(0);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <DropdownMenuRadioItem key={size} value={String(size)}>
                    {size}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-9 gap-1" onClick={() => setDialogOpen(true)}>
            <PlusIcon className="size-4" />
            Add
          </Button>
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="expense-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="expense-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. House rent"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="expense-amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="expense-category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ExpenseCategory }))
                }
              >
                <SelectTrigger id="expense-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="expense-date" className="text-sm font-medium">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expense-date"
                    variant="outline"
                    data-empty={!form.expense_date}
                    className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal"
                  >
                    {form.expense_date ? (
                      format(new Date(form.expense_date), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      form.expense_date ? new Date(form.expense_date) : undefined
                    }
                    onSelect={(date) =>
                      setForm((f) => ({
                        ...f,
                        expense_date: date ? format(date, "yyyy-MM-dd") : "",
                      }))
                    }
                    defaultMonth={
                      form.expense_date
                        ? new Date(form.expense_date)
                        : undefined
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <label htmlFor="expense-description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="expense-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No expenses.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
          Page {pageIndex + 1} of {pageCount} ({table.getFilteredRowModel().rows.length} expenses)
        </p>
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (canPrev) table.previousPage();
                }}
                className={canPrev ? "cursor-pointer" : "pointer-events-none opacity-50"}
                aria-disabled={!canPrev}
              />
            </PaginationItem>
            {paginationPages.map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.setPageIndex(p - 1);
                    }}
                    isActive={pageIndex === p - 1}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (canNext) table.nextPage();
                }}
                className={canNext ? "cursor-pointer" : "pointer-events-none opacity-50"}
                aria-disabled={!canNext}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
