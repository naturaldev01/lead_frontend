"use client";

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
import { Users } from "lucide-react";

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

export function CampaignsTable({
  campaigns,
  searchQuery,
  onSearchChange,
}: CampaignsTableProps) {
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
              <TableHead className="text-right">Spend (USD)</TableHead>
              <TableHead className="text-right">Leads</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No campaigns found
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
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
