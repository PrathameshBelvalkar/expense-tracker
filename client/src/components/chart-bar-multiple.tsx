"use client"

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
  { month: "January", essential: 12600, other: 6000 },
  { month: "February", essential: 18500, other: 12000 },
  { month: "March", essential: 13700, other: 10000 },
  { month: "April", essential: 12300, other: 10000 },
  { month: "May", essential: 14900, other: 6000 },
  { month: "June", essential: 13400, other: 8000 },
]

const chartConfig = {
  essential: {
    label: "Essential (Rent, Food, Utilities)",
    color: "var(--chart-1)",
  },
  other: {
    label: "Other (Shopping, Entertainment, etc.)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarMultiple() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Type</CardTitle>
        <CardDescription>Essential vs other categories, Jan–Jun 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Legend content={({ payload }) => (
              payload?.length ? (
                <div className="flex justify-center gap-6 pt-2">
                  {payload.map((entry) => (
                    <span key={entry.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="rounded-sm border-2 border-dashed border-current opacity-80" style={{ borderColor: entry.color, width: 10, height: 10 }} />
                      {entry.value}
                    </span>
                  ))}
                </div>
              ) : null
            )} />
            <Bar dataKey="essential" fill="var(--color-essential)" radius={4} name="Essential (Rent, Food, Utilities)" />
            <Bar dataKey="other" fill="var(--color-other)" radius={4} name="Other (Shopping, Entertainment, etc.)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Monthly breakdown by type <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Essential (Rent, Utilities, Food) vs other categories
        </div>
      </CardFooter>
    </Card>
  )
}
