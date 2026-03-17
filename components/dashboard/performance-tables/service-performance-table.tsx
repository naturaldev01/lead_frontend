"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicePerformance } from "@/lib/api";

interface ServicePerformanceTableProps {
  data: ServicePerformance[];
  loading?: boolean;
}

const formatCurrency = (value: number, currency: string = "USD") => {
  const symbol = currency === "EUR" ? "€" : "$";
  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  }
  return `${symbol}${value.toFixed(0)}`;
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatRoas = (value: number) => {
  return `${value.toFixed(2)}x`;
};

const SERVICE_COLORS: Record<string, string> = {
  Dental: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Hair: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Rhinoplasty: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  BBL: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Facelift: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  Liposuction: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  Breast: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "Tummy Tuck": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export function ServicePerformanceTable({ data, loading }: ServicePerformanceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Performance</CardTitle>
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
          <CardTitle className="text-lg">Service Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No service data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Service
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Leads
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Deals
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Lead to Deal
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Revenue
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((service) => (
                <tr
                  key={service.service}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        SERVICE_COLORS[service.service] || SERVICE_COLORS.Other
                      }`}
                    >
                      {service.service}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {service.leads.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {service.deals}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {formatPercent(service.leadToDealRate)}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(service.revenue, "EUR")}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`font-medium ${
                        service.roas >= 3
                          ? "text-emerald-600 dark:text-emerald-400"
                          : service.roas >= 1
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatRoas(service.roas)}
                    </span>
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
