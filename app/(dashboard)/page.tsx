"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { RefreshCw, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalSpend: number;
  totalLeads: number;
  lastSpendSync: string | null;
  lastLeadsSync: string | null;
}

interface Campaign {
  id: string;
  name: string;
  adAccountName: string;
  type: string;
  spendUsd: number;
  leads: number;
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalSpend: 119870,
    totalLeads: 21475,
    lastSpendSync: null,
    lastLeadsSync: null,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "FB/BG/EN/Lead",
      adAccountName: "Natural Clinic EU",
      type: "Lead",
      spendUsd: 38711.19,
      leads: 5461,
    },
    {
      id: "2",
      name: "FB/PR/Post Promotion WP",
      adAccountName: "Natural Clinic EU",
      type: "Engagement",
      spendUsd: 7580.8,
      leads: 6,
    },
    {
      id: "3",
      name: "FB/RT/Post Promotion WP",
      adAccountName: "Natural Clinic EU",
      type: "Engagement",
      spendUsd: 6926.45,
      leads: 6,
    },
    {
      id: "4",
      name: "FB/BG/IT/Lead",
      adAccountName: "Natural Clinic EU",
      type: "Lead",
      spendUsd: 6883.89,
      leads: 1396,
    },
    {
      id: "5",
      name: "LG-Dental-SP-CBO",
      adAccountName: "Natural Clinic Turkey",
      type: "Lead",
      spendUsd: 6786.13,
      leads: 1778,
    },
    {
      id: "6",
      name: "Aesthetics-IT-001",
      adAccountName: "Natural Clinic Turkey",
      type: "Lead",
      spendUsd: 6849.37,
      leads: 1346,
    },
    {
      id: "7",
      name: "LG-Dental-EN-UK-CBO",
      adAccountName: "Natural Clinic Turkey",
      type: "Lead",
      spendUsd: 4881.76,
      leads: 1896,
    },
  ]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<{ spend: string; leads: string }>({
    spend: "35 minutes ago",
    leads: "3 minutes ago",
  });

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLastSyncTime({
        spend: "Just now",
        leads: "Just now",
      });
    } finally {
      setSyncing(false);
    }
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (accountFilter !== "all" && campaign.adAccountName !== accountFilter) {
      return false;
    }
    if (objectiveFilter !== "all" && campaign.type !== objectiveFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Marketing Spend Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track ad spend and leads across Meta campaigns
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          Sync Meta
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />

        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="Natural Clinic EU">Natural Clinic EU</SelectItem>
            <SelectItem value="Natural Clinic Turkey">Natural Clinic Turkey</SelectItem>
            <SelectItem value="Natural Care">Natural Care</SelectItem>
          </SelectContent>
        </Select>

        <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Objectives" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Objectives</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Engagement">Engagement</SelectItem>
            <SelectItem value="Conversions">Conversions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Circle className="h-2 w-2 fill-green-500 mr-1" />
          Live
        </Badge>
        <span className="text-gray-500">
          Spend: {lastSyncTime.spend}
        </span>
        <span className="text-gray-500">
          Leads: {lastSyncTime.leads}
        </span>
        <Button variant="ghost" size="sm" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
          Sync Now
        </Button>
      </div>

      <StatsCards totalSpend={stats.totalSpend} totalLeads={stats.totalLeads} />

      <CampaignsTable
        campaigns={filteredCampaigns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}
