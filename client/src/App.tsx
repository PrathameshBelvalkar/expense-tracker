import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { Layout } from "@/components/layout";
import { DashboardPage } from "@/pages/dashboard";
import { ExpensesPage } from "@/pages/expenses";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "expenses", element: <ExpensesPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
