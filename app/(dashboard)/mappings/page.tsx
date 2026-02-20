"use client";

import { useState } from "react";
import { Plus, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddMappingModal } from "@/components/mappings/add-mapping-modal";

interface MappingRule {
  sourceField: string;
  sourceValue: string;
  targetEntity: string;
  targetId: string;
}

interface Mapping {
  id: string;
  name: string;
  rules: MappingRule[];
  createdAt: string;
}

export default function MappingsPage() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddMapping = (name: string, rules: MappingRule[]) => {
    const newMapping: Mapping = {
      id: Date.now().toString(),
      name,
      rules,
      createdAt: new Date().toISOString(),
    };
    setMappings([...mappings, newMapping]);
  };

  const handleDeleteMapping = (id: string) => {
    setMappings(mappings.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attribution Mappings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Map UTM parameters, form IDs, and lead sources to Meta campaign entities
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attribution Mappings</CardTitle>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </CardHeader>
        <CardContent>
          {mappings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-4 mb-4 dark:bg-gray-800">
                <Link2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No mappings configured
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                Add attribution mappings to link Zoho events to Meta campaigns
              </p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Mapping
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rules</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">{mapping.name}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {mapping.rules.length} rule(s)
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteMapping(mapping.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddMappingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddMapping}
      />
    </div>
  );
}
