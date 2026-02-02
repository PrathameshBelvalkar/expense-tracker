import {
  flexRender,
  getCoreRowModel,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Expense } from "@/types/expense";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const SORTABLE_IDS = ["title", "amount", "category", "expense_date"] as const;

type ExpenseTableProps = {
  data: Expense[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (columnId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  isDeletingId: string | null;
  isLoading?: boolean;
};

function SortableHeaderCell({
  columnId,
  label,
  sortBy,
  sortOrder,
  onSortChange,
}: {
  columnId: string;
  label: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (id: string) => void;
}) {
  const isSorted = sortBy === columnId;
  const canSort = SORTABLE_IDS.includes(columnId as (typeof SORTABLE_IDS)[number]);
  return (
    <TableHead>
      {canSort ? (
        <Button
          variant="ghost"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => onSortChange(columnId)}
        >
          {label}
          {isSorted && sortOrder === "asc" ? (
            <ArrowUpIcon className="ml-2 size-4" />
          ) : isSorted && sortOrder === "desc" ? (
            <ArrowDownIcon className="ml-2 size-4" />
          ) : (
            <ArrowUpDownIcon className="ml-2 size-4 opacity-50" />
          )}
        </Button>
      ) : (
        label
      )}
    </TableHead>
  );
}

const LOADING_ROW_COUNT = 10;

export function ExpenseTable({
  data,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  isDeletingId,
  isLoading = false,
}: ExpenseTableProps) {
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const handleDeleteConfirm = () => {
    if (pendingDelete) {
      onDelete(pendingDelete);
      setPendingDelete(null);
    }
  };

  const actionColumn: ColumnDef<Expense> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <PencilIcon className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setPendingDelete(row.original)}
            variant="destructive"
            disabled={isDeletingId === row.original.id}
          >
            <Trash2Icon className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "title",
      header: () => (
        <SortableHeaderCell
          columnId="title"
          label="Title"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
    },
    {
      accessorKey: "amount",
      header: () => (
        <SortableHeaderCell
          columnId="amount"
          label="Amount"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(row.original.amount),
    },
    {
      accessorKey: "category",
      header: () => (
        <SortableHeaderCell
          columnId="category"
          label="Category"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
    },
    {
      accessorKey: "expense_date",
      header: () => (
        <SortableHeaderCell
          columnId="expense_date"
          label="Date"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
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
      <span
        className="max-w-[200px] truncate block"
        title={row.original.description}
      >
        {row.original.description}
      </span>
    ),
    },
    actionColumn,
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const paginationPages = useMemo(() => {
    const totalPages = pageCount;
    const current = page;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (current - 2 > 1) pages.push("ellipsis");
    for (let i = Math.max(1, current - 1); i <= Math.min(totalPages, current + 1); i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    if (current + 2 < totalPages) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  }, [page, pageCount]);

  const rows = table.getRowModel().rows;
  const colCount = columns.length;

  return (
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
          {isLoading ? (
            Array.from({ length: Math.min(LOADING_ROW_COUNT, pageSize) }).map(
              (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: colCount }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              )
            )
          ) : rows?.length ? (
            rows.map((row) => (
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
              <TableCell colSpan={colCount} className="h-24 text-center">
                No expenses.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border-t">
        {isLoading ? (
          <Skeleton className="h-5 w-48" />
        ) : (
          <p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
            Page {page} of {pageCount} ({total} expenses)
          </p>
        )}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </>
          ) : (
            <>
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
                onValueChange={(v) => onPageSizeChange(Number(v))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <DropdownMenuRadioItem key={size} value={String(size)}>
                    {size}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) onPageChange(page - 1);
                  }}
                  className={page > 1 ? "cursor-pointer" : "pointer-events-none opacity-50"}
                  aria-disabled={page <= 1}
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
                        onPageChange(p);
                      }}
                      isActive={page === p}
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
                    if (page < pageCount) onPageChange(page + 1);
                  }}
                  className={page < pageCount ? "cursor-pointer" : "pointer-events-none opacity-50"}
                  aria-disabled={page >= pageCount}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
            </>
          )}
        </div>
      </div>
      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{pendingDelete?.title ?? ""}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={pendingDelete !== null && isDeletingId === pendingDelete.id}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
