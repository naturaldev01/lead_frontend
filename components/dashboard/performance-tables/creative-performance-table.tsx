"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreativePerformance } from "@/lib/api";

interface CreativePerformanceTableProps {
  data: CreativePerformance[];
  loading?: boolean;
}

const formatCurrency = (value: number, currency: string = "EUR") => {
  const symbol = currency === "EUR" ? "€" : "$";
  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  }
  return `${symbol}${value.toFixed(0)}`;
};

export function CreativePerformanceTable({ data, loading }: CreativePerformanceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Creative Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Creative Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No creative data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Creative Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Creative
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Leads
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Deals
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((creative, index) => (
                <tr
                  key={`${creative.adName}-${index}`}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td
                    className="py-2 px-3 text-gray-900 dark:text-white max-w-[250px] truncate"
                    title={creative.adName}
                  >
                    {creative.adName}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {creative.leads.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {creative.deals}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(creative.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
