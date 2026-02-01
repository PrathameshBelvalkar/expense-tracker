import type { Expense, ExpenseCategory } from "@/types/expense";

const CATEGORIES: ExpenseCategory[] = [
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

const TITLES: Record<ExpenseCategory, string[]> = {
  RENT: ["House rent", "Apartment rent", "Room rent"],
  FOOD: ["Groceries", "Restaurant", "Takeout", "Coffee", "Lunch"],
  TRANSPORT: ["Fuel", "Bus pass", "Taxi", "Parking", "Car maintenance"],
  UTILITIES: ["Electricity", "Water", "Internet", "Gas", "Phone bill"],
  ENTERTAINMENT: ["Netflix", "Cinema", "Concert", "Games", "Books"],
  HEALTH: ["Pharmacy", "Doctor visit", "Gym", "Supplements"],
  SHOPPING: ["Clothes", "Electronics", "Household items"],
  EDUCATION: ["Course fee", "Books", "Software license"],
  INSURANCE: ["Car insurance", "Health insurance", "Life insurance"],
  OTHER: ["Miscellaneous", "Gift", "Donation"],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return d.toISOString().slice(0, 10);
}

export function generateFakeExpenses(count: number): Expense[] {
  const start = new Date("2024-01-01");
  const end = new Date("2024-12-31");
  const expenses: Expense[] = [];

  for (let i = 0; i < count; i++) {
    const category = randomItem(CATEGORIES);
    const title = randomItem(TITLES[category]);
    const amount = Math.round((Math.random() * 15000 + 50) * 100) / 100;
    const expense_date = randomDate(start, end);
    expenses.push({
      id: `exp-${i + 1}`,
      title,
      amount,
      category,
      expense_date,
      description: `${title} - ${expense_date}`,
    });
  }

  return expenses;
}
