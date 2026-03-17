"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelSnapshot as FunnelSnapshotType } from "@/lib/api";
import { ArrowDown, ArrowRight } from "lucide-react";

interface FunnelSnapshotProps {
  data: FunnelSnapshotType | null;
  loading?: boolean;
}

const formatNumber = (value: number) => {
  return value.toLocaleString("en-US");
};

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const STAGE_COLORS = {
  Lead: "bg-blue-500",
  Contact: "bg-indigo-500",
  Offer: "bg-purple-500",
  Deal: "bg-amber-500",
  Realization: "bg-emerald-500",
};

export function FunnelSnapshot({ data, loading }: FunnelSnapshotProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funnel Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funnel Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No funnel data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.stages.map((s) => s.count), 1);

  const conversionLabels = [
    { from: "Lead", to: "Contact", rate: data.conversionRates.leadToContact },
    { from: "Contact", to: "Offer", rate: data.conversionRates.contactToOffer },
    { from: "Offer", to: "Deal", rate: data.conversionRates.offerToDeal },
    { from: "Deal", to: "Realization", rate: data.conversionRates.dealToRealization },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Funnel Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual Funnel */}
          <div className="flex flex-col items-center space-y-2">
            {data.stages.map((stage, index) => {
              const width = Math.max(20, (stage.count / maxCount) * 100);
              const color = STAGE_COLORS[stage.stage as keyof typeof STAGE_COLORS] || "bg-gray-500";
              
              return (
                <div key={stage.stage} className="w-full flex flex-col items-center">
                  <div
                    className={`${color} rounded-md py-2 px-4 text-white text-center transition-all`}
                    style={{ width: `${width}%`, minWidth: "120px" }}
                  >
                    <div className="font-medium">{stage.stage}</div>
                    <div className="text-lg font-bold">{formatNumber(stage.count)}</div>
                  </div>
                  {index < data.stages.length - 1 && (
                    <div className="flex items-center text-xs text-gray-500 py-1">
                      <ArrowDown className="h-4 w-4" />
                      <span className="ml-1 font-medium">
                        {formatPercent(conversionLabels[index]?.rate || 0)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conversion Rates Summary */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Conversion Rates
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {conversionLabels.map((conv) => (
                <div
                  key={`${conv.from}-${conv.to}`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    {conv.from} <ArrowRight className="h-3 w-3" /> {conv.to}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPercent(conv.rate)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Costs */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Cost per Stage
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                      Stage
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.stages.map((stage) => (
                    <tr key={stage.stage} className="border-b dark:border-gray-700">
                      <td className="py-2 px-3 text-gray-900 dark:text-white">
                        {stage.stage}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(stage.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
