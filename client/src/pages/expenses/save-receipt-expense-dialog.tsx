import { useState, useEffect } from "react";
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
import { useCreateExpenseMutation } from "@/hooks/use-expenses";
import { toast } from "sonner";

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

type SaveReceiptExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle?: string;
  initialAmount?: number;
  onSaved?: () => void;
};

export function SaveReceiptExpenseDialog({
  open,
  onOpenChange,
  initialTitle = "",
  initialAmount = 0,
  onSaved,
}: SaveReceiptExpenseDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [amount, setAmount] = useState(
    initialAmount > 0 ? String(initialAmount) : ""
  );
  const [category, setCategory] = useState<ExpenseCategory>("OTHER");
  const [expenseDate, setExpenseDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );

  const createMutation = useCreateExpenseMutation();

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setAmount(initialAmount > 0 ? String(initialAmount) : "");
      setCategory("OTHER");
      setExpenseDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [open, initialTitle, initialAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!title.trim() || Number.isNaN(amountNum) || amountNum < 0 || !expenseDate) {
      toast.error("Please fill Title, Amount and Date.");
      return;
    }
    createMutation.mutate(
      {
        title: title.trim(),
        amount: amountNum,
        category,
        expense_date: expenseDate,
        description: "",
      },
      {
        onSuccess: () => {
          onSaved?.();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save expense from receipt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="receipt-expense-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="receipt-expense-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office supplies"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="receipt-expense-category" className="text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger id="receipt-expense-category" className="w-full">
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
            <label htmlFor="receipt-expense-amount" className="text-sm font-medium">
              Amount (extracted)
            </label>
            <Input
              id="receipt-expense-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="receipt-expense-date" className="text-sm font-medium">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="receipt-expense-date"
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                >
                  {expenseDate ? format(new Date(expenseDate), "PPP") : "Pick a date"}
                  <ChevronDownIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expenseDate ? new Date(expenseDate) : undefined}
                  onSelect={(date) =>
                    setExpenseDate(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  defaultMonth={expenseDate ? new Date(expenseDate) : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
