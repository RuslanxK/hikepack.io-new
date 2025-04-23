"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Users } from "lucide-react"; // Users icon for live users



import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartData = [
  { date: "2010-01-01", desktop: 1000, mobile: 900 },
  { date: "2015-01-01", desktop: 850, mobile: 750 },
  { date: "2018-06-15", desktop: 600, mobile: 500 },
  { date: "2019-04-01", desktop: 700, mobile: 650 },
  { date: "2020-01-01", desktop: 800, mobile: 700 },
  { date: "2021-06-30", desktop: 1000, mobile: 850 },
  { date: "2022-05-15", desktop: 1100, mobile: 900 },
  { date: "2023-06-01", desktop: 350, mobile: 300 },
  { date: "2024-01-15", desktop: 450, mobile: 400 },
  { date: "2024-03-10", desktop: 700, mobile: 600 },
  { date: "2024-06-30", desktop: 446, mobile: 420 },
  { date: "2024-09-15", desktop: 850, mobile: 750 },
  { date: "2024-12-15", desktop: 1100, mobile: 950 },
  { date: "2025-01-01", desktop: 1200, mobile: 1000 },
  { date: "2025-01-10", desktop: 1100, mobile: 950 },
  { date: "2025-01-15", desktop: 1300, mobile: 1100 },
  { date: "2025-01-20", desktop: 1400, mobile: 1200 },
  { date: "2025-01-25", desktop: 1500, mobile: 1300 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface LineChartAdminProps {
  liveUsers: number;
}


export function LineChartAdmin({ liveUsers }: LineChartAdminProps) {
  const [timeRange, setTimeRange] = React.useState("all");

  

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date();
    let startDate: Date | null = null;

    switch (timeRange) {
      case "today":
        startDate = new Date(referenceDate.toDateString());
        break;
      case "7d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1y":
        startDate = new Date(referenceDate);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "5y":
        startDate = new Date(referenceDate);
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      case "all":
        return chartData; // Show all data
      default:
        return chartData;
    }

    return chartData.filter((item) => {
      const itemDate = new Date(item.date);
      if (timeRange === "today") {
        return itemDate.toDateString() === referenceDate.toDateString();
      }
      return startDate ? itemDate >= startDate && itemDate <= referenceDate : true;
    });
  }, [timeRange]);

  const label = React.useMemo(() => {
    switch (timeRange) {
      case "today":
        return "Today";
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 3 Months";
      case "1y":
        return "Last Year";
      case "5y":
        return "Last 5 Years";
      case "all":
        return "All Time";
      default:
        return "Last 3 Months";
    }
  }, [timeRange]);

  return (
    <Card className="dark:bg-dark-box">
      <CardHeader className="flex items-center gap-4 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>Showing total visitors for {label}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <p className="text-gray-700 dark:text-gray-300">
            Live Users: <span className="font-medium">{liveUsers}</span>
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto dark:bg-dark"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="today" className="rounded-lg">
              Today
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 Days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 Days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 3 Months
            </SelectItem>
            <SelectItem value="1y" className="rounded-lg">
              Last Year
            </SelectItem>
            <SelectItem value="5y" className="rounded-lg">
              Last 5 Years
            </SelectItem>
            <SelectItem value="all" className="rounded-lg">
              All Time
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="date"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
