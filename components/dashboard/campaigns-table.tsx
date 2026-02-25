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
import { Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  adAccountId: string;
  adAccountName: string;
  type: string;
  spendUsd: number;
  leads: number;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type SortField = "spend" | "leads" | null;
type SortDirection = "asc" | "desc";

export function CampaignsTable({
  campaigns,
  searchQuery,
  onSearchChange,
}: CampaignsTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (!sortField) return 0;
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "spend") {
      return (a.spendUsd - b.spendUsd) * multiplier;
    }
    if (sortField === "leads") {
      return (a.leads - b.leads) * multiplier;
    }
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spend & Leads</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64"
          />
          <span className="text-sm text-gray-500">
            {campaigns.length} items
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Ad Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("spend")}
                  className="flex items-center justify-end w-full hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Spend (USD)
                  <SortIcon field="spend" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("leads")}
                  className="flex items-center justify-end w-full hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Leads
                  <SortIcon field="leads" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No campaigns found
                </TableCell>
              </TableRow>
            ) : (
              sortedCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-gray-500">Campaign</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{campaign.adAccountName}</p>
                      <p className="text-xs text-gray-500">act_{campaign.adAccountId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {campaign.type || "Lead"}
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
