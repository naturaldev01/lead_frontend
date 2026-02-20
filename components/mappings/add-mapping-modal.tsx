"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface MappingRule {
  sourceField: string;
  sourceValue: string;
  targetEntity: string;
  targetId: string;
}

interface AddMappingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, rules: MappingRule[]) => void;
}

export function AddMappingModal({ open, onClose, onSave }: AddMappingModalProps) {
  const [name, setName] = useState("");
  const [rules, setRules] = useState<MappingRule[]>([
    { sourceField: "", sourceValue: "", targetEntity: "", targetId: "" },
  ]);

  const handleAddRule = () => {
    setRules([...rules, { sourceField: "", sourceValue: "", targetEntity: "", targetId: "" }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, field: keyof MappingRule, value: string) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, rules.filter((r) => r.sourceField && r.sourceValue && r.targetEntity && r.targetId));
    setName("");
    setRules([{ sourceField: "", sourceValue: "", targetEntity: "", targetId: "" }]);
    onClose();
  };

  const handleClose = () => {
    setName("");
    setRules([{ sourceField: "", sourceValue: "", targetEntity: "", targetId: "" }]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Attribution Mapping</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Mapping Name</Label>
            <Input
              id="name"
              placeholder="e.g., UTM Campaign to Meta Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mapping Rules</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRule}>
                <Plus className="h-4 w-4 mr-1" />
                Add Rule
              </Button>
            </div>

            {rules.map((rule, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Source Field</Label>
                  <Select
                    value={rule.sourceField}
                    onValueChange={(value) => handleRuleChange(index, "sourceField", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utm_source">UTM Source</SelectItem>
                      <SelectItem value="utm_medium">UTM Medium</SelectItem>
                      <SelectItem value="utm_campaign">UTM Campaign</SelectItem>
                      <SelectItem value="form_id">Form ID</SelectItem>
                      <SelectItem value="lead_source">Lead Source</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Source Value</Label>
                  <Input
                    placeholder="Value"
                    value={rule.sourceValue}
                    onChange={(e) => handleRuleChange(index, "sourceValue", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Target Entity</Label>
                  <Select
                    value={rule.targetEntity}
                    onValueChange={(value) => handleRuleChange(index, "targetEntity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="ad_set">Ad Set</SelectItem>
                      <SelectItem value="ad">Ad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Target ID</Label>
                  <Input
                    placeholder="ID"
                    value={rule.targetId}
                    onChange={(e) => handleRuleChange(index, "targetId", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRule(index)}
                  disabled={rules.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
