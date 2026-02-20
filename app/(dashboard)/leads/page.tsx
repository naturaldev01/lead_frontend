"use client";

import { useState } from "react";
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

interface Lead {
  id: string;
  leadId: string;
  createdAt: string;
  adAccountName: string;
  campaignId: string;
  campaignName: string;
  adSetName: string;
  adName: string;
  formName: string;
  source: string;
}

interface LeadDetails extends Lead {
  fieldData: Array<{ name: string; values: string[] }>;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    leadId: "1797878864299926",
    createdAt: "2026-02-20T09:33:00Z",
    adAccountName: "Natural Care",
    campaignId: "120241246778850391",
    campaignName: "FB/BG/GR/Lead",
    adSetName: "RT GR Woman De...",
    adName: "GR_Dental_Hollyw...",
    formName: "All-GR-More-Volume-...",
    source: "sync",
  },
  {
    id: "2",
    leadId: "1214140390482518",
    createdAt: "2026-02-20T09:07:00Z",
    adAccountName: "Natural Clinic Tu...",
    campaignId: "120239476580880391",
    campaignName: "FB/PR/Influencer/R...",
    adSetName: "Raul",
    adName: "IT_Dental_Hollyw...",
    formName: "All-IT-More-Volume-0...",
    source: "sync",
  },
  {
    id: "3",
    leadId: "86827960290599",
    createdAt: "2026-02-20T08:50:00Z",
    adAccountName: "Natural Care",
    campaignId: "-",
    campaignName: "-",
    adSetName: "-",
    adName: "-",
    formName: "All-EN-More-Volume-...",
    source: "sync",
  },
  {
    id: "4",
    leadId: "64501746189929",
    createdAt: "2026-02-20T08:48:00Z",
    adAccountName: "Natural Care",
    campaignId: "120235865977660391",
    campaignName: "FB/BG/EN/Lead",
    adSetName: "PR Man Hair Look...",
    adName: "EN_Hair_DHI_VI...",
    formName: "All-EN-More-Volume-...",
    source: "sync",
  },
  {
    id: "5",
    leadId: "64501746189930",
    createdAt: "2026-02-20T08:48:00Z",
    adAccountName: "Natural Care",
    campaignId: "120235865977660391",
    campaignName: "FB/BG/EN/Lead",
    adSetName: "RT EN Man Lead - ...",
    adName: "EN_Dental_Hollyw...",
    formName: "All-EN-More-Volume-...",
    source: "sync",
  },
  {
    id: "6",
    leadId: "179432951782517",
    createdAt: "2026-02-20T08:38:00Z",
    adAccountName: "Natural Clinic EU",
    campaignId: "120233357336630107",
    campaignName: "LG-Hair-004",
    adSetName: "LG-Hair-EN-EU",
    adName: "EN_Hair_Stem-Cel...",
    formName: "All-EN-More-Volume-...",
    source: "sync",
  },
  {
    id: "7",
    leadId: "1858082449771046",
    createdAt: "2026-02-20T08:34:00Z",
    adAccountName: "Natural Care",
    campaignId: "120239468287010391",
    campaignName: "FB/PR/Influencer",
    adSetName: "Souhail AR",
    adName: "AR_Dental_Hollyw...",
    formName: "All-AR-More-Volume-...",
    source: "sync",
  },
  {
    id: "8",
    leadId: "81370742140304",
    createdAt: "2026-02-20T08:22:00Z",
    adAccountName: "Natural Clinic EU",
    campaignId: "120212581705730107",
    campaignName: "Recruitment-HR",
    adSetName: "Sales-Agents-Istan...",
    adName: "Sales-001",
    formName: "HR-EN-SALES-003",
    source: "sync",
  },
];

const mockLeadDetails: LeadDetails = {
  id: "1",
  leadId: "1797878864299926",
  createdAt: "2026-02-20T09:33:00Z",
  adAccountName: "Natural Care",
  campaignId: "120241246778850391",
  campaignName: "FB/BG/GR/Lead",
  adSetName: "RT GR Woman Dental",
  adName: "GR_Dental_Hollywood-Smile_EU_Video-031",
  formName: "All-GR-More-Volume-...",
  source: "sync",
  fieldData: [
    { name: "full_name", values: ["Ana Levitt"] },
    { name: "e-mail-adresse", values: ["analevitt@gmail.com"] },
    { name: "telefonnummer", values: ["+19542255888"] },
    { name: "stadt", values: ["Vicenza"] },
    { name: "sie_können_gerne_kommentare,_fragen_oder_zusätzliche...", values: ["Ana"] },
  ],
};

export default function LeadsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [campaignIdFilter, setCampaignIdFilter] = useState("");
  const [formNameFilter, setFormNameFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead({
      ...lead,
      fieldData: mockLeadDetails.fieldData,
    });
    setModalOpen(true);
  };

  const handleSync = (leadId: string) => {
    console.log("Syncing lead:", leadId);
  };

  const filteredLeads = mockLeads.filter((lead) => {
    if (accountFilter !== "all" && lead.adAccountName !== accountFilter) {
      return false;
    }
    if (campaignIdFilter && !lead.campaignId.includes(campaignIdFilter)) {
      return false;
    }
    if (formNameFilter && !lead.formName.toLowerCase().includes(formNameFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        lead.leadId.toLowerCase().includes(search) ||
        lead.formName.toLowerCase().includes(search) ||
        lead.campaignName.toLowerCase().includes(search)
      );
    }
    return true;
  });

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
            <SelectItem value="Natural Clinic Tu...">Natural Clinic Turkey</SelectItem>
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
            {filteredLeads.length} total
          </span>
        </CardHeader>
        <CardContent>
          <LeadsTable
            leads={filteredLeads}
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
