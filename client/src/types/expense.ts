export type ExpenseCategory =
  | "RENT"
  | "FOOD"
  | "TRANSPORT"
  | "UTILITIES"
  | "ENTERTAINMENT"
  | "HEALTH"
  | "SHOPPING"
  | "EDUCATION"
  | "INSURANCE"
  | "OTHER";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  description: string;
}
