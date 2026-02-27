"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  api,
  FieldMapping,
  UnmappedField,
} from "@/lib/api";
import {
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  Search,
} from "lucide-react";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  de: "German",
  it: "Italian",
  es: "Spanish",
  pt: "Portuguese",
  tr: "Turkish",
  fr: "French",
  ru: "Russian",
  ar: "Arabic",
};

export default function FieldMappingsPage() {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [unmappedFields, setUnmappedFields] = useState<UnmappedField[]>([]);
  const [standardFields, setStandardFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRawFieldName, setNewRawFieldName] = useState("");
  const [newMappedField, setNewMappedField] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mappingsData, unmappedData, standardFieldsData] = await Promise.all([
        api.getFieldMappings().catch(() => []),
        api.getUnmappedFields().catch(() => []),
        api.getStandardFields().catch(() => [
          'email', 'phone', 'full_name', 'first_name', 'last_name', 
          'city', 'province', 'country', 'date_of_birth', 'comments'
        ]),
      ]);
      setMappings(mappingsData);
      setUnmappedFields(unmappedData);
      setStandardFields(standardFieldsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Field mappings tablosu henüz oluşturulmamış. Lütfen Supabase'de tabloyu oluşturun.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMapping = async () => {
    if (!newRawFieldName || !newMappedField) return;

    setSaving(true);
    try {
      await api.createFieldMapping({
        rawFieldName: newRawFieldName,
        mappedField: newMappedField,
        language: newLanguage || undefined,
      });
      setIsAddModalOpen(false);
      setNewRawFieldName("");
      setNewMappedField("");
      setNewLanguage("");
      fetchData();
    } catch (error) {
      console.error("Failed to create mapping:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickMap = async (fieldName: string, mappedField: string) => {
    try {
      await api.createFieldMapping({
        rawFieldName: fieldName,
        mappedField: mappedField,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create mapping:", error);
    }
  };

  const handleDeleteMapping = async (id: string) => {
    if (!confirm("Bu mapping'i silmek istediğinize emin misiniz?")) return;

    try {
      await api.deleteFieldMapping(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete mapping:", error);
    }
  };

  const filteredMappings = mappings.filter(
    (m) =>
      m.raw_field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mapped_field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedMappings = filteredMappings.reduce((acc, mapping) => {
    const key = mapping.mapped_field;
    if (!acc[key]) acc[key] = [];
    acc[key].push(mapping);
    return acc;
  }, {} as Record<string, FieldMapping[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Field Mappings</h1>
          <p className="text-sm text-muted-foreground">
            Form alanlarını standart alanlara eşleştirin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Mapping
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
{`-- Supabase SQL Editor'da bu SQL'i çalıştırın:
CREATE TABLE IF NOT EXISTS field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_field_name VARCHAR(255) NOT NULL UNIQUE,
    mapped_field VARCHAR(100) NOT NULL,
    language VARCHAR(10),
    auto_detected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lead_field_data ADD COLUMN IF NOT EXISTS mapped_field_name VARCHAR(100);

ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON field_mappings FOR ALL USING (true);`}
            </pre>
          </CardContent>
        </Card>
      )}

      {unmappedFields.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Eşleştirilmemiş Alanlar ({unmappedFields.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unmappedFields.slice(0, 10).map((field) => (
                <div
                  key={field.fieldName}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm">{field.fieldName}</div>
                    <div className="text-xs text-muted-foreground">
                      {field.count} kayıt
                      {field.sampleValues.length > 0 && (
                        <span className="ml-2">
                          Örnek: {field.sampleValues.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {standardFields.slice(0, 5).map((sf) => (
                      <Button
                        key={sf}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleQuickMap(field.fieldName, sf)}
                      >
                        {sf}
                      </Button>
                    ))}
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        setNewRawFieldName(field.fieldName);
                        setIsAddModalOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {unmappedFields.length > 10 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  ve {unmappedFields.length - 10} daha...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Mevcut Mappingler ({mappings.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : Object.keys(groupedMappings).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Mapping bulunamadı
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMappings)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([mappedField, fieldMappings]) => (
                  <div key={mappedField} className="border rounded-lg">
                    <div className="px-4 py-2 bg-muted/50 border-b flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{mappedField}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {fieldMappings.length} eşleşme
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ham Alan Adı</TableHead>
                          <TableHead>Dil</TableHead>
                          <TableHead className="w-20">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fieldMappings.map((mapping) => (
                          <TableRow key={mapping.id}>
                            <TableCell className="font-mono text-sm">
                              {mapping.raw_field_name}
                            </TableCell>
                            <TableCell>
                              {mapping.language ? (
                                <Badge variant="outline">
                                  {LANGUAGE_LABELS[mapping.language] || mapping.language}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMapping(mapping.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Field Mapping</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ham Alan Adı</label>
              <Input
                placeholder="örn: e-mail-adresse"
                value={newRawFieldName}
                onChange={(e) => setNewRawFieldName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Standart Alan</label>
              <Select value={newMappedField} onValueChange={setNewMappedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {standardFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dil (opsiyonel)</label>
              <Select value={newLanguage} onValueChange={setNewLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Belirtilmemiş</SelectItem>
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleAddMapping}
              disabled={!newRawFieldName || !newMappedField || saving}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
