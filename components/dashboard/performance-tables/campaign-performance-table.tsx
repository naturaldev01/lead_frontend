"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignPerformance } from "@/lib/api";

interface CampaignPerformanceTableProps {
  data: CampaignPerformance[];
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

export function CampaignPerformanceTable({ data, loading }: CampaignPerformanceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
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
          <CardTitle className="text-lg">Top 10 Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No campaign data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top 10 Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Campaign
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                  Spend
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
              {data.map((campaign) => (
                <tr
                  key={campaign.campaignId}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-2 px-3 text-gray-900 dark:text-white max-w-[200px] truncate" title={campaign.campaignName}>
                    {campaign.campaignName}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {formatCurrency(campaign.spend)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {campaign.leads.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {campaign.deals}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-white">
                    {formatPercent(campaign.leadToDealRate)}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(campaign.revenue, "EUR")}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`font-medium ${
                        campaign.roas >= 3
                          ? "text-emerald-600 dark:text-emerald-400"
                          : campaign.roas >= 1
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatRoas(campaign.roas)}
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
