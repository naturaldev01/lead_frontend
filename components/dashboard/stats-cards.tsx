"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  Target, 
  Handshake, 
  TrendingUp, 
  Calculator,
  Percent,
  CreditCard,
  FileText,
  Banknote
} from "lucide-react";
import { DashboardStatsV2 } from "@/lib/api";

interface StatsCardsProps {
  totalSpend: number;
  totalLeads: number;
}

interface StatsCardsV2Props {
  stats: DashboardStatsV2;
}

export function StatsCards({ totalSpend, totalLeads }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Spend
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                USD invested in ads
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Leads
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalLeads.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Form submissions
              </p>
            </div>
            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/20">
              <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

function KPICard({ title, value, subtitle, icon, iconBgClass, iconColorClass }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {subtitle}
            </p>
          </div>
          <div className={`rounded-full p-2 ml-2 shrink-0 ${iconBgClass}`}>
            <div className={iconColorClass}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCardsV2({ stats }: StatsCardsV2Props) {
  const formatCurrency = (value: number, currency: string = "USD") => {
    if (currency === "EUR") {
      return `€${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatRoas = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
      <KPICard
        title="Spend"
        value={formatCurrency(stats.spend)}
        subtitle="Meta Ads"
        icon={<DollarSign className="h-4 w-4" />}
        iconBgClass="bg-green-100 dark:bg-green-900/20"
        iconColorClass="text-green-600 dark:text-green-400"
      />

      <KPICard
        title="Leads"
        value={stats.leads.toLocaleString("en-US")}
        subtitle="Meta Leads"
        icon={<Users className="h-4 w-4" />}
        iconBgClass="bg-violet-100 dark:bg-violet-900/20"
        iconColorClass="text-violet-600 dark:text-violet-400"
      />

      <KPICard
        title="CPL"
        value={formatCurrency(stats.cpl)}
        subtitle="Cost per Lead"
        icon={<Target className="h-4 w-4" />}
        iconBgClass="bg-blue-100 dark:bg-blue-900/20"
        iconColorClass="text-blue-600 dark:text-blue-400"
      />

      <KPICard
        title="Deals"
        value={stats.deals.toLocaleString("en-US")}
        subtitle="Zoho Deals"
        icon={<Handshake className="h-4 w-4" />}
        iconBgClass="bg-amber-100 dark:bg-amber-900/20"
        iconColorClass="text-amber-600 dark:text-amber-400"
      />

      <KPICard
        title="Revenue"
        value={formatCurrency(stats.revenue, "EUR")}
        subtitle="Deal Value"
        icon={<Banknote className="h-4 w-4" />}
        iconBgClass="bg-emerald-100 dark:bg-emerald-900/20"
        iconColorClass="text-emerald-600 dark:text-emerald-400"
      />

      <KPICard
        title="ROAS"
        value={formatRoas(stats.roas)}
        subtitle="Revenue / Spend"
        icon={<TrendingUp className="h-4 w-4" />}
        iconBgClass="bg-indigo-100 dark:bg-indigo-900/20"
        iconColorClass="text-indigo-600 dark:text-indigo-400"
      />

      <KPICard
        title="Lead to Deal"
        value={formatPercent(stats.leadToDealRate)}
        subtitle="Conversion Rate"
        icon={<Percent className="h-4 w-4" />}
        iconBgClass="bg-pink-100 dark:bg-pink-900/20"
        iconColorClass="text-pink-600 dark:text-pink-400"
      />

      <KPICard
        title="Cost per Deal"
        value={formatCurrency(stats.costPerDeal)}
        subtitle="Spend / Deals"
        icon={<CreditCard className="h-4 w-4" />}
        iconBgClass="bg-orange-100 dark:bg-orange-900/20"
        iconColorClass="text-orange-600 dark:text-orange-400"
      />

      <KPICard
        title="Avg. Offer"
        value={formatCurrency(stats.avgOfferAmount, "EUR")}
        subtitle="Offer Amount"
        icon={<FileText className="h-4 w-4" />}
        iconBgClass="bg-cyan-100 dark:bg-cyan-900/20"
        iconColorClass="text-cyan-600 dark:text-cyan-400"
      />

      <KPICard
        title="Avg. Deal"
        value={formatCurrency(stats.avgDealAmount, "EUR")}
        subtitle="Deal Amount"
        icon={<Calculator className="h-4 w-4" />}
        iconBgClass="bg-teal-100 dark:bg-teal-900/20"
        iconColorClass="text-teal-600 dark:text-teal-400"
      />
    </div>
  );
}
