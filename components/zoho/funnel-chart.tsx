"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZohoFunnelStats } from "@/lib/api";

interface FunnelChartProps {
  stats: ZohoFunnelStats | null;
  loading?: boolean;
}

const stageConfig = [
  { key: "lead", label: "Lead", color: "bg-gray-500" },
  { key: "contact", label: "Contact", color: "bg-blue-500" },
  { key: "offer", label: "Offer", color: "bg-yellow-500" },
  { key: "deal", label: "Deal", color: "bg-purple-500" },
  { key: "payment", label: "Payment", color: "bg-green-500" },
];

export function FunnelChart({ stats, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funnel Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = stats?.total ?? 0;

  const getStageCount = (stage: string): number => {
    if (stage === "lead") {
      return total;
    }
    if (stage === "contact") {
      return (stats?.byStage?.contact ?? 0) + (stats?.byStage?.offer ?? 0) + (stats?.byStage?.deal ?? 0) + (stats?.byStage?.payment ?? 0);
    }
    if (stage === "offer") {
      return (stats?.byStage?.offer ?? 0) + (stats?.byStage?.deal ?? 0) + (stats?.byStage?.payment ?? 0);
    }
    if (stage === "deal") {
      return (stats?.byStage?.deal ?? 0) + (stats?.byStage?.payment ?? 0);
    }
    if (stage === "payment") {
      return stats?.byStage?.payment ?? 0;
    }
    return 0;
  };

  const getPercentage = (count: number): number => {
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stageConfig.map((stage) => {
            const count = getStageCount(stage.key);
            const percentage = getPercentage(count);

            return (
              <div key={stage.key} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stage.label}
                </div>
                <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full ${stage.color} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-sm font-medium text-white drop-shadow-sm">
                      {count > 0 && count}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-medium text-gray-500">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        {stats && stats.conversionRates && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Conversion Rates</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-500">Lead → Contact</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.conversionRates.lead_to_contact
                    ? `${(stats.conversionRates.lead_to_contact * 100).toFixed(1)}%`
                    : "-"}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-gray-500">Contact → Deal</p>
                <p className="text-lg font-bold text-purple-600">
                  {stats.conversionRates.contact_to_deal
                    ? `${(stats.conversionRates.contact_to_deal * 100).toFixed(1)}%`
                    : "-"}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-gray-500">Deal → Payment</p>
                <p className="text-lg font-bold text-green-600">
                  {stats.conversionRates.deal_to_payment
                    ? `${(stats.conversionRates.deal_to_payment * 100).toFixed(1)}%`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
