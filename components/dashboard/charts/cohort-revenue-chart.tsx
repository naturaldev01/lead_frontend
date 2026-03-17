"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, RefreshCw, TrendingUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { api, CohortSummary } from "@/lib/api";

interface CohortRevenueChartProps {
  accountId?: string;
}

const formatMonth = (month: string) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, m] = month.split("-");
  return `${monthNames[parseInt(m) - 1]} ${year}`;
};

const formatRevenue = (value: number) => {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  }
  return `€${value.toFixed(0)}`;
};

const formatNumber = (value: number | undefined | null) => {
  if (value === undefined || value === null) return "-";
  return value.toLocaleString('tr-TR');
};

const getHeatmapClass = (value: number, maxValue: number) => {
  if (value <= 0 || maxValue <= 0) {
    return "bg-gray-50 text-gray-300 dark:bg-gray-900/30 dark:text-gray-600";
  }

  const intensity = value / maxValue;

  if (intensity < 0.2) {
    return "bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-100";
  }
  if (intensity < 0.4) {
    return "bg-blue-200 text-blue-950 dark:bg-blue-900/80 dark:text-blue-100";
  }
  if (intensity < 0.6) {
    return "bg-blue-300 text-blue-950 dark:bg-blue-800/80 dark:text-white";
  }
  if (intensity < 0.8) {
    return "bg-blue-400 text-white dark:bg-blue-700/90 dark:text-white";
  }
  return "bg-blue-600 text-white dark:bg-blue-500 dark:text-white";
};

const COHORT_PRESETS = [
  { label: "Son 6 Ay", months: 6 },
  { label: "Son 12 Ay", months: 12 },
  { label: "2024", year: 2024 },
  { label: "2025", year: 2025 },
];

export function CohortRevenueChart({ accountId }: CohortRevenueChartProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CohortSummary | null>(null);
  const [maxMonths, setMaxMonths] = useState<number>(12);
  const [cohortDateRange, setCohortDateRange] = useState<DateRange | undefined>(() => {
    const end = endOfMonth(new Date());
    const start = startOfMonth(subMonths(end, 11));
    return { from: start, to: end };
  });
  const [activePreset, setActivePreset] = useState<string>("Son 12 Ay");

  const fetchCohortData = useCallback(async () => {
    setLoading(true);
    try {
      const cohortStartDate = cohortDateRange?.from 
        ? format(cohortDateRange.from, "yyyy-MM-dd") 
        : undefined;
      const cohortEndDate = cohortDateRange?.to 
        ? format(cohortDateRange.to, "yyyy-MM-dd") 
        : undefined;

      const result = await api.getCohortRevenue({
        accountId,
        cohortStartDate,
        cohortEndDate,
        maxMonths,
      });
      setData(result);
    } catch (error) {
      console.error("Failed to fetch cohort data:", error);
    } finally {
      setLoading(false);
    }
  }, [accountId, cohortDateRange, maxMonths]);

  useEffect(() => {
    fetchCohortData();
  }, [fetchCohortData]);

  const handlePresetClick = (preset: typeof COHORT_PRESETS[0]) => {
    if (preset.months) {
      const end = endOfMonth(new Date());
      const start = startOfMonth(subMonths(end, preset.months - 1));
      setCohortDateRange({ from: start, to: end });
      setActivePreset(preset.label);
    } else if (preset.year) {
      const start = new Date(preset.year, 0, 1);
      const end = new Date(preset.year, 11, 31);
      setCohortDateRange({ from: start, to: end });
      setActivePreset(preset.label);
    }
  };

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setCohortDateRange(newDate);
    setActivePreset("");
  };

  const displayedMaxMonths = Math.min(data?.maxMonths || maxMonths, maxMonths);

  const { totalLeads, totalRevenueAtLastMonth, maxCellRevenue, totalsByMonth } = useMemo(() => {
    if (!data) {
      return {
        totalLeads: 0,
        totalRevenueAtLastMonth: 0,
        maxCellRevenue: 0,
        totalsByMonth: [],
      };
    }
    
    let leads = 0;
    let lastMonthRevenue = 0;
    let maxRevenue = 0;
    const monthTotals = Array.from({ length: displayedMaxMonths + 1 }, (_, month) => ({
      month,
      revenue: 0,
    }));
    
    for (const cohort of data.cohorts) {
      leads += cohort.leadCount || 0;
      for (const monthData of cohort.monthsData) {
        if (monthData.cumulativeRevenue > maxRevenue) {
          maxRevenue = monthData.cumulativeRevenue;
        }
        if (monthData.month === displayedMaxMonths) {
          lastMonthRevenue += monthData.cumulativeRevenue;
        }
        if (monthData.month <= displayedMaxMonths) {
          monthTotals[monthData.month].revenue += monthData.cumulativeRevenue;
        }
      }
    }
    
    return {
      totalLeads: leads,
      totalRevenueAtLastMonth: lastMonthRevenue,
      maxCellRevenue: maxRevenue,
      totalsByMonth: monthTotals,
    };
  }, [data, displayedMaxMonths]);

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Cohort Revenue Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lead Cohort Revenue Heatmap
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCohortData}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
              Yenile
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Cohort Aralığı:
            </span>
            {COHORT_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={activePreset === preset.label ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={activePreset === "" && cohortDateRange?.from ? "default" : "outline"}
                  size="sm"
                  className="w-[220px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {cohortDateRange?.from ? (
                    cohortDateRange.to ? (
                      <>
                        {format(cohortDateRange.from, "MMM yyyy")} - {format(cohortDateRange.to, "MMM yyyy")}
                      </>
                    ) : (
                      format(cohortDateRange.from, "MMM yyyy")
                    )
                  ) : (
                    <span>Özel Aralık</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={cohortDateRange?.from}
                  selected={cohortDateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 ml-4 border-l pl-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Takip Süresi:
              </span>
              <Select
                value={String(maxMonths)}
                onValueChange={(value) => setMaxMonths(parseInt(value))}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Ay</SelectItem>
                  <SelectItem value="12">12 Ay</SelectItem>
                  <SelectItem value="18">18 Ay</SelectItem>
                  <SelectItem value="24">24 Ay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.cohorts.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Bu aralıkta cohort verisi bulunamadı
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Toplam Cohort
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(data.cohorts.length)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Toplam Lead
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(totalLeads)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Son Ay Kümülatif Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatRevenue(totalRevenueAtLastMonth)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/60">
                    <th className="sticky left-0 z-20 min-w-[120px] border-b border-r bg-gray-50 px-4 py-3 text-left font-medium text-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
                      Cohort
                    </th>
                    <th className="sticky left-[120px] z-20 min-w-[110px] border-b border-r bg-gray-50 px-4 py-3 text-right font-medium text-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
                      Lead Count
                    </th>
                    {Array.from({ length: displayedMaxMonths + 1 }, (_, monthIdx) => (
                      <th
                        key={monthIdx}
                        className="min-w-[96px] border-b border-r px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-200"
                      >
                        Month {monthIdx}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <td className="sticky left-0 z-10 border-r bg-white px-4 py-3 font-semibold text-gray-900 dark:bg-gray-950 dark:text-white">
                      All
                    </td>
                    <td className="sticky left-[120px] z-10 border-r bg-white px-4 py-3 text-right font-semibold text-gray-900 dark:bg-gray-950 dark:text-white">
                      {formatNumber(totalLeads)}
                    </td>
                    {totalsByMonth.map((monthTotal) => (
                      <td
                        key={monthTotal.month}
                        className={cn(
                          "border-r px-3 py-3 text-center font-semibold",
                          getHeatmapClass(
                            monthTotal.revenue,
                            Math.max(
                              ...totalsByMonth.map((item) => item.revenue),
                              0,
                            ),
                          ),
                        )}
                        title={`${formatRevenue(monthTotal.revenue)} total revenue`}
                      >
                        {monthTotal.revenue > 0 ? formatRevenue(monthTotal.revenue) : "-"}
                      </td>
                    ))}
                  </tr>

                  {data.cohorts.map((cohort) => (
                    <tr
                      key={cohort.cohortMonth}
                      className="border-b border-gray-200 dark:border-gray-800"
                    >
                      <td className="sticky left-0 z-10 border-r bg-white px-4 py-3 font-medium text-gray-900 dark:bg-gray-950 dark:text-white">
                        {formatMonth(cohort.cohortMonth)}
                      </td>
                      <td className="sticky left-[120px] z-10 border-r bg-white px-4 py-3 text-right text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                        {formatNumber(cohort.leadCount)}
                      </td>
                      {Array.from({ length: displayedMaxMonths + 1 }, (_, monthIdx) => {
                        const monthData = cohort.monthsData.find((item) => item.month === monthIdx);
                        const value = monthData?.cumulativeRevenue ?? null;

                        return (
                          <td
                            key={monthIdx}
                            className={cn(
                              "border-r px-3 py-3 text-center",
                              value === null
                                ? "bg-white text-transparent dark:bg-gray-950"
                                : getHeatmapClass(value, maxCellRevenue),
                            )}
                            title={
                              value === null
                                ? ""
                                : `${formatMonth(cohort.cohortMonth)} / Month ${monthIdx}: ${formatRevenue(value)}`
                            }
                          >
                            {value === null ? "" : value > 0 ? formatRevenue(value) : "€0"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span>Paylaştığın örneğe benzer şekilde satırlar cohort aylarını, sütunlar ay ofsetlerini gösterir.</span>
          <span className="text-gray-400">|</span>
          <span>Koyu mavi daha yüksek kümülatif revenue yoğunluğunu gösterir.</span>
          <span className="text-gray-400">|</span>
          <span>Month 0 = lead oluşturulduğu ay, Month 1 = +1 ay sonra.</span>
        </div>
      </CardContent>
    </Card>
  );
}
