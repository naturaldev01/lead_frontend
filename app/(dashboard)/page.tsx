"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { RefreshCw, Circle, LayoutList, Layers } from "lucide-react";
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
import { CampaignHierarchyTable } from "@/components/dashboard/campaign-hierarchy-table";
import { HierarchyFilters } from "@/components/dashboard/hierarchy-filters";
import { Badge } from "@/components/ui/badge";
import { api, DashboardStats, Campaign, CampaignHierarchy } from "@/lib/api";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 365),
    to: new Date(),
  });
  const [isAllTime, setIsAllTime] = useState<boolean>(true);
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"flat" | "hierarchy">("hierarchy");
  const [stats, setStats] = useState<DashboardStats>({
    totalSpend: 0,
    totalLeads: 0,
    lastSpendSync: null,
    lastLeadsSync: null,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignHierarchy, setCampaignHierarchy] = useState<CampaignHierarchy[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<{ spend: string; leads: string }>({
    spend: "-",
    leads: "-",
  });
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAllTime && (!dateRange?.from || !dateRange?.to)) return;

    try {
      const startDate = isAllTime ? undefined : format(dateRange!.from!, "yyyy-MM-dd");
      const endDate = isAllTime ? undefined : format(dateRange!.to!, "yyyy-MM-dd");

      const [statsData, campaignsData, hierarchyData] = await Promise.all([
        api.getDashboardStats({
          startDate,
          endDate,
          accountId: accountFilter !== "all" ? accountFilter : undefined,
        }),
        api.getCampaigns({
          startDate,
          endDate,
          accountId: accountFilter !== "all" ? accountFilter : undefined,
          search: searchQuery || undefined,
        }),
        api.getCampaignHierarchy({
          accountId: accountFilter !== "all" ? accountFilter : undefined,
          search: searchQuery || undefined,
          country: countryFilter || undefined,
          level: levelFilter || undefined,
          startDate,
          endDate,
        }),
      ]);

      // Calculate totals from hierarchy data to ensure consistency with filters
      const calculatedTotalSpend = hierarchyData.reduce((sum, c) => sum + (c.spendUsd || 0), 0);
      const calculatedTotalLeads = hierarchyData.reduce((sum, c) => sum + (c.leads || 0), 0);

      setStats({
        ...statsData,
        totalSpend: calculatedTotalSpend,
        totalLeads: calculatedTotalLeads,
      });
      setCampaigns(campaignsData);
      setCampaignHierarchy(hierarchyData);

      if (statsData.lastSpendSync) {
        setLastSyncTime((prev) => ({
          ...prev,
          spend: formatRelativeTime(statsData.lastSpendSync),
        }));
      }
      if (statsData.lastLeadsSync) {
        setLastSyncTime((prev) => ({
          ...prev,
          leads: formatRelativeTime(statsData.lastLeadsSync),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, isAllTime, accountFilter, searchQuery, countryFilter, levelFilter]);

  // Load countries once on mount
  useEffect(() => {
    api.getAvailableCountries()
      .then(setAvailableCountries)
      .catch(() => console.warn("Failed to load countries"));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await api.syncMeta();
      await fetchData();
      setLastSyncTime({
        spend: "Just now",
        leads: "Just now",
      });
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  }, [fetchData]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (accountFilter !== "all" && campaign.adAccountId !== accountFilter) {
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
        <DateRangePicker 
          date={dateRange} 
          onDateChange={setDateRange}
          isAllTime={isAllTime}
          onAllTimeChange={setIsAllTime}
        />

        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ad Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="795450186742642">Natural Clinic EU</SelectItem>
            <SelectItem value="555680213653953">Natural Clinic Turkey</SelectItem>
            <SelectItem value="447318237318335">Natural Care</SelectItem>
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

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">View:</span>
          <Button
            variant={viewMode === "flat" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("flat")}
          >
            <LayoutList className="h-4 w-4 mr-1" />
            Flat
          </Button>
          <Button
            variant={viewMode === "hierarchy" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("hierarchy")}
          >
            <Layers className="h-4 w-4 mr-1" />
            Hierarchy
          </Button>
        </div>
        
        {viewMode === "hierarchy" && (
          <HierarchyFilters
            countries={availableCountries}
            selectedCountry={countryFilter}
            selectedLevel={levelFilter}
            onCountryChange={setCountryFilter}
            onLevelChange={setLevelFilter}
          />
        )}
      </div>

      {viewMode === "flat" ? (
        <CampaignsTable
          campaigns={filteredCampaigns}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
        <CampaignHierarchyTable
          campaigns={campaignHierarchy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
          levelFilter={levelFilter}
        />
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}
