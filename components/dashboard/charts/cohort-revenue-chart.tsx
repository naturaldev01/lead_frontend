"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CohortSummary } from "@/lib/api";

interface CohortRevenueChartProps {
  data: CohortSummary | null;
  loading?: boolean;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
];

const formatMonth = (month: string) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, m] = month.split("-");
  return `${monthNames[parseInt(m) - 1]} ${year.slice(2)}`;
};

const formatRevenue = (value: number) => {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  }
  return `€${value.toFixed(0)}`;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-h-[300px] overflow-y-auto">
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          Month {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 truncate">{entry.name}:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatRevenue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function CohortRevenueChart({ data, loading }: CohortRevenueChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Cohort Revenue Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Cohort Revenue Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No cohort data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData: any[] = [];
  const maxMonths = data.maxMonths;

  for (let month = 0; month <= maxMonths; month++) {
    const point: any = { month };
    for (const cohort of data.cohorts) {
      const monthData = cohort.monthsData.find((m) => m.month === month);
      if (monthData) {
        point[cohort.cohortMonth] = monthData.cumulativeRevenue;
      }
    }
    chartData.push(point);
  }

  // Get last 12 cohorts for display
  const displayCohorts = data.cohorts.slice(-12);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lead Cohort Revenue Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => `M${value}`}
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickFormatter={formatRevenue}
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => formatMonth(value)}
                wrapperStyle={{ fontSize: 11 }}
              />
              {displayCohorts.map((cohort, index) => (
                <Line
                  key={cohort.cohortMonth}
                  type="monotone"
                  dataKey={cohort.cohortMonth}
                  name={cohort.cohortMonth}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
