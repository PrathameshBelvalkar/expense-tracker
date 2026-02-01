
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, XAxis } from "recharts"

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

const chartData = [
  { month: "January", amount: 18600 },
  { month: "February", amount: 30500 },
  { month: "March", amount: 23700 },
  { month: "April", amount: 22300 },
  { month: "May", amount: 20900 },
  { month: "June", amount: 21400 },
]

const chartConfig = {
  amount: {
    label: "Spending (₹)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBarDefault() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending</CardTitle>
        <CardDescription>Total expenses per month, Jan–Jun 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px]  w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Legend content={({ payload }) => (
              payload?.length ? (
                <div className="flex justify-center gap-4 pt-2">
                  {payload.map((entry) => (
                    <span key={entry.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="rounded-sm border-2 border-current opacity-80" style={{ borderColor: entry.color, width: 10, height: 10 }} />
                      {entry.value}
                    </span>
                  ))}
                </div>
              ) : null
            )} />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={8} name="Spending (₹)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Monthly spending trend <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total expenses per month (₹)
        </div>
      </CardFooter>
    </Card>
  )
}
