"use client";

import { useState } from "react";
import { Search, Phone, DollarSign, TrendingUp, Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ZohoLookupResult } from "@/lib/api";

const stageColors: Record<string, string> = {
  lead: "bg-gray-100 text-gray-800",
  contact: "bg-blue-100 text-blue-800",
  offer: "bg-yellow-100 text-yellow-800",
  deal: "bg-purple-100 text-purple-800",
  payment: "bg-green-100 text-green-800",
};

const stageLabels: Record<string, string> = {
  lead: "Lead",
  contact: "Contact",
  offer: "Offer",
  deal: "Deal",
  payment: "Payment",
};

export function PhoneLookupCard() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ZohoLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.zohoLookup(phone.trim());
      setResult(data);
    } catch (err) {
      setError((err as Error).message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="+90 555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading || !phone.trim()}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && !result.found && (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
            No lead found for this phone number
          </div>
        )}

        {result && result.found && result.lead && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Lead Found</h3>
              {result.funnel?.currentStage && (
                <Badge className={stageColors[result.funnel.currentStage] || "bg-gray-100"}>
                  {stageLabels[result.funnel.currentStage] || result.funnel.currentStage}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Campaign
                </p>
                <p className="font-medium text-sm">{result.lead.campaign || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Lead Date
                </p>
                <p className="font-medium text-sm">{formatDate(result.lead.date)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Ad Set</p>
                <p className="font-medium text-sm">{result.lead.adSet || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Ad</p>
                <p className="font-medium text-sm">{result.lead.ad || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Form</p>
                <p className="font-medium text-sm">{result.lead.form || "-"}</p>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <DollarSign className="h-3 w-3" /> Cost
                </p>
                <p className="font-bold text-lg text-blue-600">
                  {result.costs ? formatCurrency(result.costs.attributedSpend, result.costs.currency) : "-"}
                </p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500">Deal Amount</p>
                <p className="font-bold text-lg text-purple-600">
                  {result.funnel?.dealAmount ? formatCurrency(result.funnel.dealAmount, "EUR") : "-"}
                </p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" /> ROAS
                </p>
                <p className="font-bold text-lg text-green-600">
                  {result.roas ? `${result.roas.toFixed(1)}x` : "-"}
                </p>
              </div>
            </div>

            {result.funnel?.stages && (
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">Funnel Progress</p>
                <div className="flex gap-2">
                  {["lead", "contact", "offer", "deal", "payment"].map((stage) => {
                    const stageDate = result.funnel?.stages?.[stage as keyof typeof result.funnel.stages];
                    const isCompleted = !!stageDate;
                    return (
                      <div
                        key={stage}
                        className={`flex-1 text-center p-2 rounded text-xs ${
                          isCompleted
                            ? stageColors[stage]
                            : "bg-gray-100 text-gray-400 dark:bg-gray-700"
                        }`}
                      >
                        <p className="font-medium capitalize">{stage}</p>
                        <p className="text-[10px]">{stageDate ? formatDate(stageDate) : "-"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
