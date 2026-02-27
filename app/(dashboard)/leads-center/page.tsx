"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { LeadDetailsModal } from "@/components/leads/lead-details-modal";
import { api, Lead, LeadDetails, AdAccount } from "@/lib/api";
import { initCityCountryData, getCountryByCitySync } from "@/lib/city-country";
import {
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

type SortField = "createdAt" | "adAccountName" | "campaignName" | "formName";
type SortOrder = "asc" | "desc";

import { LeadFieldData } from "@/lib/api";

function getFieldByMappedName(
  fieldData: LeadFieldData[] | undefined,
  mappedName: string
): string {
  if (!fieldData) return "";
  const field = fieldData.find((f) => f.mappedName === mappedName);
  return field?.values?.[0] || "";
}

function normalizeFieldName(name: string): string {
  return name.toLowerCase().replace(/[\s_-]+/g, "");
}

function getFieldValueFallback(
  fieldData: LeadFieldData[] | undefined,
  ...possibleNames: string[]
): string {
  if (!fieldData) return "";
  
  for (const searchName of possibleNames) {
    const normalizedSearch = normalizeFieldName(searchName);
    const field = fieldData.find(
      (f) => normalizeFieldName(f.name) === normalizedSearch
    );
    if (field && field.values && field.values[0]) {
      return field.values[0];
    }
  }
  return "";
}

function getFullName(fieldData: LeadFieldData[] | undefined): string {
  if (!fieldData) return "";
  
  const fullName = getFieldByMappedName(fieldData, "full_name");
  if (fullName) return fullName;
  
  const firstName = getFieldByMappedName(fieldData, "first_name");
  const lastName = getFieldByMappedName(fieldData, "last_name");
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) return firstName;
  if (lastName) return lastName;
  
  return getFieldValueFallback(fieldData, "full_name", "full name", "name", "first_name");
}

function getEmail(fieldData: LeadFieldData[] | undefined): string {
  const mapped = getFieldByMappedName(fieldData, "email");
  if (mapped) return mapped;
  return getFieldValueFallback(fieldData, "email", "e-mail", "mail");
}

function getPhone(fieldData: LeadFieldData[] | undefined): string {
  const mapped = getFieldByMappedName(fieldData, "phone");
  if (mapped) return mapped;
  return getFieldValueFallback(fieldData, "phone", "phone_number", "tel", "mobile");
}

function getCity(fieldData: LeadFieldData[] | undefined): string {
  if (!fieldData) return "";
  return getFieldByMappedName(fieldData, "city") || 
    getFieldValueFallback(fieldData, "city", "town", "stadt", "ville", "ciudad", "město");
}

function getCountry(fieldData: LeadFieldData[] | undefined, city?: string): string {
  if (!fieldData) return "";
  
  // First try to get country from field data
  const countryFromField = getFieldByMappedName(fieldData, "country") || 
    getFieldValueFallback(fieldData, "country", "land", "pays", "país", "paese");
  
  if (countryFromField) return countryFromField;
  
  // If no country but we have city, try to look up country from city
  const cityValue = city || getCity(fieldData);
  if (cityValue) {
    const countryFromCity = getCountryByCitySync(cityValue);
    if (countryFromCity) return countryFromCity;
  }
  
  return "";
}

function getLocation(fieldData: LeadFieldData[] | undefined): string {
  if (!fieldData) return "";
  
  const city = getCity(fieldData);
  const province = getFieldByMappedName(fieldData, "province") || 
    getFieldValueFallback(fieldData, "province", "state", "region");
  const country = getCountry(fieldData);
  
  const parts = [city, province, country].filter(Boolean);
  return parts.join(", ");
}

export default function LeadsCenterPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 365),
    to: new Date(),
  });
  const [isAllTime, setIsAllTime] = useState(false);
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [campaignIdFilter, setCampaignIdFilter] = useState("");
  const [formNameFilter, setFormNameFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [cityCountryReady, setCityCountryReady] = useState(false);

  useEffect(() => {
    api.getAdAccounts().then(setAdAccounts).catch(console.error);
    // Initialize city-country lookup data and wait for it
    initCityCountryData().then(() => {
      setCityCountryReady(true);
    });
  }, []);

  const fetchLeads = useCallback(async () => {
    if (!isAllTime && (!dateRange?.from || !dateRange?.to)) return;

    setLoading(true);
    try {
      const startDate = isAllTime ? "2000-01-01" : format(dateRange!.from!, "yyyy-MM-dd");
      const endDate = isAllTime ? format(new Date(), "yyyy-MM-dd") : format(dateRange!.to!, "yyyy-MM-dd");
      
      const response = await api.getLeads({
        startDate,
        endDate,
        accountId: accountFilter !== "all" ? accountFilter : undefined,
        campaignId: campaignIdFilter || undefined,
        formName: formNameFilter || undefined,
        search: searchQuery || undefined,
        page,
        limit,
        includeFieldData: true,
      });

      setLeads(response.data);
      setTotalLeads(response.total);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }, [
    dateRange,
    isAllTime,
    accountFilter,
    campaignIdFilter,
    formNameFilter,
    searchQuery,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [accountFilter, campaignIdFilter, formNameFilter, searchQuery, dateRange, isAllTime]);

  const sortedLeads = useMemo(() => {
    const sorted = [...leads];
    sorted.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "adAccountName":
          aVal = a.adAccountName.toLowerCase();
          bVal = b.adAccountName.toLowerCase();
          break;
        case "campaignName":
          aVal = a.campaignName.toLowerCase();
          bVal = b.campaignName.toLowerCase();
          break;
        case "formName":
          aVal = a.formName.toLowerCase();
          bVal = b.formName.toLowerCase();
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, sortField, sortOrder, cityCountryReady]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const handleViewDetails = async (lead: Lead) => {
    try {
      const details = await api.getLeadDetails(lead.id);
      setSelectedLead(details);
      setModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
    }
  };

  const handleSync = async (leadId: string) => {
    try {
      await api.syncLead(leadId);
      await fetchLeads();
    } catch (error) {
      console.error("Failed to sync lead:", error);
    }
  };

  const clearFilters = () => {
    setAccountFilter("all");
    setCampaignIdFilter("");
    setFormNameFilter("");
    setSearchQuery("");
    setDateRange({ from: subDays(new Date(), 365), to: new Date() });
    setIsAllTime(false);
  };

  const hasActiveFilters =
    accountFilter !== "all" ||
    campaignIdFilter ||
    formNameFilter ||
    searchQuery;

  const totalPages = Math.ceil(totalLeads / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leads
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kompakt lead listesi ve gelişmiş filtreleme
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLeads}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtreler
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Temizle
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <DateRangePicker 
              date={dateRange} 
              onDateChange={setDateRange}
              isAllTime={isAllTime}
              onAllTimeChange={setIsAllTime}
            />

            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Ad Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hesaplar</SelectItem>
                {adAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.accountId}>
                    {acc.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Kampanya ID"
              value={campaignIdFilter}
              onChange={(e) => setCampaignIdFilter(e.target.value)}
              className="h-9 text-sm"
            />

            <Input
              placeholder="Form adı"
              value={formNameFilter}
              onChange={(e) => setFormNameFilter(e.target.value)}
              className="h-9 text-sm"
            />

            <Input
              placeholder="Arama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-medium">Lead Listesi</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {totalLeads.toLocaleString("tr-TR")} kayıt
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sayfa başına:</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v))}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead
                    className="cursor-pointer select-none text-xs font-semibold"
                    onClick={() => handleSort("createdAt")}
                  >
                    <span className="flex items-center gap-1">
                      Tarih
                      <SortIcon field="createdAt" />
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Ad Soyad
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      E-posta
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Telefon
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Şehir
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Ülke
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-xs font-semibold"
                    onClick={() => handleSort("formName")}
                  >
                    <span className="flex items-center gap-1">
                      Form
                      <SortIcon field="formName" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-xs font-semibold"
                    onClick={() => handleSort("campaignName")}
                  >
                    <span className="flex items-center gap-1">
                      Kampanya
                      <SortIcon field="campaignName" />
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Kaynak</TableHead>
                  <TableHead className="text-xs font-semibold w-20">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : sortedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      Lead bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLeads.map((lead) => {
                    const displayName = getFullName(lead.fieldData) || "-";
                    const email = getEmail(lead.fieldData);
                    const phone = getPhone(lead.fieldData);
                    const city = getCity(lead.fieldData);
                    const country = getCountry(lead.fieldData, city);

                    return (
                      <TableRow
                        key={lead.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <TableCell className="text-xs whitespace-nowrap py-2">
                          {new Date(lead.createdAt).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-xs py-2 max-w-[140px] truncate font-medium">
                          {displayName}
                        </TableCell>
                        <TableCell className="text-xs py-2 max-w-[180px] truncate text-blue-600 dark:text-blue-400">
                          {email || "-"}
                        </TableCell>
                        <TableCell className="text-xs py-2 max-w-[120px] truncate">
                          {phone || "-"}
                        </TableCell>
                        <TableCell className="text-xs py-2 max-w-[100px] truncate text-gray-600 dark:text-gray-400">
                          {city || "-"}
                        </TableCell>
                        <TableCell className="text-xs py-2 max-w-[100px] truncate text-gray-600 dark:text-gray-400">
                          {country || "-"}
                        </TableCell>
                        <TableCell className="text-xs py-2 max-w-[120px] truncate">
                          {lead.formName}
                        </TableCell>
                        <TableCell className="py-2 max-w-[140px]">
                          <p className="text-xs truncate text-gray-600 dark:text-gray-400">
                            {lead.campaignName}
                          </p>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                          >
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleSync(lead.id)}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleViewDetails(lead)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Sayfa {page} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <LeadDetailsModal
        lead={selectedLead}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
