import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ChevronDownIcon } from "lucide-react";
import type { ExpenseCategory } from "@/types/expense";

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

export type ExpenseFormState = {
  title: string;
  amount: string;
  category: ExpenseCategory;
  expense_date: string;
  description: string;
};

export const emptyForm: ExpenseFormState = {
  title: "",
  amount: "",
  category: "OTHER",
  expense_date: "",
  description: "",
};

type ExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ExpenseFormState;
  setForm: React.Dispatch<React.SetStateAction<ExpenseFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  mode: "add" | "edit";
};

export function ExpenseFormDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  isPending,
  mode,
}: ExpenseFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add expense" : "Edit expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {mode === "add" ? "Add expense" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
