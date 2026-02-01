import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";

type ExpenseToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
};

export function ExpenseToolbar({
  search,
  onSearchChange,
  onAddClick,
}: ExpenseToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search by title, category, description..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <Button size="sm" className="h-9 gap-1" onClick={onAddClick}>
        <PlusIcon className="size-4" />
        Add
      </Button>
    </div>
  );
}
