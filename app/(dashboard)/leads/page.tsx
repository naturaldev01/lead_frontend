"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadDetailsModal } from "@/components/leads/lead-details-modal";
import { api, Lead, LeadDetails } from "@/lib/api";

export default function LeadsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [campaignIdFilter, setCampaignIdFilter] = useState("");
  const [formNameFilter, setFormNameFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    try {
      const response = await api.getLeads({
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        accountId: accountFilter !== "all" ? accountFilter : undefined,
        campaignId: campaignIdFilter || undefined,
        formName: formNameFilter || undefined,
        search: searchQuery || undefined,
      });

      setLeads(response.data);
      setTotalLeads(response.total);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, accountFilter, campaignIdFilter, formNameFilter, searchQuery]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Incoming Leads
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Recent lead form submissions from Meta campaigns
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />

        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ad Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="Natural Care">Natural Care</SelectItem>
            <SelectItem value="Natural Clinic EU">Natural Clinic EU</SelectItem>
            <SelectItem value="Natural Clinic Turkey">Natural Clinic Turkey</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Filter by campaign ID"
          value={campaignIdFilter}
          onChange={(e) => setCampaignIdFilter(e.target.value)}
          className="w-[180px]"
        />

        <Input
          placeholder="Filter by form name"
          value={formNameFilter}
          onChange={(e) => setFormNameFilter(e.target.value)}
          className="w-[180px]"
        />

        <Input
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[200px]"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Form Submissions
          </CardTitle>
          <span className="text-sm text-gray-500">
            {totalLeads} total
          </span>
        </CardHeader>
        <CardContent>
          <LeadsTable
            leads={leads}
            onViewDetails={handleViewDetails}
            onSync={handleSync}
          />
        </CardContent>
      </Card>

      <LeadDetailsModal
        lead={selectedLead}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
