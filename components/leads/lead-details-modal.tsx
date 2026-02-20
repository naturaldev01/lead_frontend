"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface LeadDetails {
  id: string;
  leadId: string;
  createdAt: string;
  adAccountName: string;
  campaignName: string;
  adSetName: string;
  adName: string;
  formName: string;
  source: string;
  fieldData: Array<{ name: string; values: string[] }>;
}

interface LeadDetailsModalProps {
  lead: LeadDetails | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailsModal({ lead, open, onClose }: LeadDetailsModalProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Lead Details
            <span className="text-sm font-normal text-gray-500">
              {lead.leadId}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Lead ID</p>
              <p className="font-medium">{lead.leadId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source</p>
              <Badge variant="secondary">{lead.source}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{new Date(lead.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ad Account</p>
              <p className="font-medium">{lead.adAccountName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Campaign</p>
              <p className="font-medium">{lead.campaignName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ad Set</p>
              <p className="font-medium">{lead.adSetName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ad</p>
              <p className="font-medium">{lead.adName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Form</p>
              <p className="font-medium">{lead.formName}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Field Data
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  lead.fieldData.map((f) => ({
                    name: f.name,
                    values: f.values,
                  })),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
