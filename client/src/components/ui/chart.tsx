
import * as React from "react"
import { ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
    icon?: React.ComponentType
  }
>

const ChartContext = React.createContext<{
  config: ChartConfig
}>({ config: {} })

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

function ChartContainer({
  id,
  config,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactNode
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart-container
        className={cn(
          "flex aspect-video w-full flex-col justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        style={
          {
            "--color-desktop": "var(--color-desktop)",
            ...Object.entries(config).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [`--color-${key}`]: value?.color,
              }),
              {}
            ),
          } as React.CSSProperties
        }
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltip({
  content,
  ...props
}: React.ComponentProps<typeof Tooltip> & {
  content: React.ReactElement
}) {
  return (
    <Tooltip
      {...props}
      content={({ active, payload, label }) => {
        if (!active || !payload?.length) {
          return null
        }
        return React.isValidElement(content)
          ? React.cloneElement(content as React.ReactElement<{ active?: boolean; payload?: readonly unknown[]; label?: unknown }>, {
              active,
              payload: payload ? [...payload] : [],
              label,
            })
          : null
      }}
    />
  )
}

function ChartTooltipContent({
  hideLabel = false,
  hideIndicator = false,
  indicator = "line",
  nameKey,
  labelKey,
  ...props
}: {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
} & React.ComponentProps<"div">) {
  const { config } = useChart()
  const { label, payload } = props as { label?: string; payload?: { name?: string; value?: string; dataKey?: string; color?: string }[] }

  const tooltipLabel = labelKey && label ? (config[labelKey]?.label ?? label) : label
  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        props.className
      )}
      {...props}
    >
      {!hideLabel && tooltipLabel ? (
        <div className="font-medium text-muted-foreground">{tooltipLabel}</div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item: { name?: string; value?: string; dataKey?: string; color?: string; payload?: Record<string, unknown> }, index) => {
          const key = nameKey ? (item.payload?.[nameKey] ?? item.name) : item.name
          const configItem = key ? config[key as string] : undefined
          const indicatorColor = item.color ?? configItem?.color

          return (
            <div
              key={item.dataKey ?? index}
              className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground"
            >
              {!hideIndicator && indicatorColor ? (
                <div
                  className={cn(
                    "shrink-0 rounded-[2px] border-[2px] border-primary",
                    indicator === "dot" && "rounded-full",
                    indicator === "dashed" && "border-dashed"
                  )}
                  style={{
                    borderColor: indicatorColor,
                  }}
                />
              ) : null}
              <div className="flex flex-1 justify-between leading-none">
                <span className="text-muted-foreground">
                  {(configItem?.label ?? key) as React.ReactNode}
                </span>
                {item.value && (
                  <span className="font-mono font-medium text-foreground">
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
}
