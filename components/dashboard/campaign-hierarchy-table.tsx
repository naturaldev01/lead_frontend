"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users, Layers, Target, FileText } from "lucide-react";
import { CampaignHierarchy, AdSet, Ad } from "@/lib/api";

interface CampaignHierarchyTableProps {
  campaigns: CampaignHierarchy[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

type ExpandedState = Record<string, boolean>;

export function CampaignHierarchyTable({
  campaigns,
  searchQuery,
  onSearchChange,
  loading = false,
}: CampaignHierarchyTableProps) {
  const [expandedCampaigns, setExpandedCampaigns] = useState<ExpandedState>({});
  const [expandedAdSets, setExpandedAdSets] = useState<ExpandedState>({});

  const toggleCampaign = (campaignId: string) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  const toggleAdSet = (adSetId: string) => {
    setExpandedAdSets((prev) => ({
      ...prev,
      [adSetId]: !prev[adSetId],
    }));
  };

  const expandAll = () => {
    const campaignExpanded: ExpandedState = {};
    const adSetExpanded: ExpandedState = {};
    campaigns.forEach((c) => {
      campaignExpanded[c.campaignId] = true;
      c.adSets.forEach((adSet) => {
        adSetExpanded[adSet.adSetId] = true;
      });
    });
    setExpandedCampaigns(campaignExpanded);
    setExpandedAdSets(adSetExpanded);
  };

  const collapseAll = () => {
    setExpandedCampaigns({});
    setExpandedAdSets({});
  };

  const totalItems = campaigns.reduce(
    (acc, c) => acc + 1 + c.adSets.reduce((a, as) => a + 1 + as.ads.length, 0),
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Campaign Hierarchy
        </CardTitle>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <span className="text-sm text-gray-500">{totalItems} items</span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead>Ad Account</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spend (USD)</TableHead>
                <TableHead className="text-right">Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No campaigns found. Click "Sync Meta" to fetch data.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <CampaignRow
                    key={campaign.campaignId}
                    campaign={campaign}
                    isExpanded={expandedCampaigns[campaign.campaignId] || false}
                    expandedAdSets={expandedAdSets}
                    onToggleCampaign={() => toggleCampaign(campaign.campaignId)}
                    onToggleAdSet={toggleAdSet}
                  />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

interface CampaignRowProps {
  campaign: CampaignHierarchy;
  isExpanded: boolean;
  expandedAdSets: ExpandedState;
  onToggleCampaign: () => void;
  onToggleAdSet: (adSetId: string) => void;
}

function CampaignRow({
  campaign,
  isExpanded,
  expandedAdSets,
  onToggleCampaign,
  onToggleAdSet,
}: CampaignRowProps) {
  const hasAdSets = campaign.adSets.length > 0;

  return (
    <>
      <TableRow className="bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/20">
        <TableCell>
          <div className="flex items-center gap-2">
            {hasAdSets ? (
              <button
                onClick={onToggleCampaign}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{campaign.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span>{campaign.adAccountName}</span>
            <span className="text-xs text-gray-400">{campaign.adAccountId}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Campaign
          </span>
        </TableCell>
        <TableCell>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            {campaign.type || "Active"}
          </span>
        </TableCell>
        <TableCell className="text-right font-medium">
          ${campaign.spendUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Users className="h-4 w-4 text-violet-500" />
            <span className="text-violet-600 font-medium">
              {campaign.leads.toLocaleString("en-US")}
            </span>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded &&
        campaign.adSets.map((adSet) => (
          <AdSetRow
            key={adSet.adSetId}
            adSet={adSet}
            isExpanded={expandedAdSets[adSet.adSetId] || false}
            onToggle={() => onToggleAdSet(adSet.adSetId)}
          />
        ))}
    </>
  );
}

interface AdSetRowProps {
  adSet: AdSet;
  isExpanded: boolean;
  onToggle: () => void;
}

function AdSetRow({ adSet, isExpanded, onToggle }: AdSetRowProps) {
  const hasAds = adSet.ads.length > 0;

  return (
    <>
      <TableRow className="bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/20">
        <TableCell>
          <div className="flex items-center gap-2 pl-8">
            {hasAds ? (
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <Layers className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{adSet.name}</span>
          </div>
        </TableCell>
        <TableCell>-</TableCell>
        <TableCell>
          <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            Ad Set
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              adSet.status === "ACTIVE"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {adSet.status || "Unknown"}
          </span>
        </TableCell>
        <TableCell className="text-right font-medium">
          ${adSet.spendUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </TableCell>
        <TableCell className="text-right text-gray-400">-</TableCell>
      </TableRow>
      {isExpanded &&
        adSet.ads.map((ad) => <AdRow key={ad.adId} ad={ad} />)}
    </>
  );
}

interface AdRowProps {
  ad: Ad;
}

function AdRow({ ad }: AdRowProps) {
  return (
    <TableRow className="bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/50 dark:hover:bg-orange-900/20">
      <TableCell>
        <div className="flex items-center gap-2 pl-16">
          <FileText className="h-4 w-4 text-orange-600" />
          <span>{ad.name}</span>
        </div>
      </TableCell>
      <TableCell>-</TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
          Ad
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            ad.status === "ACTIVE"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {ad.status || "Unknown"}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium">
        ${ad.spendUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </TableCell>
      <TableCell className="text-right text-gray-400">-</TableCell>
    </TableRow>
  );
}
