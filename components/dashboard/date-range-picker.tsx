"use client";

import * as React from "react";
import { format, subDays, differenceInDays, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Infinity } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  isAllTime?: boolean;
  onAllTimeChange?: (isAllTime: boolean) => void;
}

const PRESET_RANGES = [
  { label: "30 Days", days: 30 },
  { label: "60 Days", days: 60 },
  { label: "90 Days", days: 90 },
  { label: "120 Days", days: 120 },
  { label: "150 Days", days: 150 },
  { label: "180 Days", days: 180 },
];

function getMatchingPreset(date: DateRange | undefined): number | null {
  if (!date?.from || !date?.to) return null;
  
  const today = startOfDay(new Date());
  const toDate = startOfDay(date.to);
  const fromDate = startOfDay(date.from);
  
  // Check if 'to' date is today (within 1 day tolerance)
  const daysFromToday = Math.abs(differenceInDays(toDate, today));
  if (daysFromToday > 1) return null;
  
  // Calculate the range in days
  const rangeDays = differenceInDays(toDate, fromDate);
  
  // Check if it matches any preset (with 1 day tolerance)
  for (const preset of PRESET_RANGES) {
    if (Math.abs(rangeDays - preset.days) <= 1) {
      return preset.days;
    }
  }
  
  return null;
}

export function DateRangePicker({ date, onDateChange, isAllTime, onAllTimeChange }: DateRangePickerProps) {
  const activePreset = React.useMemo(() => {
    if (isAllTime) return null;
    return getMatchingPreset(date);
  }, [date, isAllTime]);

  const handleAllTimeClick = () => {
    if (onAllTimeChange) {
      onAllTimeChange(true);
    }
  };

  const handlePresetClick = (days: number) => {
    if (onAllTimeChange) {
      onAllTimeChange(false);
    }
    const today = new Date();
    const from = subDays(today, days);
    onDateChange({ from, to: today });
  };

  const handleDateSelect = (newDate: DateRange | undefined) => {
    if (onAllTimeChange) {
      onAllTimeChange(false);
    }
    // If only from is selected (single day click), set to = from for single day view
    if (newDate?.from && !newDate?.to) {
      onDateChange({ from: newDate.from, to: newDate.from });
    } else {
      onDateChange(newDate);
    }
  };

  const isCustomRange = !isAllTime && activePreset === null && date?.from;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESET_RANGES.map((preset) => (
        <Button
          key={preset.days}
          variant={activePreset === preset.days ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset.days)}
          className="whitespace-nowrap"
        >
          {preset.label}
        </Button>
      ))}
      
      <Button
        variant={isAllTime ? "default" : "outline"}
        size="sm"
        onClick={handleAllTimeClick}
        className="whitespace-nowrap"
      >
        <Infinity className="mr-1 h-4 w-4" />
        All Time
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustomRange ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && !isAllTime && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isAllTime ? (
              <span className="text-muted-foreground">Custom range</span>
            ) : date?.from ? (
              date.to && date.from.getTime() !== date.to.getTime() ? (
                <>
                  {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Custom range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={isAllTime ? undefined : date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
