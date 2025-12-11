"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DateRangePickerProps {
  value?: DateRange; // must always contain { from, to }
  onChange?: (range: DateRange | undefined) => void;
}

export default function DateRangePicker({
  value,
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  // Internal fallback state must ALWAYS have full DateRange shape
  const [internalRange, setInternalRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Use external value if provided (controlled mode)
  const range = value ?? internalRange;

  // Sync internal state when controlled value changes
  useEffect(() => {
    if (value) {
      setInternalRange(value);
    }
  }, [value]);

  const handleSelect = (newRange: DateRange | undefined) => {
    if (onChange) onChange(newRange);
    else if (newRange) setInternalRange(newRange);
  };

  const isSelected = !!(range.from && range.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-2 px-3 py-2 h-full rounded-lg border text-sm transition-all
            ${isSelected ? "bg-[#5479EE] text-white" : "bg-white text-black"}
          `}
        >
          {isSelected ? (
            <span>
              {format(range.from!, "PP")} — {format(range.to!, "PP")}
            </span>
          ) : (
            <span>Date Range</span>
          )}

          {open ? (
            <ChevronUp className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start" className="p-0 w-fit">
        <Calendar
          mode="range"
          selected={range}      // must be { from, to }
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
