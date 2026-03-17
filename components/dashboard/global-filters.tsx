"use client";

import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GlobalFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  isAllTime: boolean;
  onAllTimeChange: (value: boolean) => void;
  accountFilter: string;
  onAccountFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (value: string) => void;
  languageFilter: string;
  onLanguageFilterChange: (value: string) => void;
  availableCountries: string[];
}

const AD_ACCOUNTS = [
  { id: "all", name: "All Accounts" },
  { id: "795450186742642", name: "Natural Clinic EU" },
  { id: "555680213653953", name: "Natural Clinic Turkey" },
  { id: "447318237318335", name: "Natural Care" },
];

const SERVICES = [
  { id: "all", name: "All Services" },
  { id: "Dental", name: "Dental" },
  { id: "Hair", name: "Hair Transplant" },
  { id: "Rhinoplasty", name: "Rhinoplasty" },
  { id: "BBL", name: "BBL" },
  { id: "Facelift", name: "Facelift" },
  { id: "Liposuction", name: "Liposuction" },
  { id: "Breast", name: "Breast Surgery" },
  { id: "Tummy Tuck", name: "Tummy Tuck" },
];

const LANGUAGES = [
  { id: "all", name: "All Languages" },
  { id: "EN", name: "English" },
  { id: "FR", name: "French" },
  { id: "DE", name: "German" },
  { id: "TR", name: "Turkish" },
  { id: "ES", name: "Spanish" },
  { id: "IT", name: "Italian" },
  { id: "AR", name: "Arabic" },
];

export function GlobalFilters({
  dateRange,
  onDateRangeChange,
  isAllTime,
  onAllTimeChange,
  accountFilter,
  onAccountFilterChange,
  countryFilter,
  onCountryFilterChange,
  serviceFilter,
  onServiceFilterChange,
  languageFilter,
  onLanguageFilterChange,
  availableCountries,
}: GlobalFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <DateRangePicker
        date={dateRange}
        onDateChange={onDateRangeChange}
        isAllTime={isAllTime}
        onAllTimeChange={onAllTimeChange}
      />

      <Select value={accountFilter} onValueChange={onAccountFilterChange}>
        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
          <SelectValue placeholder="Ad Account" />
        </SelectTrigger>
        <SelectContent>
          {AD_ACCOUNTS.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={countryFilter} onValueChange={onCountryFilterChange}>
        <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {availableCountries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={serviceFilter} onValueChange={onServiceFilterChange}>
        <SelectTrigger className="w-[150px] bg-white dark:bg-gray-900">
          <SelectValue placeholder="Service" />
        </SelectTrigger>
        <SelectContent>
          {SERVICES.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={languageFilter} onValueChange={onLanguageFilterChange}>
        <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.id} value={lang.id}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
