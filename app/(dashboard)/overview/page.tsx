"use client";

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { RefreshCw, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCardsV2 } from "@/components/dashboard/stats-cards";
import { GlobalFilters } from "@/components/dashboard/global-filters";
import { FunnelSnapshot } from "@/components/dashboard/funnel-snapshot";
import {
  SpendVsRevenueChart,
  LeadTrendChart,
  RevenueByDealDateChart,
} from "@/components/dashboard/charts";
import {
  CampaignPerformanceTable,
  ServicePerformanceTable,
  CreativePerformanceTable,
} from "@/components/dashboard/performance-tables";
import {
  api,
  invalidateDashboardCache,
  DashboardStatsV2,
  SpendVsRevenueData,
  LeadTrendData,
  RevenueByDealDateData,
  CampaignPerformance,
  ServicePerformance,
  CreativePerformance,
  FunnelSnapshot as FunnelSnapshotType,
} from "@/lib/api";
import { logDashboardMetrics } from "@/lib/perf-timing";

const CohortRevenueChart = lazy(() => 
  import("@/components/dashboard/charts/cohort-revenue-chart").then(mod => ({ default: mod.CohortRevenueChart }))
);

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 365),
    to: new Date(),
  });
  const [isAllTime, setIsAllTime] = useState<boolean>(true);
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  const [stats, setStats] = useState<DashboardStatsV2 | null>(null);
  const [spendVsRevenue, setSpendVsRevenue] = useState<SpendVsRevenueData[]>([]);
  const [leadTrend, setLeadTrend] = useState<LeadTrendData[]>([]);
  const [revenueByDealDate, setRevenueByDealDate] = useState<RevenueByDealDateData[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([]);
  const [servicePerformance, setServicePerformance] = useState<ServicePerformance[]>([]);
  const [creativePerformance, setCreativePerformance] = useState<CreativePerformance[]>([]);
  const [funnelSnapshot, setFunnelSnapshot] = useState<FunnelSnapshotType | null>(null);

  const [lastSyncTime, setLastSyncTime] = useState<{ spend: string; leads: string }>({
    spend: "-",
    leads: "-",
  });

  const filterParams = useMemo(() => {
    const startDate = isAllTime ? undefined : (dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined);
    const endDate = isAllTime ? undefined : (dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined);
    const accountId = accountFilter !== "all" ? accountFilter : undefined;
    const country = countryFilter !== "all" ? countryFilter : undefined;
    const service = serviceFilter !== "all" ? serviceFilter : undefined;
    const language = languageFilter !== "all" ? languageFilter : undefined;
    return { startDate, endDate, accountId, country, service, language };
  }, [dateRange, isAllTime, accountFilter, countryFilter, serviceFilter, languageFilter]);

  const fetchData = useCallback(async () => {
    if (!isAllTime && (!dateRange?.from || !dateRange?.to)) return;

    setLoading(true);
    const totalStart = performance.now();

    try {
      const { startDate, endDate, accountId, country, service, language } = filterParams;

      const [
        statsData,
        spendVsRevenueData,
        leadTrendData,
        revenueByDealDateData,
        campaignPerformanceData,
        servicePerformanceData,
        creativePerformanceData,
        funnelSnapshotData,
      ] = await Promise.all([
        api.getDashboardStatsV2({ startDate, endDate, accountId, country, service, language }),
        api.getSpendVsRevenue({ startDate, endDate, accountId }),
        api.getLeadTrend({ startDate, endDate, accountId, granularity: "month" }),
        api.getRevenueByDealDate({ startDate, endDate, accountId }),
        api.getCampaignPerformance({ startDate, endDate, accountId, limit: 10 }),
        api.getServicePerformance({ startDate, endDate, accountId }),
        api.getCreativePerformance({ startDate, endDate, accountId, limit: 10 }),
        api.getFunnelSnapshot({ startDate, endDate, accountId }),
      ]);

      setStats(statsData);
      setSpendVsRevenue(spendVsRevenueData);
      setLeadTrend(leadTrendData);
      setRevenueByDealDate(revenueByDealDateData);
      setCampaignPerformance(campaignPerformanceData);
      setServicePerformance(servicePerformanceData);
      setCreativePerformance(creativePerformanceData);
      setFunnelSnapshot(funnelSnapshotData);

      if (statsData.lastSpendSync) {
        setLastSyncTime((prev) => ({ ...prev, spend: formatRelativeTime(statsData.lastSpendSync) }));
      }
      if (statsData.lastLeadsSync) {
        setLastSyncTime((prev) => ({ ...prev, leads: formatRelativeTime(statsData.lastLeadsSync) }));
      }

      const totalTime = performance.now() - totalStart;
      logDashboardMetrics({ totalTime, chartsTime: totalTime, tablesTime: 0 });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, isAllTime, filterParams]);

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
      invalidateDashboardCache();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Marketing Overview Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track spend, leads, and revenue performance
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          Sync Meta
        </Button>
      </div>

      {/* Sync Status */}
      <div className="flex items-center gap-4 text-sm">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Circle className="h-2 w-2 fill-green-500 mr-1" />
          Live
        </Badge>
        <span className="text-gray-500">Spend: {lastSyncTime.spend}</span>
        <span className="text-gray-500">Leads: {lastSyncTime.leads}</span>
      </div>

      {/* Global Filters */}
      <GlobalFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isAllTime={isAllTime}
        onAllTimeChange={setIsAllTime}
        accountFilter={accountFilter}
        onAccountFilterChange={setAccountFilter}
        countryFilter={countryFilter}
        onCountryFilterChange={setCountryFilter}
        serviceFilter={serviceFilter}
        onServiceFilterChange={setServiceFilter}
        languageFilter={languageFilter}
        onLanguageFilterChange={setLanguageFilter}
        availableCountries={availableCountries}
      />

      {/* KPI Cards */}
      {stats && <StatsCardsV2 stats={stats} />}

      {/* Charts Row 1: Spend vs Revenue + Revenue by Deal Date */}
      <div className="grid gap-6 md:grid-cols-2">
        <SpendVsRevenueChart data={spendVsRevenue} loading={loading} />
        <RevenueByDealDateChart data={revenueByDealDate} loading={loading} />
      </div>

      {/* Lead Trend Chart */}
      <LeadTrendChart data={leadTrend} loading={loading} />

      {/* Cohort Revenue Table - Full Width with Independent Filters (lazy loaded) */}
      <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-gray-500">Loading cohort data...</div>}>
        <CohortRevenueChart accountId={accountFilter !== "all" ? accountFilter : undefined} />
      </Suspense>

      {/* Funnel Snapshot */}
      <FunnelSnapshot data={funnelSnapshot} loading={loading} />

      {/* Performance Tables */}
      <CampaignPerformanceTable data={campaignPerformance} loading={loading} />

      <div className="grid gap-6 md:grid-cols-2">
        <ServicePerformanceTable data={servicePerformance} loading={loading} />
        <CreativePerformanceTable data={creativePerformance} loading={loading} />
      </div>
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
