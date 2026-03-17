"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, RefreshCw, Search, ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL, api, LeadProfile } from "@/lib/api";

const formatMoney = (value: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
};

export default function AllDataPage() {
  const [profiles, setProfiles] = useState<LeadProfile[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    countries: string[];
    sources: string[];
    statuses: string[];
  }>({
    countries: [],
    sources: [],
    statuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  const fetchProfiles = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.getLeadProfiles({
        search: search || undefined,
        country: countryFilter !== "all" ? countryFilter : undefined,
        source: sourceFilter !== "all" ? sourceFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        limit,
      });
      setProfiles(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch lead profiles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, countryFilter, sourceFilter, statusFilter, page, limit]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    api.getLeadProfilesFilterOptions()
      .then(setFilterOptions)
      .catch((error) => {
        console.error("Failed to fetch lead profile filter options:", error);
      });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCountryFilter("all");
    setSourceFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      const searchParams = new URLSearchParams({
        ...(search && { search }),
        ...(countryFilter !== "all" && { country: countryFilter }),
        ...(sourceFilter !== "all" && { source: sourceFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`${API_URL}/api/leads/profiles/export?${searchParams}`);
      if (!response.ok) {
        throw new Error("CSV download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `lead_profiles_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download lead profiles CSV:", error);
    } finally {
      setDownloading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showingFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);
  const hasActiveFilters =
    Boolean(search) || countryFilter !== "all" || sourceFilter !== "all" || statusFilter !== "all";

  const summary = useMemo(() => {
    return {
      rows: total,
    };
  }, [total]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Data
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            `lead_profiles` tablosunun ham ve zenginleştirilmiş kayıt görünümü
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadCsv}
            disabled={loading || refreshing || downloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {hasActiveFilters ? "Filtered CSV" : "Download CSV"}
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchProfiles(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Toplam kayıt</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {summary.rows.toLocaleString("tr-TR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Lead Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative w-full xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="İsim, email, telefon, şehir, country ara..."
                className="pl-9"
              />
            </div>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {filterOptions.countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {filterOptions.sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {filterOptions.statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Temizle
                </Button>
              )}
              <span className="text-sm text-gray-500">Sayfa başına</span>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setPage(1);
                  setLimit(Number(value));
                }}
              >
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead UUID</TableHead>
                  <TableHead>Meta Lead ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Inserted At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Ad Account ID</TableHead>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Offer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={22} className="py-8 text-center text-gray-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={22} className="py-8 text-center text-gray-500">
                      Kayıt bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.leadUuid}>
                      <TableCell className="max-w-[220px] truncate font-mono text-xs">
                        {profile.leadUuid}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {profile.metaLeadId || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDate(profile.createdTime)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDate(profile.insertedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDate(profile.updatedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {profile.adAccountId || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {profile.campaignId || "-"}
                      </TableCell>
                      <TableCell className="text-xs">{profile.source || "-"}</TableCell>
                      <TableCell className="max-w-[180px] truncate font-medium">
                        {profile.fullName || "-"}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs">
                        {profile.firstName || "-"}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs">
                        {profile.lastName || "-"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs">
                        {profile.formName || "-"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs">
                        {profile.email || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {profile.phone || "-"}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs">
                        {profile.city || "-"}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs">
                        {profile.country || "-"}
                      </TableCell>
                      <TableCell className="text-xs">{profile.status || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatMoney(profile.dealAmount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatMoney(profile.offerAmount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatMoney(profile.paymentAmount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {profile.dateOfBirth || "-"}
                      </TableCell>
                      <TableCell
                        className="max-w-[280px] truncate text-xs"
                        title={profile.comments || "-"}
                      >
                        {profile.comments || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {showingFrom}-{showingTo} / {total.toLocaleString("tr-TR")} kayıt
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
