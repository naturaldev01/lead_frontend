"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Phone,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ZohoAttributionItem } from "@/lib/api";

interface AttributionTableProps {
  startDate?: string;
  endDate?: string;
}

const stageBadgeVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  lead: "secondary",
  contact: "outline",
  offer: "outline",
  deal: "default",
  payment: "default",
};

const stageLabels: Record<string, string> = {
  lead: "Lead",
  contact: "Contact",
  offer: "Offer",
  deal: "Deal",
  payment: "Payment",
};

type OfferFilter = "all" | "with_offer" | "without_offer";
type SortBy = "created_at" | "offer_amount" | "deal_amount" | "payment_amount" | "roas";
type SortDirection = "asc" | "desc";

export function AttributionTable({ startDate, endDate }: AttributionTableProps) {
  const [data, setData] = useState<ZohoAttributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [offerFilter, setOfferFilter] = useState<OfferFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const limit = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.zohoAttributionList({
        startDate,
        endDate,
        page,
        limit,
        offerFilter,
        sortBy,
        sortDirection,
      });
      setData(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch attribution list:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, page, offerFilter, sortBy, sortDirection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, offerFilter, sortBy, sortDirection]);

  const formatCurrency = (value: number | null, currency: string = "USD") => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "-";
    if (phone.startsWith("90") && phone.length === 12) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
    }
    return phone.startsWith("+") ? phone : `+${phone}`;
  };

  const toggleAmountSort = (field: Exclude<SortBy, "created_at">) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDirection("desc");
      return;
    }

    setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
  };

  const renderAmountSortIcon = (field: Exclude<SortBy, "created_at">) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  if (loading && data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Zoho Lead Attributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Zoho Lead Attributions
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {total} total records
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attribution data found for this period.
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Select
                value={offerFilter}
                onValueChange={(value: OfferFilter) => setOfferFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Offer filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All records</SelectItem>
                  <SelectItem value="with_offer">With offer amount</SelectItem>
                  <SelectItem value="without_offer">Without offer amount</SelectItem>
                </SelectContent>
              </Select>

              {sortBy !== "created_at" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSortBy("created_at");
                    setSortDirection("desc");
                  }}
                >
                  Clear offer sort
                </Button>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Lead Date</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4" />
                        CPL
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleAmountSort("offer_amount")}
                        className="inline-flex items-center justify-end gap-1 font-medium"
                      >
                        Offer
                        {renderAmountSortIcon("offer_amount")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleAmountSort("deal_amount")}
                        className="inline-flex items-center justify-end gap-1 font-medium"
                      >
                        Deal
                        {renderAmountSortIcon("deal_amount")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleAmountSort("payment_amount")}
                        className="inline-flex items-center justify-end gap-1 font-medium"
                      >
                        Payment
                        {renderAmountSortIcon("payment_amount")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleAmountSort("roas")}
                        className="inline-flex items-center justify-end gap-1 font-medium"
                      >
                        <TrendingUp className="h-4 w-4" />
                        ROAS
                        {renderAmountSortIcon("roas")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {formatPhone(item.phone)}
                      </TableCell>
                      <TableCell>
                        {item.leadDate ? format(new Date(item.leadDate), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.campaignName}>
                        {item.campaignName || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stageBadgeVariants[item.funnelStage] || "secondary"}>
                          {stageLabels[item.funnelStage] || item.funnelStage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.attributedSpend)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.offerAmount, "EUR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.dealAmount, "EUR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.paymentAmount, "EUR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.roas ? (
                          <span className="text-green-600 font-medium">
                            {item.roas.toFixed(1)}x
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
