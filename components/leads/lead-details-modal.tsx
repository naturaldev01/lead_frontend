"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

        <Tabs defaultValue="general" className="mt-4">
          <TabsList>
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="meta-form">Meta Form</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-4">
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
                <p className="font-medium">{lead.adAccountName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Campaign</p>
                <p className="font-medium">{lead.campaignName || "-"}</p>
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
                <p className="font-medium">{lead.formName || "-"}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta-form" className="pt-4">
            {lead.fieldData && lead.fieldData.length > 0 ? (
              <div className="space-y-3">
                {lead.fieldData.map((field, index) => (
                  <div key={index} className="border-b border-gray-100 dark:border-gray-800 pb-2 last:border-b-0">
                    <p className="text-sm text-gray-500">{field.name}</p>
                    <p className="font-medium">
                      {field.values && field.values.length > 0
                        ? field.values.join(", ")
                        : "-"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Form verisi bulunamadı.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
