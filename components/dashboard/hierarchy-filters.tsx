"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HierarchyFiltersProps {
  countries: string[];
  selectedCountry: string | null;
  selectedLevel: string | null;
  onCountryChange: (country: string | null) => void;
  onLevelChange: (level: string | null) => void;
}

const LEVEL_OPTIONS = [
  { value: "campaign", label: "Campaign" },
  { value: "adset", label: "Ad Set" },
  { value: "ad", label: "Ad" },
];

export function HierarchyFilters({
  countries,
  selectedCountry,
  selectedLevel,
  onCountryChange,
  onLevelChange,
}: HierarchyFiltersProps) {
  const hasFilters = selectedCountry || selectedLevel;

  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedCountry || "all"}
        onValueChange={(value) => onCountryChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedLevel || "all"}
        onValueChange={(value) => onLevelChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {LEVEL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onCountryChange(null);
            onLevelChange(null);
          }}
          className="h-9 px-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
