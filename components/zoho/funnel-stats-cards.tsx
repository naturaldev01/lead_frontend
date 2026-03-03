"use client";

import { Users, UserCheck, FileText, CreditCard, DollarSign, TrendingUp, PiggyBank, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ZohoFunnelStats } from "@/lib/api";

interface FunnelStatsCardsProps {
  stats: ZohoFunnelStats | null;
  loading?: boolean;
}

export function FunnelStatsCards({ stats, loading }: FunnelStatsCardsProps) {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    if (amount >= 1000) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const totalLeads = stats?.byStage?.lead ?? 0;
  const totalContacts = (stats?.byStage?.contact ?? 0) + (stats?.byStage?.offer ?? 0) + (stats?.byStage?.deal ?? 0) + (stats?.byStage?.payment ?? 0);
  const totalDeals = (stats?.byStage?.deal ?? 0) + (stats?.byStage?.payment ?? 0);
  const totalPayments = stats?.byStage?.payment ?? 0;

  const funnelCards = [
    {
      title: "Leads",
      value: stats?.total ?? 0,
      subValue: "100%",
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-800",
    },
    {
      title: "Contacts",
      value: totalContacts,
      subValue: stats?.total ? formatPercent(totalContacts / stats.total) : "0%",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Deals",
      value: totalDeals,
      subValue: stats?.total ? formatPercent(totalDeals / stats.total) : "0%",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Payments",
      value: totalPayments,
      subValue: stats?.total ? formatPercent(totalPayments / stats.total) : "0%",
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  const metricsCards = [
    {
      title: "Avg Cost/Lead",
      value: formatCurrency(stats?.avgSpend ?? 0),
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue ?? 0, "EUR"),
      icon: PiggyBank,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Total Spend",
      value: formatCurrency(stats?.totalSpend ?? 0),
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Avg ROAS",
      value: stats?.avgRoas ? `${stats.avgRoas.toFixed(1)}x` : "-",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Funnel Stages</h3>
        <div className="grid grid-cols-4 gap-4">
          {funnelCards.map((card) => (
            <Card key={card.title} className={card.bgColor}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-gray-400">{card.subValue}</p>
                  </div>
                  <card.icon className={`h-8 w-8 ${card.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Metrics</h3>
        <div className="grid grid-cols-4 gap-4">
          {metricsCards.map((card) => (
            <Card key={card.title} className={card.bgColor}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <card.icon className={`h-8 w-8 ${card.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
