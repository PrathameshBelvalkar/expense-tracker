
import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const defaultChartData = [
  { category: "RENT", amount: 35000, fill: "var(--color-RENT)" },
  { category: "FOOD", amount: 22000, fill: "var(--color-FOOD)" },
  { category: "UTILITIES", amount: 12000, fill: "var(--color-UTILITIES)" },
  { category: "TRANSPORT", amount: 15000, fill: "var(--color-TRANSPORT)" },
  { category: "OTHER", amount: 18000, fill: "var(--color-OTHER)" },
]
const chartConfig = {
  amount: {
    label: "Spending (₹)",
  },
  RENT: {
    label: "Rent",
    color: "var(--chart-1)",
  },
  FOOD: {
    label: "Food",
    color: "var(--chart-2)",
  },
  UTILITIES: {
    label: "Utilities",
    color: "var(--chart-3)",
  },
  TRANSPORT: {
    label: "Transport",
    color: "var(--chart-4)",
  },
  OTHER: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

type ChartPieLabelListProps = {
  data?: { category: string; amount: number; fill: string }[];
}

export function ChartPieLabelList({ data = defaultChartData }: ChartPieLabelListProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Share of total expenses by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px] min-h-[200px] w-full"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="category" hideLabel />}
            />
            <Pie data={data} dataKey="amount">
              <LabelList
                dataKey="category"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: unknown) =>
                  chartConfig[value as keyof typeof chartConfig]?.label ?? String(value)
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Category-wise spending <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Share of total expenses (₹)
        </div>
      </CardFooter>
    </Card>
  )
}
