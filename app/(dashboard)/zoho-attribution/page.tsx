"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { FunnelStatsCards } from "@/components/zoho/funnel-stats-cards";
import { FunnelChart } from "@/components/zoho/funnel-chart";
import { AttributionTable } from "@/components/zoho/attribution-table";
import { api, ZohoFunnelStats } from "@/lib/api";

export default function ZohoAttributionPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isAllTime, setIsAllTime] = useState<boolean>(true);
  const [stats, setStats] = useState<ZohoFunnelStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params: { startDate?: string; endDate?: string } = {};
      
      if (!isAllTime && dateRange?.from && dateRange?.to) {
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
        params.endDate = format(dateRange.to, "yyyy-MM-dd");
      }

      const data = await api.zohoFunnelStats(params);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch funnel stats:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, isAllTime]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Zoho Cost Attribution
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track lead costs and funnel progression from Zoho CRM events
          </p>
        </div>
        <Button onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          isAllTime={isAllTime}
          onAllTimeChange={setIsAllTime}
        />
      </div>

      <FunnelStatsCards stats={stats} loading={loading} />

      <FunnelChart stats={stats} loading={loading} />

      <AttributionTable 
        startDate={!isAllTime && dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
        endDate={!isAllTime && dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined}
      />
    </div>
  );
}
