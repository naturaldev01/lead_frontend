"use client";

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
import { RefreshCw, Eye } from "lucide-react";

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

interface LeadsTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onSync: (leadId: string) => void;
}

export function LeadsTable({ leads, onViewDetails, onSync }: LeadsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Created</TableHead>
          <TableHead>Ad Account</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Ad Set</TableHead>
          <TableHead>Ad</TableHead>
          <TableHead>Form</TableHead>
          <TableHead>Lead ID</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
              No leads found
            </TableCell>
          </TableRow>
        ) : (
          leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(lead.createdAt).toLocaleString("sv-SE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>{lead.adAccountName}</TableCell>
              <TableCell>
                <div className="max-w-[150px]">
                  <p className="font-medium truncate">{lead.campaignName}</p>
                  <p className="text-xs text-gray-500 truncate">{lead.campaignId}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="truncate block max-w-[120px]">
                  {lead.adSetName || "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="truncate block max-w-[120px]">
                  {lead.adName || "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="truncate block max-w-[120px]">
                  {lead.formName}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono truncate block max-w-[100px]">
                  {lead.leadId}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                  {lead.source}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSync(lead.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(lead)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
